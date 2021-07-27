import mysql.connector
from os import makedirs, remove
from os.path import exists
from shutil import copy, rmtree, copytree
from glob import glob
from PIL import Image
from subprocess import run

# defaults
BASE_PATH_TO_UPLOAD = "src/files/upload/"
BASE_PATH_TO_STORAGE = "src/files/download/"

BASE_PATH_TO_JBROWSE = "src/externalTools/jbrowse/data/"
JBROWSEGENERATENAMESCALL = "src/externalTools/jbrowse/bin/generate-names.pl"

# images
SIZE = 256, 256


class FileManager:
    def __init__(self):
        self.hostURL = "0.0.0.0"

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
    # FETCH ALL FILES IN IMPORT DIRECTORY
    def fetchPossibleImports(
        self,
        types=["image", "fasta", "gff", "bam", "analysis"],
        import_directory=BASE_PATH_TO_UPLOAD,
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
                "milts": "**/3D_plot.html",
                "busco": "**/short_summary.txt",
                "fcat": "**/report_summary.txt",
                "repeatmasker": "**/*.tbl",
            },
        }

        # check if import directory exist or create
        if not exists(import_directory):
            if not exists(BASE_PATH_TO_UPLOAD):
                makedirs(BASE_PATH_TO_UPLOAD, exist_ok=True)
            return 0, {
                "label": "Info",
                "message": f"Import directory deleted from file system. Created directory: '{BASE_PATH_TO_UPLOAD}'",
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
                        pathSplit = filePath.split("/")
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

        STORAGEERROR = {
            "label": "Error",
            "message": "Something went wrong while formatting or moving it to storage!",
            "type": "error",
        }

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

        elif type == "assembly":
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
                    self.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}{name}/")
                    return 0, {
                        "label": "Error",
                        "message": "Error copying additional files!",
                        "type": "error",
                    }

            try:
                run(["samtools", "faidx", newPath])
                run(["ln", "-rs", newPath, f"{BASE_PATH_TO_JBROWSE}{name}/"])
                run(["ln", "-rs", f"{newPath}.fai", f"{BASE_PATH_TO_JBROWSE}{name}/"])
            except:
                self.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
                self.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}{name}/")
                return 0, {
                    "label": "Error",
                    "message": "Error creating symlink to jbrowse data!",
                    "type": "error",
                }

            try:
                with open(f"{BASE_PATH_TO_JBROWSE}{name}/tracks.conf", "a") as conf:
                    template = f"[GENERAL]\nrefSeqs={name}_assembly.fasta.fai\n[tracks.Reference]\nurlTemplate={name}_assembly.fasta\nstoreClass=JBrowse/Store/SeqFeature/IndexedFasta\ntype=Sequence\n"
                    conf.write(template)
                    conf.close()
            except:
                self.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
                self.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}{name}/")
                return 0, {
                    "label": "Error",
                    "message": "Error while creating jbrowse tracks.conf.",
                    "type": "error",
                }

            try:
                run(
                    [JBROWSEGENERATENAMESCALL, "-out", f"{BASE_PATH_TO_JBROWSE}{name}/"]
                )
            except:
                self.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
                self.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}{name}/")
                return 0, {
                    "label": "Error",
                    "message": "Error while running jbrowse generate-names.pl scipt. Run manually!",
                    "type": "error",
                }

        elif type == "annotation":
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
                run(["bgzip", newPathSorted])
                run(["tabix", "-p", "gff", f"{newPathSorted}.gz"])
                run(
                    [
                        "ln",
                        "-rs",
                        f"{newPathSorted}.gz",
                        f"{BASE_PATH_TO_JBROWSE}{assemblyName}/",
                    ]
                )
                run(
                    [
                        "ln",
                        "-rs",
                        f"{newPathSorted}.gz.tbi",
                        f"{BASE_PATH_TO_JBROWSE}{assemblyName}/",
                    ]
                )
            except:
                self.deleteDirectories(fullPathToAnnoation)
                return 0, {
                    "label": "Error",
                    "message": "Error formatting gff3 for jbrowse!",
                    "type": "error",
                }

            try:
                fileNameSorted = newPathSorted.split("/")[-1]
                name = name.replace(".", "_")
                with open(
                    f"{BASE_PATH_TO_JBROWSE}{assemblyName}/tracks.conf", "a"
                ) as conf:
                    template = f"[tracks.Annotation_{name}]\nurlTemplate={fileNameSorted}.gz\nstoreClass=JBrowse/Store/SeqFeature/GFF3Tabix\ntype=CanvasFeatures\n"
                    conf.write(template)
                    conf.close()
            except:
                self.deleteDirectories(fullPathToAnnoation)
                return 0, {
                    "label": "Error",
                    "message": "Error while creating jbrowse tracks.conf.",
                    "type": "error",
                }

            try:
                run(
                    [
                        JBROWSEGENERATENAMESCALL,
                        "-out",
                        f"{BASE_PATH_TO_JBROWSE}{assemblyName}/",
                    ]
                )
            except:
                self.deleteDirectories(fullPathToAnnoation)
                return 0, {
                    "label": "Error",
                    "message": "Error while running jbrowse generate-names.pl script. Run manually!",
                    "type": "error",
                }

            newPath = newPathSorted

        elif type == "mapping":
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

            try:
                run(["samtools", "index", newPath])
                run(
                    [
                        "ln",
                        "-rs",
                        newPath,
                        f"{BASE_PATH_TO_JBROWSE}{assemblyName}/",
                    ]
                )
                run(
                    [
                        "ln",
                        "-rs",
                        f"{newPath}.bai",
                        f"{BASE_PATH_TO_JBROWSE}{assemblyName}/",
                    ]
                )

            except:
                self.deleteDirectories(fullPathToMapping)
                return 0, {
                    "label": "Error",
                    "message": "Error indexing .bam for jbrowse!",
                    "type": "error",
                }

            try:
                fileName = newPath.split("/")[-1]
                name = name.replace(".", "_")
                with open(
                    f"{BASE_PATH_TO_JBROWSE}{assemblyName}/tracks.conf", "a"
                ) as conf:
                    template = f"[tracks.Mapping_{name}]\nurlTemplate={fileName}\nstoreClass=JBrowse/Store/SeqFeature/BAM\ntype=Alignments2\n"
                    conf.write(template)
                    conf.close()
            except:
                self.deleteDirectories(fullPathToMapping)
                return 0, {
                    "label": "Error",
                    "message": "Error while creating jbrowse tracks.conf.",
                    "type": "error",
                }

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
                    newPath = f"{fullPathToAnalysis}{name}_milts_taxonomic_assignment_plot.html"
                elif type == "busco":
                    newPath = f"{fullPathToAnalysis}{name}_busco_completeness.txt"
                elif type == "fcat":
                    newPath = f"{fullPathToAnalysis}{name}_fcat_completeness.txt"
                elif type == "repeatmasker":
                    newPath = f"{fullPathToAnalysis}{name}_repeatmasker.txt"
                copy(path, newPath)
            except:
                self.deleteDirectories(fullPathToAnalysis)
                return 0, STORAGEERROR

            if type == "milts":
                try:
                    with open(newPath, "r") as plotFile:
                        lines = plotFile.readlines()
                        plotFile.close()

                    for index, line in enumerate(lines):
                        if "3D_plot_files" in line:
                            lines[index] = line.replace(
                                "3D_plot_files",
                                "../../../../../additionalFiles/3D_plot_files",
                            )
                        elif '"title":"taxonomic assignment",' in line:
                            lines[index] = line.replace(
                                '"title":"taxonomic assignment",', ""
                            )

                    with open(newPath, "w") as plotFile:
                        lines = plotFile.writelines(lines)
                        plotFile.close()
                except:
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

            # jbrowse
            makedirs(f"{BASE_PATH_TO_JBROWSE}{assemblyDirName}", exist_ok=True)
        except:
            return 0, {
                "label": "Error",
                "message": "Error while setting up directory structure. Check file system!",
                "type": "error",
            }

        return 1, {}
