from genericpath import exists
from uuid import uuid1
from os import listdir
from os.path import basename, isdir, join, dirname, getsize
from re import compile
from sys import argv

from modules.environment import BASE_PATH_TO_IMPORT
from modules.assemblies import import_assembly, FASTA_FILE_PATTERN
from modules.annotations import ANNOTATION_FILE_PATTERN, import_annotation
from modules.notifications import createNotification

FILE_PATTERN_DICT = {
    "image": {
        "main_file": compile(r"^(.*\.jpg$)|(.*\.jpeg$)|(.*\.png$)|(.*\.jfif$)"),
        "default_parent_dir": None,
        "additional_files": [],
    },
    "sequence": FASTA_FILE_PATTERN,
    "annotation": ANNOTATION_FILE_PATTERN,
    "mapping": {
        "main_file": compile(r"^(.*\.bam$)|(.*\.bam\.gz$)"),
        "default_parent_dir": None,
        "additional_files": [],
    },
    "milts": {
        "main_file": compile(r"^.*3D_plot.*\.html$"),
        "default_parent_dir": compile(r"^.*MILTS_report_.*$"),
        "additional_files": [
            compile(r"^.*gene_table_taxon_assignment.*\.csv$"),
            compile(r"^.*pca_summary.*\.csv$"),
            compile(r"^.*pca_loadings.*\.csv$"),
        ],
    },
    "busco": {
        "main_file": compile(r"^(.*short_summary.*\.txt$)"),
        "default_parent_dir": compile(r"^(.*run_.*$)"),
        "additional_files": [
            compile(r"^.*full_table.*\.tsv$"),
            compile(r"^.*missing(_busco_list)?.*\.tsv$"),
            compile(r"^.*busco_sequences.*$"),
            compile(r"^.*hmmer_output.*$"),
        ],
    },
    "fcat": {
        "main_file": compile(r"^(.*report_summary.*\.txt$)"),
        "default_parent_dir": compile(r"^(.*\w+@\d+@.*$)"),
        "additional_files": [
            compile(r"^.*ignored.*\.txt$"),
            compile(r"^.*missing.*\.txt$"),
            compile(r"^.*report_dismiss.*\.txt$"),
            compile(r"^.*last_refspec.*\.txt$"),
            compile(r"^.*report_full.*\.txt$"),
            compile(r"^.*genome_dir.*$"),
            compile(r"^.*phyloprofileOutput.*$"),
        ],
    },
    "repeatmasker": {
        "main_file": compile(r"^(.*\.tbl$)"),
        "default_parent_dir": None,
        "additional_files": [compile(r"^(.*\.align$)"), compile(r"^(.*\.out$)")],
    },
}

MAXIMUM_VALIDATION_NUMBER_PER_TYPE_PER_REQUEST = 5


