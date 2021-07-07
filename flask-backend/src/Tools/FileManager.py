import mysql.connector
from os import makedirs
from os.path import exists

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
    def fetchPossibleImports(self, types=["fasta"], import_directory=BASE_PATH_TO_IMPORT):
        """
        Fetch all files provided in import dirctory
        """

        FILE_TYPE_EXTENSION_PATTERNS = {
            "fasta": {
                ".fasta": r"^(.+)\.fasta$",
                ".fa": r"^(.+)\.fa$",
                ".faa": r"^(.+)\.faa$",
                ".fna": r"^(.+)\.fna$",
            }
        }

        # check if import directory exist or create
        if not exists(import_directory):
            if not exists(import_directory):
                makedirs(BASE_PATH_TO_IMPORT, exist_ok=True)
            return 0, {
                "label": "Info",
                "message": f"Import directory deleted from file system. Created directory: '{BASE_PATH_TO_IMPORT}'",
                "type": "info",
            }

        for type in types:
            if type in FILE_TYPE_EXTENSION_PATTERNS:
                for extension in FILE_TYPE_EXTENSION_PATTERNS[type]:
                    print(FILE_TYPE_EXTENSION_PATTERNS[type][extension])

            else:
                return 0, {
                "label": "Error",
                "message": f"File type {type} unknown!",
                "type": "error",
            }