from math import exp
import mysql.connector
from os import makedirs, remove
from os.path import exists, split
from glob import glob
from PIL import Image

# defaults
BASE_PATH_TO_IMPORT = "src/Import/"
BASE_PATH_TO_STORAGE = "src/FileStorage/"

# images
SIZE = 128, 128


class FileManager:
    def __init__(self):
        self.hostURL = "ghubs.izn-ffm.intern"

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
        self, types=["image", "fasta"], import_directory=BASE_PATH_TO_IMPORT
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
    def moveFileToStorage(self, type, path, name="", deleteAfterMoving=False):
        """
        Moves selected file to proper storage location
        """

        path = "src/Import/" + path

        print(path)
        
        if not exists(path):
            return 0, {
                "label": "Error",
                "message": "Path to file not found!",
                "type": "error",
            }

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
                    image.save("src/FileStorage/taxa/images/" + name + ".thumbnail.jpg", "JPEG")

            except:
                return 0, {
                    "label": "Error",
                    "message": "Something went wrong while formatting image or moving it to storage!",
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


        return 1, {}


    def deleteFile(self, path):
        """
        Deletes files
        """

        try:
            remove(path)
        except:
            return 0, {
                    "label": "Error",
                    "message": "File could not be deleted. Check yourself!",
                    "type": "error",
                }

        return 1, {}