# FETCH IMPORT DIRECTORY IN JSON FORMAT
def fetchImportDirectory(path=BASE_PATH_TO_IMPORT):
    """
    Generates file tree of the import directory!
    """

    def pathToJson(path):
        relative_path = path[len(BASE_PATH_TO_IMPORT) :]

        path_info = {
            "id": uuid1(),
            "name": basename(path),
            "path": relative_path,
        }

        if isdir(path):
            for t in FILE_PATTERN_DICT:
                if FILE_PATTERN_DICT[t]["default_parent_dir"]:
                    if FILE_PATTERN_DICT[t]["default_parent_dir"].match(path_info["name"]):
                        path_info.update({"dirType": t})
                        break

                if len(FILE_PATTERN_DICT[t]["additional_files"]):
                    for af in FILE_PATTERN_DICT[t]["additional_files"]:
                        if af.match(path_info["name"]):
                            path_info.update({"additionalFilesType": t})
                            break

            path_info["children"] = [pathToJson(join(path, x)) for x in listdir(path)]

        else:
            for t in FILE_PATTERN_DICT:
                if FILE_PATTERN_DICT[t]["main_file"].match(path_info["name"]):
                    path_info.update({"type": t, "size": getsize(path) // 1000000})
                    break

                if len(FILE_PATTERN_DICT[t]["additional_files"]):
                    for af in FILE_PATTERN_DICT[t]["additional_files"]:
                        if af.match(path_info["name"]):
                            path_info.update({"additionalFilesType": t})
                            break

        return path_info

    if path[-1] == "/":
        path = path[:-1]

    return pathToJson(path), {}


def __getSupportedFiles(file_info, type):
    if type not in FILE_PATTERN_DICT:
        return [], []

    if FILE_PATTERN_DICT[type]["main_file"].match(file_info["name"]):
        return [file_info], []

    if len(FILE_PATTERN_DICT[type]["additional_files"]):
        for af in FILE_PATTERN_DICT[type]["additional_files"]:
            if af.match(file_info["name"]):
                return [], [file_info]

    if "children" in file_info:
        child_main_files, child_additional_files = [], []
        for x in file_info["children"]:
            new_child_main_files, new_child_additional_files = __getSupportedFiles(x, type)
            child_main_files += new_child_main_files
            child_additional_files += new_child_additional_files
        return child_main_files, child_additional_files

    return [], []


def validateFileInfo(file_info, forceType=""):
    datasets = {}
    if not forceType or forceType not in FILE_PATTERN_DICT:
        for type in FILE_PATTERN_DICT:
            main_files, additional_files = __getSupportedFiles(file_info, type)
            if len(main_files) > 0:
                subsets = []
                paths = {}
                for file in main_files:
                    dir = dirname(file["path"])
                    if dir not in paths:
                        paths.update({dir: 1})
                    else:
                        paths[dir] += 1
                    subsets.append({"main_file": file, "additional_files": additional_files})
                datasets[type] = [
                    x
                    for x in subsets
                    if paths[dirname(x["main_file"]["path"])] < MAXIMUM_VALIDATION_NUMBER_PER_TYPE_PER_REQUEST
                ]

    else:
        main_files, additional_files = __getSupportedFiles(file_info, forceType)
        if len(main_files):
            subsets = []
            paths = []
            for file in main_files:
                dir = dirname(file["path"])
                if dir not in paths:
                    paths.update({dir: 1})
                else:
                    paths[dir] += 1
                subsets.append({"main_file": file, "additional_files": additional_files})
            datasets[forceType] = [
                x
                for x in subsets
                if paths[dirname(x["main_file"]["path"])] < MAXIMUM_VALIDATION_NUMBER_PER_TYPE_PER_REQUEST
            ].sort(key=lambda d: d["name"])

    if len(datasets) <= 0:
        return {}, createNotification("Info", "No valid dataset detetcted!", "info")

    return datasets, createNotification("Success", "At least one valid dataset detetcted!", "success")


# import for all possible data
def importDataset(
    taxon, assembly, userID, annotations=[], mappings=[], buscos=[], fcats=[], milts=[], repeatmaskers=[]
):
    """
    Imports assembly with all supported datasets (annotations, mappings, Busco, fCat, Milts, Repeatmasker)
    """
    summary = {
        "assemblyID": None,
        "annotationIDs": [],
        "mappingIDs": [],
        "buscoIDs": [],
        "fcatIDs": [],
        "miltsIDs": [],
        "repeatmaskerIDs": [],
    }
    errors = []

    # assembly_id, error = import_assembly(taxon, assembly, userID)
    # if not assembly_id:
    #     return 0, error
    # summary["assemblyID"] = assembly_id
    # errors += error

    # for annotation in annotations:
    #     annotation_id, error = import_annotation(taxon, 1, annotation, userID)
    #     if annotation_id:
    #         summary["annotationIDs"] += [annotation_id]
    #     errors += error

    # return summary, errors


def readArgs():
    args = argv[1:]

    if "-h" in args or "--help" in args:
        print("Help!")
        return 0

    if not len(args):
        print("No arguments provided!")
        return 0

    if not exists(args[0]):
        print("Assembly file path does not exist!")
        return 0

    if BASE_PATH_TO_IMPORT not in args[0]:
        print(f"All files need to be in the following directory to be imported:\n\n{BASE_PATH_TO_IMPORT}!")
        return 0

    if not FILE_PATTERN_DICT["sequence"].match(args[0]):
        print("Assembly file pattern does not match type FASTA!")
        return 0

    assembly_path = args[0]

    return assembly_path


# if __name__ == "__main__":
#     assembly_path = readArgs()

#     importDataset({"scientificName": "Trichinella nelsoni"}, assembly_path, 1)

# TODO: ADD CLI USER TO DATABASE
