import mysql.connector
from os import makedirs
from os.path import exists
from glob import glob

# defaults
BASE_PATH_TO_IMPORT = "src/Import/"
BASE_PATH_TO_STORAGE = "src/FileStorage/"


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
