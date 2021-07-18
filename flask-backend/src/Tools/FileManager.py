from math import exp
import mysql.connector
from os import makedirs, remove, symlink
from os.path import exists
from shutil import copy, rmtree
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
        self, types=["image", "fasta"], import_directory=BASE_PATH_TO_UPLOAD
    ):
        """
        Fetch all files provided in import dirctory
        """

        if not isinstance(types, list):
            types = ["image", "fasta"]

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
        self, type, path, name="", additionalFiles="", deleteAfterMoving=False
    ):
        """
        Moves selected file to proper storage location
        """

        STORAGEERROR = {
            "label": "Error",
            "message": "Something went wrong while formatting or moving it to storage!",
            "type": "error",
        }

        path = BASE_PATH_TO_UPLOAD + path

        if not exists(path):
            return 0, {
                "label": "Error",
                "message": "Path to file not found!",
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
                        "src/files/download/taxa/images/" + name + ".thumbnail.jpg"
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
                    template = f"[GENERAL]\nrefSeqs={name}_assembly.fasta.fai\n[tracks.Reference]\nurlTemplate={name}.fasta\nstoreClass=JBrowse/Store/SeqFeature/IndexedFasta\ntype=Sequence\n"
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

        else:
            return 0, {
                "label": "Error",
                "message": "Unsupported type!",
                "type": "error",
            }

        if deleteAfterMoving:
            status, notification = remove(path)
            if not status:
                return 0, notification

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
            makedirs(f"{pathToSpeciesDirectory}/gff3/additionalFiles/", exist_ok=True)

            # mappings
            makedirs(
                f"{pathToSpeciesDirectory}/mappings/additionalFiles/", exist_ok=True
            )

            # quast
            makedirs(f"{pathToSpeciesDirectory}/quast/additionalFiles/", exist_ok=True)

            # busco
            makedirs(f"{pathToSpeciesDirectory}/busco/additionalFiles/", exist_ok=True)

            # fCat
            makedirs(f"{pathToSpeciesDirectory}/fcat/additionalFiles/", exist_ok=True)

            # repeatmasker
            makedirs(
                f"{pathToSpeciesDirectory}/repeatmasker/additionalFiles/", exist_ok=True
            )

            # milts
            makedirs(f"{pathToSpeciesDirectory}/milts/additionalFiles/", exist_ok=True)

            # jbrowse
            makedirs(f"{BASE_PATH_TO_JBROWSE}{assemblyDirName}", exist_ok=True)
        except:
            return 0, {
                "label": "Error",
                "message": "Error while setting up directory structure. Check file system!",
                "type": "error",
            }

        return 1, {}
