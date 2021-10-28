import mysql.connector
from os import makedirs, remove
from os.path import exists, isdir, isfile
from shutil import copy, rmtree, copytree
from glob import glob
from PIL import Image
from subprocess import run
from re import compile
import pika
import json

from .Mysql import HOST_URL as MYSQL_HOST_URL

BASE_PATH_TO_IMPORT = "/flask-backend/data/import/"

from .Paths import BASE_PATH_TO_JBROWSE, JBROWSEGENERATENAMESCALL, BASE_PATH_TO_STORAGE, BASE_PATH_TO_UPLOAD

# images
SIZE = 256, 256

STORAGEERROR = {
    "label": "Error",
    "message": "Something went wrong while formatting or moving it to storage!",
    "type": "error",
}

RABBIT_MQ_QUEUE_RESOURCE="resource"

pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='127.0.0.1', port=5672))
pika_channel = pika_connection.channel()
pika_channel.queue_declare(queue=RABBIT_MQ_QUEUE_RESOURCE, durable=True)

class FileManager:
    def __init__(self):
        self.hostURL = MYSQL_HOST_URL

    # ====== GENERAL ====== #
    # reconnect to get updates
    def updateConnection(self, database="g-nom_dev"):
        connection = mysql.connector.connect(
            host=self.hostURL,
            user="root",
            password="JaghRMI104",
            database=database,
            auth_plugin="mysql_native_password",
        )
        cursor = connection.cursor()

        return connection, cursor

    #####################################################################################################
    # ========================================== FILE IMPORT ========================================== #

    # reload names.dmp/nodes.dmp
    def reloadTaxonFilesFromNCBI(self):
        """
        reload names.dmp and nodes.dmp from NCBO
        """

        try:
            self.deleteFile(f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/taxdmp.zip")
            run(
                [
                    "wget",
                    "-P",
                    f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/",
                    "https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip",
                ]
            )
            run(
                [
                    "unzip",
                    "-o",
                    f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/taxdmp.zip",
                    "-d",
                    f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/",
                ]
            )
            self.deleteFile(f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/taxdmp.zip")
        except:
            return 0, {
                "label": "Error",
                "message": "Error while fetching ncbi dumps!",
                "type": "error",
            }

        return 1, {}

    # FETCH ALL FILES IN IMPORT DIRECTORY
    def fetchPossibleImports(
        self,
        types=["image", "fasta", "gff", "bam", "analysis"],
        import_directory=BASE_PATH_TO_IMPORT,
    ):
        """
        Fetch all files provided in import dirctory
        """

        if not isinstance(types, list):
            types = ["image", "fasta", "gff", "bam", "analysis"]

        FILE_TYPE_EXTENSION_PATTERNS = {
            "image": {
                ".jpg": "**/*.jpg",
                ".jpeg": "**/*.jpeg",
                ".png": "**/*.png",
                ".jfif": "**/*.jfif",
            },
            "fasta": {
                ".fasta": "**/*.fasta",
                ".fa": "**/*.fa",
                ".faa": "**/*.faa",
                ".fna": "**/*.fna",
            },
            "gff": {
                ".gff": "**/*.gff",
                ".gff3": "**/*.gff3",
            },
            "bam": {
                ".bam": "**/*.bam",
            },
            "analysis": {
                "milts": "**/*3D_plot*.html",
                "busco": "**/*short_summary*.txt",
                "fcat": "**/*report_summary*.txt",
                "repeatmasker": "**/*.tbl",
            },
        }

        # check if import directory exist or create
        if not exists(import_directory):
            if not exists(BASE_PATH_TO_IMPORT):
                makedirs(BASE_PATH_TO_IMPORT, exist_ok=True)
            return 0, {
                "label": "Info",
                "message": f"Import directory deleted from file system. Created directory: '{BASE_PATH_TO_IMPORT}'",
                "type": "info",
            }

        # search for all files that are supported
        possibleImports = {}
        possibleImportsCount = 0
        for type in types:
            type = type.lower()
            if type in FILE_TYPE_EXTENSION_PATTERNS:
                possibleImports.update({type: {}})
                for extension in FILE_TYPE_EXTENSION_PATTERNS[type]:
                    regex = FILE_TYPE_EXTENSION_PATTERNS[type][extension]
                    fileListPerTypePerExtension = []
                    for filePath in glob(import_directory + regex, recursive=True):
                        pathSplit = filePath.split("/")[1:]
                        basePathLength = len(
                            [x for x in import_directory.split("/") if x != ""]
                        )
                        fileListPerTypePerExtension.append(pathSplit[basePathLength:])
                        possibleImportsCount += 1

                    possibleImports[type].update(
                        {extension: fileListPerTypePerExtension}
                    )
            else:
                return 0, {
                    "label": "Error",
                    "message": f"File type {type} unknown!",
                    "type": "error",
                }

        return possibleImports, {
            "label": "Info",
            "message": f"{possibleImportsCount} possible files were detected!",
            "type": "info",
        }

    def moveImageToStorage(path, name):
        try:
            with Image.open(path) as image:
                image.thumbnail(SIZE)
                if not name:
                    return 0, {
                        "label": "Error",
                        "message": "No NCBI taxonID for renaming thumbnail was provided!",
                        "type": "error",
                    }
                newPath = (
                    f"{BASE_PATH_TO_STORAGE}taxa/images/" + name + ".thumbnail.jpg"
                )

                image.save(newPath, "JPEG")
        except:
            return 0, STORAGEERROR
        return newPath, {}

    def moveAssemblyToStorage(self, mainFile, name="", additionalFiles=""):
        path = f"{BASE_PATH_TO_UPLOAD}{mainFile}"
        if not exists(path):
            return 0, {
                "label": "Error",
                "message": "Path to file not found!",
                "type": "error",
            }

        if additionalFiles:
            additionalFilesPath = f"{BASE_PATH_TO_IMPORT}{additionalFiles}/"

            if additionalFilesPath != BASE_PATH_TO_IMPORT:
                if not exists(additionalFilesPath):
                    return 0, {
                        "label": "Error",
                        "message": "Path to additional files not found!",
                        "type": "error",
                    }
            else:
                return 0, {
                    "label": "Error",
                    "message": "Import of complete Upload directory is not allowed!",
                    "type": "error",
                }

        newPath = ""
        status, notification = self.createDirectoriesForSpecies(name)

        if not status:
            return 0, notification

        try:
            newPath = f"{BASE_PATH_TO_STORAGE}assemblies/{name}/fasta/dna/{name}_assembly.fasta"
            copy(path, newPath)
        except:
            return 0, STORAGEERROR

        if additionalFiles:
            try:
                additionalFilesDir = additionalFiles.split("/")[-1]
                newAdditionalFilesPath = f"{BASE_PATH_TO_STORAGE}assemblies/{name}/fasta/dna/additionalFiles/{additionalFilesDir}"
                copytree(
                    additionalFilesPath, newAdditionalFilesPath, dirs_exist_ok=True
                )
                self.deleteFile(
                    f"{BASE_PATH_TO_STORAGE}assemblies/{name}/fasta/dna/additionalFiles/{mainFile}"
                )
            except:
                self.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
                return 0, {
                    "label": "Error",
                    "message": "Error copying additional files!",
                    "type": "error",
                }
        return newPath, {}

    def notify_assembly(self, assemblyId, name, path):
        payload = {"assembly": { "name": name, "id": assemblyId}, "storage_path": path, "type": "Assembly", "action": "Added" }
        pika_channel.basic_publish(exchange='', routing_key=RABBIT_MQ_QUEUE_RESOURCE, body=json.dumps(payload))

    def moveAnnotationToStorage(self, assemblyName, name, path, additionalFiles, additionalFilesPath, mainFile):
        try:
            fullPathToAnnoation = (
                f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyName}/gff3/{name}/"
            )

            makedirs(
                fullPathToAnnoation,
                exist_ok=True,
            )
            newPath = f"{fullPathToAnnoation}{name}_genomic_annotation.gff3"
            copy(path, newPath)
        except:
            self.deleteDirectories(fullPathToAnnoation)
            return 0, STORAGEERROR

        if additionalFiles:
            try:
                additionalFilesDir = additionalFiles.split("/")[-1]
                newAdditionalFilesPath = (
                    f"{fullPathToAnnoation}additionalFiles/{additionalFilesDir}"
                )
                copytree(
                    additionalFilesPath, newAdditionalFilesPath, dirs_exist_ok=True
                )
                self.deleteFile(f"{fullPathToAnnoation}/additionalFiles/{mainFile}")
            except:
                self.deleteDirectories(fullPathToAnnoation)
                return 0, {
                    "label": "Error",
                    "message": "Error copying additional files!",
                    "type": "error",
                }

        try:
            newPathSorted = newPath.replace(".gff3", ".sorted.gff3")
            run(
                f'(grep ^"#" {newPath}; grep -v ^"#" {newPath} | grep -v "^$" | grep "\t" | sort -k1,1 -k4,4n) > {newPathSorted}',
                shell=True,
            )
            # TODO: Check why no track data is visible on low coverage annotation tracks when using gt
            # run(
            #     [
            #         "gt",
            #         "gff3",
            #         "-sortlines",
            #         "-tidy",
            #         "-retainids",
            #         "-o",
            #         newPathSorted,
            #         newPath,
            #     ]
            # )
            self.deleteFile(newPath)
        except:
            self.deleteDirectories(fullPathToAnnoation)
            return 0, {
                "label": "Error",
                "message": "Error sorting gff3 by grep!",
                "type": "error",
            }
        
        newPath = newPathSorted
        return newPath, {}

    def notify_annotation(self, assemblyId, assemblyName, name, path):
        payload = {"assembly": { "name": assemblyName, "id": assemblyId}, "storage_path": path, "annotation_name": name, "type": "Annotation", "action": "Added" }
        pika_channel.basic_publish(exchange='', routing_key=RABBIT_MQ_QUEUE_RESOURCE, body=json.dumps(payload))

    def moveMappingToStorage(self, assemblyName, name, path, additionalFiles, additionalFilesPath):
        try:
            fullPathToMapping = (
                f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyName}/mappings/{name}/"
            )

            makedirs(
                fullPathToMapping,
                exist_ok=True,
            )
            newPath = f"{fullPathToMapping}{name}_mapping.bam"
            copy(path, newPath)
        except:
            self.deleteDirectories(fullPathToMapping)
            return 0, STORAGEERROR

        if additionalFiles:
            try:
                additionalFilesDir = additionalFiles.split("/")[-1]
                newAdditionalFilesPath = (
                    f"{fullPathToMapping}additionalFiles/{additionalFilesDir}"
                )
                copytree(
                    additionalFilesPath, newAdditionalFilesPath, dirs_exist_ok=True
                )
                self.deleteFile(f"{fullPathToMapping}/additionalFiles/{mainFile}")
            except:
                self.deleteDirectories(fullPathToMapping)
                return 0, {
                    "label": "Error",
                    "message": "Error copying additional files!",
                    "type": "error",
                }
        
        return newPath, {}

    def notify_mapping(self, assemblyId, assemblyName, name, path):
        payload = {"assembly": { "name": assemblyName, "id": assemblyId}, "storage_path": path, "mapping_name": name, "type": "Mapping", "action": "Added" }
        pika_channel.basic_publish(exchange='', routing_key=RABBIT_MQ_QUEUE_RESOURCE, body=json.dumps(payload))
    
    # MOVE FILES IN IMPORT DIRECTORY TO STORAGE DIRECTORY
    def moveFileToStorage(
        self,
        type,
        mainFile,
        name="",
        additionalFiles="",
        assemblyName="",
    ):
        """
        Moves selected file to proper storage location
        """

        path = f"{BASE_PATH_TO_UPLOAD}{mainFile}"
        if not exists(path):
            return 0, {
                "label": "Error",
                "message": "Path to file not found!",
                "type": "error",
            }

        if additionalFiles:
            additionalFilesPath = f"{BASE_PATH_TO_UPLOAD}{additionalFiles}/"

            if additionalFilesPath != BASE_PATH_TO_UPLOAD:
                if not exists(additionalFilesPath):
                    return 0, {
                        "label": "Error",
                        "message": "Path to additional files not found!",
                        "type": "error",
                    }
            else:
                return 0, {
                    "label": "Error",
                    "message": "Import of complete Upload directory is not allowed!",
                    "type": "error",
                }

        newPath = ""
        if type == "image":
            return self.moveImageToStorage(path, name)

        elif type == "annotation":
            return self.moveAnnotationToStorage(assemblyName, name, path, additionalFiles, additionalFilesPath, mainFile)

        elif type == "mapping":
            return self.moveMappingToStorage(assemblyName, name, path, additionalFiles, additionalFilesPath)

        elif (
            type == "milts"
            or type == "busco"
            or type == "fcat"
            or type == "repeatmasker"
        ):
            try:
                fullPathToAnalysis = (
                    f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyName}/{type}/{name}/"
                )
                makedirs(
                    fullPathToAnalysis,
                    exist_ok=True,
                )
                if type == "milts":
                    newPath = (
                        f"{fullPathToAnalysis}milts_taxonomic_assignment_plot.html"
                    )
                    oldPathToParentDir = "/".join(path.split("/")[:-2])
                    gene_table = glob(
                        f"{oldPathToParentDir}/**/gene_table_taxon_assignment.csv",
                        recursive=True,
                    )
                    if len(gene_table) == 1:
                        gene_table = gene_table[0]
                        gene_table_filename = gene_table.split("/")[-1]
                        copy(
                            gene_table,
                            f"{fullPathToAnalysis}milts_{gene_table_filename}",
                        )
                    pca_clustering = glob(
                        f"{oldPathToParentDir}/**/pca_summary.csv", recursive=True
                    )
                    if len(pca_clustering) == 1:
                        pca_clustering = pca_clustering[0]
                        pca_clustering_filename = pca_clustering.split("/")[-1]
                        copy(
                            pca_clustering,
                            f"{fullPathToAnalysis}milts_{pca_clustering_filename}",
                        )
                    pca_loadings = glob(
                        f"{oldPathToParentDir}/**/pca_loadings.csv", recursive=True
                    )
                    if len(pca_loadings) == 1:
                        pca_loadings = pca_loadings[0]
                        pca_loadings_filename = pca_loadings.split("/")[-1]
                        copy(
                            pca_loadings,
                            f"{fullPathToAnalysis}milts_{pca_loadings_filename}",
                        )
                elif type == "busco":
                    newPath = f"{fullPathToAnalysis}busco_short_summary.txt"
                    oldPathToParentDir = "/".join(path.split("/")[:-1])
                    if isdir(f"{oldPathToParentDir}/busco_sequences/"):
                        copytree(
                            f"{oldPathToParentDir}/busco_sequences/",
                            f"{fullPathToAnalysis}busco_sequences/",
                        )
                    if isfile(f"{oldPathToParentDir}/full_table.tsv"):
                        copy(
                            f"{oldPathToParentDir}/full_table.tsv",
                            f"{fullPathToAnalysis}busco_full_table.tsv",
                        )
                    if isfile(f"{oldPathToParentDir}/missing_busco_list.tsv"):
                        copy(
                            f"{oldPathToParentDir}/missing_busco_list.tsv",
                            f"{fullPathToAnalysis}busco_missing.tsv",
                        )
                elif type == "fcat":
                    newPath = f"{fullPathToAnalysis}fcat_report_summary.txt"
                    oldPathToParentDir = "/".join(path.split("/")[:-1])
                    if isdir(f"{oldPathToParentDir}/genome_dir/"):
                        copytree(
                            f"{oldPathToParentDir}/genome_dir/",
                            f"{fullPathToAnalysis}genome_dir/",
                        )
                    if isdir(f"{oldPathToParentDir}/phyloprofileOutput/"):
                        copytree(
                            f"{oldPathToParentDir}/phyloprofileOutput/",
                            f"{fullPathToAnalysis}phyloprofileOutput/",
                        )
                    if isfile(f"{oldPathToParentDir}/ignored.txt"):
                        copy(
                            f"{oldPathToParentDir}/ignored.txt",
                            f"{fullPathToAnalysis}fcat_ignored.txt",
                        )
                    if isfile(f"{oldPathToParentDir}/last_refspec.txt"):
                        copy(
                            f"{oldPathToParentDir}/last_refspec.txt",
                            f"{fullPathToAnalysis}fcat_last_refspec.txt",
                        )
                    if isfile(f"{oldPathToParentDir}/missing.txt"):
                        copy(
                            f"{oldPathToParentDir}/missing.txt",
                            f"{fullPathToAnalysis}fcat_missing.txt",
                        )
                    if isfile(f"{oldPathToParentDir}/report_dismiss.txt"):
                        copy(
                            f"{oldPathToParentDir}/report_dismiss.txt",
                            f"{fullPathToAnalysis}fcat_report_dismiss.txt",
                        )
                    if isfile(f"{oldPathToParentDir}/report_full.txt"):
                        copy(
                            f"{oldPathToParentDir}/report_full.txt",
                            f"{fullPathToAnalysis}fcat_report_full.txt",
                        )
                    if isfile(f"{oldPathToParentDir}/report_dismiss.txt"):
                        copy(
                            f"{oldPathToParentDir}/report_dismiss.txt",
                            f"{fullPathToAnalysis}fcat_report_dismiss.txt",
                        )
                    frags = glob(f"{oldPathToParentDir}/*frag*complete.txt")
                    if len(frags) == 1:
                        frags = frags[0]
                        frags_filename = frags.split("/")[-1]
                        copy(frags, f"{fullPathToAnalysis}fcat_{frags_filename}")
                elif type == "repeatmasker":
                    newPath = f"{fullPathToAnalysis}repeatmasker_summary.tbl"
                    oldPathToParentDir = "/".join(path.split("/")[:-1])
                    out = glob(f"{oldPathToParentDir}/*.out")
                    if len(out) == 1:
                        out = out[0]
                        out_filename = out.split("/")[-1]
                        copy(out, f"{fullPathToAnalysis}repeatmasker_{out_filename}")
                    masked = glob(f"{oldPathToParentDir}/*.masked")
                    if len(masked) == 1:
                        masked = masked[0]
                        masked_filename = masked.split("/")[-1]
                        copy(
                            masked,
                            f"{fullPathToAnalysis}repeatmasker_{masked_filename}",
                        )
                copy(path, newPath)
            except:
                self.deleteDirectories(fullPathToAnalysis)
                return 0, STORAGEERROR

            if type == "milts":
                try:
                    with open(newPath, "r") as plotFile:
                        plot_data = "".join(plotFile.readlines()).replace("\n", "")
                        plot_data = plot_data.replace('"title":"taxonomic assignment"', f'"title":"{name}"')
                        plotFile.close()

                    with open(
                        "src/Tools/templates/milts_head_template.html", "r"
                    ) as milts_template_file:
                        milts_template = milts_template_file.readlines()
                        milts_template_file.close()

                    body_regex = compile(r"<body>.*</body>")
                    body_match = body_regex.findall(plot_data)
                    if len(body_match) != 1:
                        return 0, {
                            "label": "Error",
                            "message": "Error using template html!",
                            "type": "error",
                        }

                    for i in range(len(milts_template)-1, len(milts_template)-5, -1):
                        if ("<body>REPLACE_BODY</body>" in milts_template[i]):
                            milts_template[i] = milts_template[i].replace("<body>REPLACE_BODY</body>", body_match[0])
                        elif ("<title>REPLACE_TITLE</title>" in milts_template[i]):
                            milts_template[i] = milts_template[i].replace("REPLACE_TITLE", name)
                            break

                    with open(newPath, "w") as plotFile:
                        plotFile.writelines(milts_template)
                        plotFile.close()
                except Exception as err:
                    print(str(err))
                    self.deleteDirectories(fullPathToAnalysis)
                    return 0, STORAGEERROR

            if additionalFiles:
                try:
                    additionalFilesDir = additionalFiles.split("/")[-1]
                    newAdditionalFilesPath = (
                        f"{fullPathToAnalysis}additionalFiles/{additionalFilesDir}"
                    )
                    copytree(
                        additionalFilesPath, newAdditionalFilesPath, dirs_exist_ok=True
                    )
                    self.deleteFile(f"{fullPathToAnalysis}/additionalFiles/{mainFile}")
                except:
                    self.deleteDirectories(fullPathToAnalysis)
                    return 0, {
                        "label": "Error",
                        "message": "Error copying additional files!",
                        "type": "error",
                    }

        else:
            return 0, {
                "label": "Error",
                "message": "Unsupported type!",
                "type": "error",
            }

        return newPath, {}

    def removeTrackFromJbrowse(self, assemblyName, name, type):
        if type == "annotation":
            trackStart = f"[tracks.Annotation_{name}]\n"
            fileLabel = f"{name}_genomic_annotation"
        elif type == "mapping":
            trackStart = f"[tracks.Mapping_{name}]\n"
            fileLabel = f"{name}_mapping"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown type for jbrowse!",
                "type": "error",
            }

        try:
            for file in listdir(f"{BASE_PATH_TO_JBROWSE}{assemblyName}"):
                if file.startswith(fileLabel):
                    run(["rm", f"{BASE_PATH_TO_JBROWSE}{assemblyName}/{file}"])
        except:
            return 0, {
                "label": "Error",
                "message": "Error while removing from jbrowse track file!",
                "type": "error",
            }

        try:
            with open(f"{BASE_PATH_TO_JBROWSE}{assemblyName}/tracks.conf", "r") as conf:
                lines = conf.readlines()
                conf.close()

            for index, line in enumerate(lines):
                if line == trackStart:
                    lines.pop(index)
                    lines.pop(index)
                    lines.pop(index)
                    lines.pop(index)
                    break

            with open(f"{BASE_PATH_TO_JBROWSE}{assemblyName}/tracks.conf", "w") as conf:
                conf.writelines(lines)
                conf.close()
        except:
            return 0, {
                "label": "Error",
                "message": "Error while removing from jbrowse track file!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": "Successfully removed track from jbrowse!",
            "type": "success",
        }

    # delete file from file system
    def deleteFile(self, path):
        """
        Deletes files
        """

        if not exists(path):
            return 1, {}

        try:
            remove(path)
        except:
            return 0, {
                "label": "Error",
                "message": "File could not be deleted. Check yourself!",
                "type": "error",
            }

        return 1, {}

    # delete directories recursively
    def deleteDirectories(self, path):
        """
        Deletes directories
        """

        if not exists(path):
            return 1, {}

        try:
            rmtree(path)
        except:
            return 0, {
                "label": "Error",
                "message": "Directory could not be deleted. Check yourself!",
                "type": "error",
            }

        return 1, {}

    # rename jbrowse track data
    def renameJbrowseTrack(self, assemblyName, type, oldName, newName):
        """
        rename jbrowse track data
        """
        try:
            with open(f"{BASE_PATH_TO_JBROWSE}{assemblyName}/tracks.conf", "r") as conf:
                lines = conf.readlines()
                conf.close()

            for line in lines:
                if type == "assembly":
                    line.replace(f"{oldName}_assembly", f"{newName}_assembly")
                elif type == "annotation":
                    line.replace(f"Annotation_{oldName}", f"Annotation_{newName}")
                    line.replace(
                        f"{oldName}_genomic_annotation", f"{newName}_genomic_annotation"
                    )
                elif type == "mapping":
                    line.replace(f"{oldName}_assembly", f"{newName}_assembly")
        except:
            return 0, {
                "label": "Error",
                "message": "Error while renaming jbrowse data!",
                "type": "error",
            }

    # rename directory
    def renameDirectory(self, path, newPath):
        """
        rename directory
        """

        if not exists(path):
            return 1, {}

        try:
            run(["mv", path, newPath])
        except:
            return 0, {
                "label": "Error",
                "message": "Directory/File could not be renamed. Check yourself!",
                "type": "error",
            }

        return newPath, {}

    # creates directories in storage / jbrowse for one assembly
    def createDirectoriesForSpecies(self, assemblyDirName):
        """
        Setups the basic directory structure for one assembly
        """

        pathToSpeciesDirectory = f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyDirName}"

        try:
            # fasta
            makedirs(
                f"{pathToSpeciesDirectory}/fasta/pep/additionalFiles/", exist_ok=True
            )
            makedirs(
                f"{pathToSpeciesDirectory}/fasta/dna/additionalFiles/", exist_ok=True
            )

            # gff3
            makedirs(f"{pathToSpeciesDirectory}/gff3/", exist_ok=True)

            # mappings
            makedirs(f"{pathToSpeciesDirectory}/mappings/", exist_ok=True)

            # quast
            makedirs(f"{pathToSpeciesDirectory}/quast/", exist_ok=True)

            # busco
            makedirs(f"{pathToSpeciesDirectory}/busco/", exist_ok=True)

            # fCat
            makedirs(f"{pathToSpeciesDirectory}/fcat/", exist_ok=True)

            # repeatmasker
            makedirs(f"{pathToSpeciesDirectory}/repeatmasker/", exist_ok=True)

            # milts
            makedirs(f"{pathToSpeciesDirectory}/milts/", exist_ok=True)

            # # jbrowse
            makedirs(f"{BASE_PATH_TO_JBROWSE}{assemblyDirName}", exist_ok=True)
        except:
            return 0, {
                "label": "Error",
                "message": "Error while setting up directory structure. Check file system!",
                "type": "error",
            }

        return 1, {}
