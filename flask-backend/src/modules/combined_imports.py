from genericpath import exists
from uuid import uuid1
from os import listdir
from os.path import basename, isdir, join, dirname, getsize
from re import compile
from sys import argv
from datetime import datetime

from modules.environment import BASE_PATH_TO_IMPORT
from modules.assemblies import deleteAssemblyByAssemblyID, import_assembly, FASTA_FILE_PATTERN
from modules.annotations import ANNOTATION_FILE_PATTERN, import_annotation
from modules.mappings import import_mapping
from modules.notifications import createNotification
from modules.analyses import import_analyses
from modules.tasks import addTask, isTaxonCurrentlyEdited, updateTask
from .producer import notify_worker

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
        "main_file": compile(r"^.*\.tbl$"),
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


def import_dataset_with_queue(
    taxon,
    assembly,
    userID,
    annotations=[],
    mappings=[],
    buscos=[],
    fcats=[],
    milts=[],
    repeatmaskers=[],
    append_assembly_id=0,
):
    try:
        taskID = str(uuid1())

        currently_edited = isTaxonCurrentlyEdited(taxon["id"])
        if currently_edited:
            return {"id": taskID, "status": "aborted", "startTime": datetime.now()}, createNotification(
                "Error", "Import not started. Taxon is currently edited!", "error"
            )

        addTask(taskID, taxon["id"])

        notify_worker(
            "Import",
            "Dataset",
            {
                "taxon": taxon,
                "assembly": assembly,
                "userID": userID,
                "annotations": annotations,
                "mappings": mappings,
                "buscos": buscos,
                "fcats": fcats,
                "milts": milts,
                "repeatmaskers": repeatmaskers,
                "append_assembly_id": append_assembly_id,
            },
            taskID,
        )

        return {"id": taskID, "status": "running", "startTime": datetime.now()}, createNotification(
            "Success", "Import started. You will be notified when it finished!", "success"
        )

    except Exception as err:
        return {"id": "", "status": "aborted", "startTime": datetime.now()}, createNotification(
            message=f"StartImportError: {str(err)}"
        )


# import for all possible data
def importDataset(
    taxon,
    assembly,
    userID,
    annotations=[],
    mappings=[],
    buscos=[],
    fcats=[],
    milts=[],
    repeatmaskers=[],
    append_assembly_id=0,
    taskID="",
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
    notifications = []
    process = 0

    if not taxon:
        return summary, createNotification(message="Missing taxon information!")

    if not assembly and not append_assembly_id:
        return summary, createNotification(message="Missing assembly!")

    if not userID:
        return summary, createNotification(message="Missing user information!")

    if not append_assembly_id:
        assembly_id = None
        try:
            if len(assembly) != 1:
                return summary, createNotification(message="Exact one assembly needs to be supplied!")

            assembly = assembly[0]

            assembly_id, notification = import_assembly(taxon, assembly, userID, taskID)
            if not assembly_id:
                return summary, notification
            summary["assemblyID"] = assembly_id
        except Exception as err:
            if assembly_id:
                deleteAssemblyByAssemblyID(assembly_id)
            return summary, createNotification(message=f"CombinedImportError1: {str(err)}!")
    else:
        assembly_id = append_assembly_id

    try:
        if taskID:
            progress = 30
            updateTask(taskID, "running", progress)
    except:
        pass

    try:
        for idx, annotation in enumerate(annotations):
            annotation_id, notification = import_annotation(taxon, assembly_id, annotation, userID)
            if annotation_id:
                summary["annotationIDs"] += [annotation_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 20 // len(annotations)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 50
                updateTask(taskID, "running", progress)
        except:
            pass

        for mapping in mappings:
            mapping_id, notification = import_mapping(taxon, assembly_id, mapping, userID)
            if mapping_id:
                summary["mappingIDs"] += [mapping_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(mappings)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 60
                updateTask(taskID, "running", progress)
        except:
            pass

        for busco in buscos:
            busco_id, notification = import_analyses(taxon, assembly_id, busco, "busco", userID)
            if busco_id:
                summary["buscoIDs"] += [busco_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 20 // len(buscos)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 70
                updateTask(taskID, "running", progress)
        except:
            pass

        for fcat in fcats:
            fcat_id, notification = import_analyses(taxon, assembly_id, fcat, "fcat", userID)
            if fcat_id:
                summary["fcatIDs"] += [fcat_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(fcats)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 80
                updateTask(taskID, "running", progress)
        except:
            pass

        for milt in milts:
            milt_id, notification = import_analyses(taxon, assembly_id, milt, "milts", userID)
            if milt_id:
                summary["miltsIDs"] += [milt_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(milts)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 90
                updateTask(taskID, "running", progress)
        except:
            pass

        for repeatmasker in repeatmaskers:
            repeatmasker_id, notification = import_analyses(taxon, assembly_id, repeatmasker, "repeatmasker", userID)
            if repeatmasker_id:
                summary["repeatmaskerIDs"] += [repeatmasker_id]
            else:
                notifications += notification

            try:
                if taskID:
                    progress += 10 // len(repeatmaskers)
                    updateTask(taskID, "running", round(progress))
            except:
                pass

        try:
            if taskID:
                progress = 100
                updateTask(taskID, "running", progress)
        except:
            pass

        if len(notifications) == 0:
            notifications += createNotification("Success", "All files successfully imported!", "success")

        return summary, notifications
    except Exception as err:
        deleteAssemblyByAssemblyID(assembly_id)
        return summary, createNotification(message=f"CombinedImportError2: {str(err)}")


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
