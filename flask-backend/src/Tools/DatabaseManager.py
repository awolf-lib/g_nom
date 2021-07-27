import mysql.connector
from hashlib import new, sha512
from math import ceil

from .FileManager import FileManager
from .Parsers import Parsers

fileManager = FileManager()
parsers = Parsers()

BASE_PATH_TO_UPLOAD = "src/files/upload/"
BASE_PATH_TO_STORAGE = "src/files/download/"

BASE_PATH_TO_JBROWSE = "src/externalTools/jbrowse/data/"


class DatabaseManager:
    def __init__(self):
        self.hostURL = "0.0.0.0"

    # ====== GENERAL ====== #
    # reconnect to get updates
    def updateConnection(self, database="g-nom_dev"):
        connection = mysql.connector.connect(
            host=self.hostURL,
            user="gnom",
            password="G-nom_BOT#0",
            database=database,
            auth_plugin="mysql_native_password",
        )
        cursor = connection.cursor()

        return connection, cursor

    # ================== USER ================== #
    # ADD NEW USER
    def addUser(self, username, password, role):
        """
        Add a user to db
        """
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * FROM user where username='{username}'")
            user = cursor.fetchone()
            if user:
                return {}, {
                    "label": "Error",
                    "message": f"Name '{username}' already exists!",
                    "type": "error",
                }
        except:
            return {}, {
                "label": "Error",
                "message": "Something went wrong while adding user to db!",
                "type": "error",
            }

        checkpoint = False
        try:
            connection, cursor = self.updateConnection()
            password = sha512(f"{password}$g#n#o#m$".encode("utf-8")).hexdigest()
            cursor.execute(
                f"INSERT INTO user (username, password, role) VALUES ('{username}', '{password}', '{role}')"
            )
            connection.commit()
            checkpoint = True
        except:
            return {}, {
                "label": "Error",
                "message": "Something went wrong while adding user to db!",
                "type": "error",
            }

        if checkpoint:
            return {"username": username, "role": role}, {
                "label": "Success",
                "message": f"User '{username}' with role '{role}' added to database!",
                "type": "success",
            }
        else:
            return {}, {
                "label": "Error",
                "message": "Something went wrong while adding user to db!",
                "type": "error",
            }

    # FETCH ALL USERS
    def fetchALLUsers(self):
        """
        Gets all users from db
        """

        user = []
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT user.id, user.username, user.role from user")

            row_headers = [x[0] for x in cursor.description]
            user = cursor.fetchall()
        except:
            return [], f"Error while fetching users from DB. Check database connection!"

        if len(user):
            return [dict(zip(row_headers, x)) for x in user], {}
        else:
            return [], {
                "label": "Info",
                "message": "No users in database!",
                "type": "info",
            }

    # DELETE USER BY USER ID
    def deleteUserByUserID(self, userID):
        """
        Delete user from db
        """
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"DELETE FROM user WHERE id={userID}")
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while deleting user!",
                "type": "error",
            }

        return userID, {
            "label": "Success",
            "message": f"Successfully deleted user with ID {userID}!",
            "type": "success",
        }

    # UPDATE USER ROLE BY USER ID
    def updateUserRoleByUserID(self, userID, role):
        """
        Update column user.role to new value
        """
        try:
            if role == "admin" or role == "user":
                connection, cursor = self.updateConnection()
                cursor.execute(f"UPDATE user SET user.role='{role}' WHERE id={userID}")
                connection.commit()
            else:
                return 0, {
                    "label": "Error",
                    "message": "Unknown role!",
                    "type": "error",
                }
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while updating user role!",
                "type": "error",
            }

        return userID, {
            "label": "Success",
            "message": f"Successfully updated user role of user ID {userID} to '{role}'!",
            "type": "success",
        }

    # ================== TAXON ================== #
    # IMPORT ALL FROM TAXDUMP FILE
    def reloadTaxonIDsFromFile(self, userID):
        """
        Takes names.dmp from src/files/download/taxa/names.dmp directory and fills db with
        all tax IDs
        """

        connection, cursor = self.updateConnection()

        taxonData = []
        try:
            with open("src/files/download/taxa/names.dmp", "r") as taxonFile:
                taxonData = taxonFile.readlines()
                taxonFile.close()
        except:
            return (
                0,
                "Error: Error while reading names.dmp. Check if file is provided at 'src/files/download/taxa/names.dmp' directory!",
            )

        try:
            taxonID = None
            counter = 0
            values = ""
            for index, line in enumerate(taxonData):
                split = line.split("\t")
                taxonID = int(split[0])

                if "scientific name" in line:
                    scientificName = split[2].replace("'", "")

                if (
                    index < len(taxonData) - 1
                    and int(taxonData[index + 1].split("\t")[0]) != taxonID
                ):
                    values += f"({taxonID}, '{scientificName}', {userID}, NOW()),"
                    counter += 1
                    taxonID = None

                if counter == 5000:
                    values = values[:-1]
                    sql = f"INSERT INTO taxon (ncbiTaxonID, scientificName, lastUpdatedBy, lastUpdatedOn) VALUES {values}"
                    cursor.execute(sql)
                    connection.commit()
                    counter = 0
                    values = ""

            values = values[:-1]
            sql = f"INSERT INTO taxon (ncbiTaxonID, scientificName, lastUpdatedBy, lastUpdatedOn) VALUES {values}"
            cursor.execute(sql)
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Error while inserting taxa!",
                "type": "error",
            }

        try:
            cursor.execute(f"SELECT COUNT(ncbiTaxonID) FROM taxon")
            taxaCount = cursor.fetchone()[0]
        except:
            return 0, {
                "label": "Error",
                "message": "Error while receiving taxon count!",
                "type": "error",
            }

        if taxaCount:
            return taxaCount, ""
        else:
            return 0, {
                "label": "Error",
                "message": "No taxa imported!",
                "type": "error",
            }

    # FETCH ONE TAXON BY NCBI TAXON ID
    def fetchTaxonByNCBITaxonID(self, taxonID):
        """
        Gets taxon by taxon id from taxon table
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(f"SELECT * FROM taxon WHERE ncbiTaxonID = {taxonID}")
            row_headers = [x[0] for x in cursor.description]
            taxa = cursor.fetchall()

        except:
            return {}, {
                "label": "Error",
                "message": f"Error while fetching taxon information from database!",
                "type": "error",
            }

        if len(taxa):
            return [dict(zip(row_headers, x)) for x in taxa], {}
        else:
            return {}, {
                "label": "Info",
                "message": f"No taxon for NCBI taxonomy ID {taxonID} found!",
                "type": "info",
            }

    # UPDATE TAXON IMAGE
    def updateImageByTaxonID(self, taxonID, path, userID):
        """
        ADD PROFILE IMAGE
        """
        status, notification = fileManager.moveFileToStorage("image", path, taxonID)

        if not status:
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"UPDATE taxon SET imageStatus={1}, lastUpdatedBy={userID}, lastUpdatedOn=NOW() WHERE ncbiTaxonID={taxonID}"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while updating taxon image!",
                "type": "error",
            }

        return taxonID, {
            "label": "Success",
            "message": f"Successfully updated image of taxon with NCBI taxon ID {taxonID}!",
            "type": "success",
        }

    # DELETE TAXON IMAGE
    def removeImageByTaxonID(self, taxonID, userID):
        """
        REMOVE PROFILE IMAGE
        """

        status, notification = fileManager.deleteFile(
            "src/FileStorage/taxa/images/" + taxonID + ".thumbnail.jpg"
        )
        if not status:
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"UPDATE taxon SET taxon.imageStatus={0}, lastUpdatedBy={userID}, lastUpdatedOn=NOW() WHERE taxon.ncbiTaxonID={taxonID}"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while updating taxon image!",
                "type": "error",
            }

        return taxonID, {
            "label": "Success",
            "message": f"Successfully removed image of taxon with NCBI taxon ID {taxonID}!",
            "type": "success",
        }

    # ================== ASSEMBLY ================== #
    # FETCH ALL ASSEMBLIES
    def fetchAllAssemblies(self, page=1, range=0, search="", userID=0):
        """
        Gets all assemblies from db
        """
        try:
            connection, cursor = self.updateConnection()
            userID = int(userID)
            if not userID:
                cursor.execute(
                    f"SELECT assembly.id, assembly.name, taxon.scientificName, taxon.imageStatus, assembly.taxonID, taxon.ncbiTaxonID FROM assembly, taxon WHERE assembly.taxonID = taxon.id"
                )
            else:
                cursor.execute(
                    f"SELECT assembly.id, assembly.name, taxon.scientificName, taxon.imageStatus, assembly.taxonID, taxon.ncbiTaxonID FROM assembly, taxon, bookmark WHERE bookmark.userID={userID} AND bookmark.assemblyID=assembly.id AND assembly.taxonID = taxon.id"
                )

            row_headers = [x[0] for x in cursor.description]
            assemblies = cursor.fetchall()
            assemblies = [dict(zip(row_headers, x)) for x in assemblies]

            for i in assemblies:
                assemblyID = i["id"]
                cursor.execute(
                    f"SELECT analysis.type FROM analysis WHERE analysis.assemblyID={assemblyID} GROUP BY analysis.type"
                )
                analyses = cursor.fetchall()
                i.update({"types": [x[0] for x in analyses]})
        except:
            return (
                [],
                {},
                {
                    "label": "Error",
                    "message": "Something went wrong while fetching assemblies!",
                    "type": "error",
                },
            )

        if len(assemblies):
            pagination = {"count": len(assemblies)}

            try:
                if search != "":
                    pagination.update({"search": search})
                    search = search.lower()
                    assemblies = [
                        x
                        for x in assemblies
                        if (
                            search in str(x["id"])
                            or search in x["name"].lower()
                            or search in str(x["taxonID"])
                            or search in x["scientificName"].lower()
                        )
                    ]
            except:
                return (
                    [],
                    pagination,
                    {
                        "label": "Error",
                        "message": f"Something went wrong while searching for keyword '{search}'!",
                        "type": "error",
                    },
                )

            try:
                page = int(page)
                range = int(range)
                offset = (page - 1) * range
                pages = ceil(len(assemblies) / range)
                pagination.update(
                    {
                        "currentPage": page,
                        "range": range,
                        "pages": pages,
                        "view": f"{offset+1}-{offset+range}",
                    }
                )
                if page >= 0 and range > 0:
                    assemblies = assemblies[offset : offset + range]

                    if page - 1 < 1:
                        pagination.update(
                            {
                                "previous": f"http://localhost:3002/fetchAllAssemblies?page=1&range={range}&search={search}&userID={userID}"
                            }
                        )
                    else:
                        pagination.update(
                            {
                                "previous": f"http://localhost:3002/fetchAllAssemblies?page={page-1}&range={range}&search={search}&userID={userID}"
                            }
                        )

                    if page + 1 == pages:
                        lastRange = len(assemblies) % range
                        if lastRange == 0:
                            lastRange = range
                        pagination.update(
                            {
                                "next": f"http://localhost:3002/fetchAllAssemblies?page={page+1}&range={lastRange}&search={search}&userID={userID}"
                            }
                        )
                    elif page + 1 > pages:
                        lastRange = len(assemblies) % range
                        if lastRange == 0:
                            lastRange = range
                        pagination.update(
                            {
                                "next": f"http://localhost:3002/fetchAllAssemblies?page={page}&range={lastRange}&search={search}&userID={userID}"
                            }
                        )
                    else:
                        pagination.update(
                            {
                                "next": f"http://localhost:3002/fetchAllAssemblies?page={page+1}&range={range}&search={search}"
                            }
                        )

            except:
                return (
                    [],
                    pagination,
                    {
                        "label": "Error",
                        "message": f"Something went wrong while generating subset!",
                        "type": "error",
                    },
                )

            if not len(assemblies) and search:
                return (
                    [],
                    pagination,
                    {
                        "label": "Info",
                        "message": "No assemblies for given search!",
                        "type": "info",
                    },
                )
            return assemblies, pagination, 0
        else:
            return (
                [],
                {},
                {
                    "label": "Info",
                    "message": "No assemblies in database!",
                    "type": "info",
                },
            )

    # FETCH ASSEMBLY BY NCBI TAXON ID
    def fetchAssembliesByTaxonID(self, taxonID):
        """
        Gets all assembly with given NCBI taxon ID from db
        """

        assemblies = []
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * from assembly where taxonID={taxonID}")

            row_headers = [x[0] for x in cursor.description]
            assemblies = cursor.fetchall()
            assemblies = [dict(zip(row_headers, x)) for x in assemblies]
        except:
            return [], f"Error while fetching assemblies from DB."

        try:
            connection, cursor = self.updateConnection()
            for assembly in assemblies:
                addedByID = assembly["addedBy"]
                lastUpdatedByID = assembly["lastUpdatedBy"]
                cursor.execute(f"SELECT username from user where id={addedByID}")
                addedBy = cursor.fetchone()[0]
                cursor.execute(f"SELECT username from user where id={lastUpdatedByID}")
                lastUpdatedBy = cursor.fetchone()[0]

                assembly.update(
                    {"addedByUsername": addedBy, "lastUpdatedByUsername": lastUpdatedBy}
                )
        except:
            return [], f"Error while fetching user information from DB."

        if len(assemblies):
            return assemblies, {}
        else:
            return [], {
                "label": "Info",
                "message": "No assemblies with given ID in database!",
                "type": "info",
            }

    # FETCH ONE ASSEMBLY
    def fetchAssemblyInformationByAssemblyID(self, id, userID):
        """
        Gets all necessary information for one assembly from db
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT * FROM assembly, taxon WHERE assembly.id={id} AND assembly.taxonID=taxon.id"
            )

            row_headers = [x[0] for x in cursor.description]
            assembly = cursor.fetchone()
            assemblyInformation = dict(zip(row_headers, assembly))
        except:
            return {}, {
                "label": "Error",
                "message": "Error while fetching assembly information!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            ncbiTaxonID = assemblyInformation["ncbiTaxonID"]
            cursor.execute(
                f"SELECT generalInfoLabel, generalInfoDescription FROM taxonGeneralInfo WHERE taxonID={ncbiTaxonID}"
            )

            row_headers = [x[0] for x in cursor.description]
            taxonGeneralInfos = cursor.fetchall()
            taxonGeneralInfos = [dict(zip(row_headers, x)) for x in taxonGeneralInfos]
            assemblyInformation.update({"taxonGeneralInfos": taxonGeneralInfos})
        except:
            return {}, {
                "label": "Error",
                "message": "Error while fetching taxon general information!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * FROM assemblyStatistics WHERE assemblyID={id}")

            row_headers = [x[0] for x in cursor.description]
            assemblyStatistics = cursor.fetchone()
            assemblyInformation.update(
                {"assemblyStatistics": dict(zip(row_headers, assemblyStatistics))}
            )
        except:
            return [], {
                "label": "Error",
                "message": "Error while fetching assembly statistics!",
                "type": "error",
            }

        try:
            analyses = {}
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT * FROM analysis, milts WHERE analysis.assemblyID={id} AND analysis.type='milts' AND milts.analysisID=analysis.id"
            )
            row_headers = [x[0] for x in cursor.description]
            milts = cursor.fetchall()

            if len(milts):
                analyses.update({"milts": [dict(zip(row_headers, x)) for x in milts]})
            else:
                analyses.update({"milts": []})

            cursor.execute(
                f"SELECT * FROM analysis, busco WHERE analysis.assemblyID={id} AND analysis.type='busco' AND busco.analysisID=analysis.id"
            )
            row_headers = [x[0] for x in cursor.description]
            busco = cursor.fetchall()

            if len(busco):
                analyses.update({"busco": [dict(zip(row_headers, x)) for x in busco]})
            else:
                analyses.update({"busco": []})

            cursor.execute(
                f"SELECT * FROM analysis, fcat WHERE analysis.assemblyID={id} AND analysis.type='fcat' AND fcat.analysisID=analysis.id"
            )
            row_headers = [x[0] for x in cursor.description]
            fcat = cursor.fetchall()

            if len(fcat):
                analyses.update({"fcat": [dict(zip(row_headers, x)) for x in fcat]})
            else:
                analyses.update({"fcat": []})

            assemblyInformation.update({"analyses": analyses})

            cursor.execute(
                f"SELECT * FROM analysis, repeatmasker WHERE analysis.assemblyID={id} AND analysis.type='repeatmasker' AND repeatmasker.analysisID=analysis.id"
            )
            row_headers = [x[0] for x in cursor.description]
            repeatmasker = cursor.fetchall()

            if len(repeatmasker):
                analyses.update({"repeatmasker": [dict(zip(row_headers, x)) for x in repeatmasker]})
            else:
                analyses.update({"repeatmasker": []})

            assemblyInformation.update({"analyses": analyses})
        except:
            return [], {
                "label": "Error",
                "message": "Error while fetching analysis information!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT * FROM bookmark WHERE assemblyID={id} AND userID={userID}"
            )
            bookmark = cursor.fetchone()

            if bookmark:
                assemblyInformation.update({"bookmarked": 1})
            else:
                assemblyInformation.update({"bookmarked": 0})
        except:
            return [], {
                "label": "Error",
                "message": "Error while fetching bookmark information!",
                "type": "error",
            }

        if assembly:
            return assemblyInformation, {}
        else:
            return {}, {
                "label": "Info",
                "message": "No assembly information found!",
                "type": "info",
            }

    # ADD NEW ASSEMBLY
    def addNewAssembly(self, taxonID, name, path, userID, additionalFilesPath=""):
        """
        add new assembly
        """

        name = name.replace("/", "_")
        if not path or not name:
            return 0, {
                "label": "Error",
                "message": "Missing path to fasta or assembly name!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name from assembly where name='{name}'")
            nameAlreadyInDatabase = cursor.fetchone()
            if nameAlreadyInDatabase:
                return 0, {
                    "label": "Error",
                    "message": "Name already in database!",
                    "type": "error",
                }
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking if name is already assigned!",
                "type": "error",
            }

        path, notification = fileManager.moveFileToStorage(
            "assembly", path, name, additionalFilesPath
        )

        if not path:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
            fileManager.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}/{name}")
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO assembly (taxonID, name, path, addedBy, addedOn, lastUpdatedBy, lastUpdatedOn) VALUES ({taxonID}, '{name}', '{path}', {userID}, NOW(), {userID}, NOW())"
                )
            else:
                cursor.execute(
                    f"INSERT INTO assembly (taxonID, name, path, addedBy, addedOn, lastUpdatedBy, lastUpdatedOn, additionalFilesPath) VALUES ({taxonID}, '{name}', '{path}', {userID}, NOW(), {userID}, NOW(), '{additionalFilesPath}')"
                )
            lastID = cursor.lastrowid
            connection.commit()
        except:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
            fileManager.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}/{name}")
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting assembly into database!",
                "type": "error",
            }

        data, notification = parsers.parseFasta(path)

        if not data:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
            fileManager.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}/{name}")
            cursor.execute(f"DELETE FROM assembly WHERE id={lastID}")
            connection.commit()
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            fields = "assemblyID, "
            values = f"{lastID}, "
            for key in data:
                fields += f"{key}, "
                value = data[key]
                if not isinstance(value, str):
                    values += f"{value}, "
                else:
                    values += f"'{value}', "
            fields = fields[:-2]
            values = values[:-2]
            cursor.execute(
                f"INSERT INTO assemblyStatistics ({fields}) VALUES ({values})"
            )
            connection.commit()
        except:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
            fileManager.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}/{name}")
            self.removeAssemblyByAssemblyID(lastID)
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting assembly statistics into database!",
                "type": "error",
            }

        return {
            "taxonID": taxonID,
            "name": name,
            "path": path,
            "additionalFilesPath": additionalFilesPath,
        }, {
            "label": "Success",
            "message": f"Successfully imported assembly!",
            "type": "success",
        }

    # REMOVE ASSEMBLY
    def removeAssemblyByAssemblyID(self, id):
        """
        remove assembly by id
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name from assembly where id={id}")
            name = cursor.fetchone()[0]
            cursor.execute(f"DELETE FROM assembly WHERE id={id}")
            connection.commit()

            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
            fileManager.deleteDirectories(f"{BASE_PATH_TO_JBROWSE}/{name}")
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while removing assembly from database!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully removed assembly '{name}'!",
            "type": "success",
        }

    # RENAME ASSEMBLY
    def renameAssembly(self, id, name, userID):
        """
        update assembly name
        """
        name = name.replace("/", "_")
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT path from assembly where id={id}")
            path = cursor.fetchone()[0]
            pathSplit = path.split("/")
            oldPath = "/".join(pathSplit[:5])
            pathSplit[4] = name
            newPath = "/".join(pathSplit[:5])
            pathSplit[-1] = f"{name}_assembly.fasta"
            fullNewPath = "/".join(pathSplit)
            newPath, notification = fileManager.renameDirectory(oldPath, newPath)
            if not newPath:
                return 0, notification
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while renaming directory/file name",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"UPDATE assembly SET name='{name}', path='{fullNewPath}', lastUpdatedBy='{userID}', lastUpdatedOn=NOW()  WHERE id={id}"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while updating assembly name",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully updated assembly name to {name}!",
            "type": "success",
        }

    # ================== GENERAL INFO ANY LEVEL ================== #
    # FETCH ALL GENERAL INFOS OF SPECIFIC LEVEL
    def fetchGeneralInfosByID(self, level, id):
        """
        Gets all general information by level
        """

        if level == "taxon":
            table = "taxonGeneralInfo"
            idLabel = "taxonID"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown level of general info!",
                "type": "error",
            }

        generalInfos = []
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * from {table} WHERE {idLabel}={id}")

            row_headers = [x[0] for x in cursor.description]
            generalInfos = cursor.fetchall()
        except:
            return [], f"Error while fetching users from DB. Check database connection!"

        if len(generalInfos):
            return [dict(zip(row_headers, x)) for x in generalInfos], {}
        else:
            return [], {
                "label": "Info",
                "message": "No general infos in database!",
                "type": "info",
            }

    # ADD GENERAL INFO
    def addGeneralInfo(self, level, id, key, value):
        """
        add general info by level and id
        """

        if level == "taxon":
            table = "taxonGeneralInfo"
            idLabel = "taxonID"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown level of general info!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"INSERT INTO {table} ({idLabel}, generalInfoLabel, generalInfoDescription) VALUES ({id}, '{key}', '{value}')"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting general info into database!",
                "type": "error",
            }

        return {"id": id, "key": key, "value": value}, {
            "label": "Success",
            "message": f"Successfully added general info!",
            "type": "success",
        }

    # UPDATE GENERAL INFO
    def updateGeneralInfoByID(
        self, level, id, generalInfoLabel, generalInfoDescription
    ):
        """
        update general info by level and id
        """

        if level == "taxon":
            table = "taxonGeneralInfo"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown level of general info!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"UPDATE {table} SET generalInfoLabel='{generalInfoLabel}', generalInfoDescription='{generalInfoDescription}' WHERE id={id}"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while updating general info!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully updated general info!",
            "type": "success",
        }

    # REMOVE GENERAL INFO
    def removeGeneralInfoByID(self, level, id):
        """
        remove general info by level and id
        """

        if level == "taxon":
            table = "taxonGeneralInfo"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown level of general info!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"DELETE FROM {table} WHERE id={id}")
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while removing general info from database!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully removed general info!",
            "type": "success",
        }

    # ================== ANNOTATION ================== #
    # ADD NEW ANNOTATION
    def addNewAnnotation(self, assemblyID, name, path, userID, additionalFilesPath=""):
        """
        add new annotation
        """

        if not path or not name:
            return 0, {
                "label": "Error",
                "message": "Missing path to gff or annotation name!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name from annotation where name='{name}'")
            nameAlreadyInDatabase = cursor.fetchone()
            if nameAlreadyInDatabase:
                return 0, {
                    "label": "Error",
                    "message": "Name already in database!",
                    "type": "error",
                }
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking if name is already assigned!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name FROM assembly where id={assemblyID}")
            assemblyName = cursor.fetchone()[0]
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking for assembly name!",
                "type": "error",
            }

        path, notification = fileManager.moveFileToStorage(
            "annotation", path, name, additionalFilesPath, assemblyName
        )

        if not path:
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO annotation (assemblyID, name, path, addedBy, addedOn) VALUES ({assemblyID}, '{name}', '{path}', {userID}, NOW())"
                )
            else:
                cursor.execute(
                    f"INSERT INTO annotation (assemblyID, name, path, addedBy, addedOn, additionalFilesPath) VALUES ({assemblyID}, '{name}', '{path}', {userID}, NOW(), '{additionalFilesPath}')"
                )
            lastID = cursor.lastrowid
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting annotation into database!",
                "type": "error",
            }

        # TODO: ADD TABLE TO MYSQL DATABASE
        # data, notification = parsers.parseGff(path)

        # if not data:
        #     cursor.execute(f"DELETE FROM annotation WHERE id={lastID}")
        #     connection.commit()
        #     return 0, notification

        # try:
        #     connection, cursor = self.updateConnection()
        #     fields = "assemblyID, "
        #     values = f"{lastID}, "
        #     for key in data:
        #         fields += f"{key}, "
        #         value = data[key]
        #         if not isinstance(value, str):
        #             values += f"{value}, "
        #         else:
        #             values += f"'{value}', "
        #     fields = fields[:-2]
        #     values = values[:-2]
        #     cursor.execute(
        #         f"INSERT INTO annotationStatistics ({fields}) VALUES ({values})"
        #     )
        #     connection.commit()
        # except:
        #     return 0, {
        #         "label": "Error",
        #         "message": "Something went wrong while inserting assembly into database!",
        #         "type": "error",
        #     }

        return {
            "assemblyID": assemblyID,
            "name": name,
            "path": path,
            "additionalFilesPath": additionalFilesPath,
        }, {
            "label": "Success",
            "message": f"Successfully imported annotation!",
            "type": "success",
        }

    # ================== MAPPING ================== #
    # ADD NEW MAPPING
    def addNewMapping(self, assemblyID, name, path, userID, additionalFilesPath=""):
        """
        add new mapping
        """

        if not path or not name:
            return 0, {
                "label": "Error",
                "message": "Missing path to .bam or mapping name!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name from mapping where name='{name}'")
            nameAlreadyInDatabase = cursor.fetchone()
            if nameAlreadyInDatabase:
                return 0, {
                    "label": "Error",
                    "message": "Name already in database!",
                    "type": "error",
                }
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking if name is already assigned!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name FROM assembly where id={assemblyID}")
            assemblyName = cursor.fetchone()[0]
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking for assembly name!",
                "type": "error",
            }

        path, notification = fileManager.moveFileToStorage(
            "mapping", path, name, additionalFilesPath, assemblyName
        )

        if not path:
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO mapping (assemblyID, name, path, addedBy, addedOn) VALUES ({assemblyID}, '{name}', '{path}', {userID}, NOW())"
                )
            else:
                cursor.execute(
                    f"INSERT INTO mapping (assemblyID, name, path, addedBy, addedOn, additionalFilesPath) VALUES ({assemblyID}, '{name}', '{path}', {userID}, NOW(), '{additionalFilesPath}')"
                )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting mapping into database!",
                "type": "error",
            }

        return {
            "assemblyID": assemblyID,
            "name": name,
            "path": path,
            "additionalFilesPath": additionalFilesPath,
        }, {
            "label": "Success",
            "message": f"Successfully imported mapping!",
            "type": "success",
        }

    # ADD NEW ANALYSIS
    def addNewAnalysis(self, assemblyID, name, path, userID, additionalFilesPath=""):
        """
        add new analysis
        """

        if not path or not name:
            return 0, {
                "label": "Error",
                "message": "Missing path to file or analysis name!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name from analysis where name='{name}'")
            nameAlreadyInDatabase = cursor.fetchone()
            if nameAlreadyInDatabase:
                return 0, {
                    "label": "Error",
                    "message": "Name already in database!",
                    "type": "error",
                }
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking if name is already assigned!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT name FROM assembly where id={assemblyID}")
            assemblyName = cursor.fetchone()[0]
        except:
            return 0, {
                "label": "Error",
                "message": "Error while checking for assembly name!",
                "type": "error",
            }

        fileName = path.split("/")[-1]

        if fileName == "3D_plot.html":
            type = "milts"
        elif fileName == "short_summary.txt":
            type = "busco"
        elif fileName == "report_summary.txt":
            type = "fcat"
        elif fileName.endswith(".tbl"):
            type = "repeatmasker"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown analysis type!",
                "type": "error",
            }

        path, notification = fileManager.moveFileToStorage(
            type, path, name, additionalFilesPath, assemblyName
        )

        if not path:
            return 0, notification

        try:
            connection, cursor = self.updateConnection()
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO analysis (assemblyID, name, type, path, addedBy, addedOn) VALUES ({assemblyID}, '{name}', '{type}', '{path}', {userID}, NOW())"
                )
            else:
                cursor.execute(
                    f"INSERT INTO analysis (assemblyID, name, type, path, addedBy, addedOn, additionalFilesPath) VALUES ({assemblyID}, '{name}', '{type}', '{path}', {userID}, NOW(), '{additionalFilesPath}')"
                )
            lastID = cursor.lastrowid
            connection.commit()

            if type == "milts":
                cursor.execute(f"INSERT INTO milts (analysisID) VALUES ({lastID})")
                connection.commit()
            elif type == "busco":
                buscoData, notification = parsers.parseBusco(path)

                if not buscoData:
                    return 0, notification

                importStatus, notification = self.importBusco(lastID, buscoData)

                if not importStatus:
                    return 0, notification
            elif type == "fcat":
                fcatData, notification = parsers.parseFcat(path)

                if not fcatData:
                    return 0, notification

                importStatus, notification = self.importFcat(lastID, fcatData)

                if not importStatus:
                    return 0, notification
            elif type == "repeatmasker":
                repeatmaskerData, notification = parsers.parseRepeatmasker(path)

                if not repeatmaskerData:
                    return 0, notification

                importStatus, notification = self.importRepeatmasker(
                    lastID, repeatmaskerData
                )

                if not importStatus:
                    return 0, notification
        except:
            cursor.execute(f"DELETE FROM analysis WHERE id={lastID}")
            cursor.execute(f"DELETE FROM {type} WHERE analysisID={lastID}")
            connection.commit()
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting analysis into database!",
                "type": "error",
            }

        return {
            "assemblyID": assemblyID,
            "name": name,
            "path": path,
            "additionalFilesPath": additionalFilesPath,
        }, {
            "label": "Success",
            "message": f"Successfully imported analysis!",
            "type": "success",
        }

    def importBusco(self, analysisID, buscoData):
        """
        Imports busco analysis results
        """

        if "completeSingle" in buscoData:
            completeSingle = buscoData["completeSingle"]
        else:
            completeSingle = 0

        if "completeDuplicated" in buscoData:
            completeDuplicated = buscoData["completeDuplicated"]
        else:
            completeDuplicated = 0

        if "fragmented" in buscoData:
            fragmented = buscoData["fragmented"]
        else:
            fragmented = 0

        if "missing" in buscoData:
            missing = buscoData["missing"]
        else:
            missing = 0

        if "total" in buscoData:
            total = buscoData["total"]
        else:
            total = 0

        if total != completeSingle + completeDuplicated + fragmented + missing:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while parsing busco!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"INSERT INTO busco (analysisID, completeSingle, completeDuplicated, fragmented, missing, total) VALUES ({analysisID}, '{completeSingle}', '{completeDuplicated}', '{fragmented}', '{missing}', '{total}')"
            )
            connection.commit()
            return 1, {}

        except:
            return 0, {
                "label": "Error",
                "message": "Nothing imported!",
                "type": "error",
            }

    # import fCat
    def importFcat(self, analysisID, fcatData):
        """
        Imports fCat analysis results
        """

        for mode in fcatData:
            if mode == "mode_1":
                if "similar" in fcatData[mode]:
                    m1_similar = fcatData[mode]["similar"]
                if "dissimilar" in fcatData[mode]:
                    m1_dissimilar = fcatData[mode]["dissimilar"]
                if "duplicated" in fcatData[mode]:
                    m1_duplicated = fcatData[mode]["duplicated"]
                if "missing" in fcatData[mode]:
                    m1_missing = fcatData[mode]["missing"]
                if "ignored" in fcatData[mode]:
                    m1_ignored = fcatData[mode]["ignored"]
                if "total" in fcatData[mode]:
                    m1_total = fcatData[mode]["total"]
            elif mode == "mode_2":
                if "similar" in fcatData[mode]:
                    m2_similar = fcatData[mode]["similar"]
                if "dissimilar" in fcatData[mode]:
                    m2_dissimilar = fcatData[mode]["dissimilar"]
                if "duplicated" in fcatData[mode]:
                    m2_duplicated = fcatData[mode]["duplicated"]
                if "missing" in fcatData[mode]:
                    m2_missing = fcatData[mode]["missing"]
                if "ignored" in fcatData[mode]:
                    m2_ignored = fcatData[mode]["ignored"]
                if "total" in fcatData[mode]:
                    m2_total = fcatData[mode]["total"]
            elif mode == "mode_3":
                if "similar" in fcatData[mode]:
                    m3_similar = fcatData[mode]["similar"]
                if "dissimilar" in fcatData[mode]:
                    m3_dissimilar = fcatData[mode]["dissimilar"]
                if "duplicated" in fcatData[mode]:
                    m3_duplicated = fcatData[mode]["duplicated"]
                if "missing" in fcatData[mode]:
                    m3_missing = fcatData[mode]["missing"]
                if "ignored" in fcatData[mode]:
                    m3_ignored = fcatData[mode]["ignored"]
                if "total" in fcatData[mode]:
                    m3_total = fcatData[mode]["total"]
            elif mode == "mode_4":
                if "similar" in fcatData[mode]:
                    m4_similar = fcatData[mode]["similar"]
                if "dissimilar" in fcatData[mode]:
                    m4_dissimilar = fcatData[mode]["dissimilar"]
                if "duplicated" in fcatData[mode]:
                    m4_duplicated = fcatData[mode]["duplicated"]
                if "missing" in fcatData[mode]:
                    m4_missing = fcatData[mode]["missing"]
                if "ignored" in fcatData[mode]:
                    m4_ignored = fcatData[mode]["ignored"]
                if "total" in fcatData[mode]:
                    m4_total = fcatData[mode]["total"]

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"INSERT INTO fcat (analysisID, m1_similar, m1_dissimilar, m1_duplicated, m1_missing, m1_ignored, m2_similar, m2_dissimilar, m2_duplicated, m2_missing, m2_ignored, m3_similar, m3_dissimilar, m3_duplicated, m3_missing, m3_ignored, m4_similar, m4_dissimilar, m4_duplicated, m4_missing, m4_ignored, total) VALUES ({analysisID}, {m1_similar}, {m1_dissimilar}, {m1_duplicated}, {m1_missing}, {m1_ignored}, {m2_similar}, {m2_dissimilar}, {m2_duplicated}, {m2_missing}, {m2_ignored}, {m3_similar}, {m3_dissimilar}, {m3_duplicated}, {m3_missing}, {m3_ignored}, {m4_similar}, {m4_dissimilar}, {m4_duplicated}, {m4_missing}, {m4_ignored}, {m1_total})"
            )
            connection.commit()
            return 1, {}

        except:
            return 0, {
                "label": "Error",
                "message": "Nothing imported!",
                "type": "error",
            }

    # import Repeatmasker
    def importRepeatmasker(self, analysisID, repeatmaskerData):
        """
        Imports Repeatmasker analysis results
        """

        if "retroelements" in repeatmaskerData:
            retroelements = repeatmaskerData["retroelements"]
        if "retroelements_length" in repeatmaskerData:
            retroelements_length = repeatmaskerData["retroelements_length"]
        if "dna_transposons" in repeatmaskerData:
            dna_transposons = repeatmaskerData["dna_transposons"]
        if "dna_transposons_length" in repeatmaskerData:
            dna_transposons_length = repeatmaskerData["dna_transposons_length"]
        if "rolling_circles" in repeatmaskerData:
            rolling_circles = repeatmaskerData["rolling_circles"]
        if "rolling_circles_length" in repeatmaskerData:
            rolling_circles_length = repeatmaskerData["rolling_circles_length"]
        if "unclassified" in repeatmaskerData:
            unclassified = repeatmaskerData["unclassified"]
        if "unclassified_length" in repeatmaskerData:
            unclassified_length = repeatmaskerData["unclassified_length"]
        if "small_rna" in repeatmaskerData:
            small_rna = repeatmaskerData["small_rna"]
        if "small_rna_length" in repeatmaskerData:
            small_rna_length = repeatmaskerData["small_rna_length"]
        if "satellites" in repeatmaskerData:
            satellites = repeatmaskerData["satellites"]
        if "satellites_length" in repeatmaskerData:
            satellites_length = repeatmaskerData["satellites_length"]
        if "simple_repeats" in repeatmaskerData:
            simple_repeats = repeatmaskerData["simple_repeats"]
        if "simple_repeats_length" in repeatmaskerData:
            simple_repeats_length = repeatmaskerData["simple_repeats_length"]
        if "low_complexity" in repeatmaskerData:
            low_complexity = repeatmaskerData["low_complexity"]
        if "low_complexity_length" in repeatmaskerData:
            low_complexity_length = repeatmaskerData["low_complexity_length"]
        if "total_non_repetitive_length" in repeatmaskerData:
            total_non_repetitive_length = repeatmaskerData[
                "total_non_repetitive_length"
            ]
        if "total_repetitive_length" in repeatmaskerData:
            total_repetitive_length = repeatmaskerData["total_repetitive_length"]
        if "numberN" in repeatmaskerData:
            numberN = repeatmaskerData["numberN"]
        if "percentN" in repeatmaskerData:
            percentN = repeatmaskerData["percentN"]

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"INSERT INTO repeatmasker (analysisID, retroelements, retroelements_length, dna_transposons, dna_transposons_length, rolling_circles, rolling_circles_length, unclassified, unclassified_length, small_rna, small_rna_length, satellites, satellites_length, simple_repeats, simple_repeats_length, low_complexity, low_complexity_length, total_non_repetitive_length, total_repetitive_length, numberN, percentN) VALUES ({analysisID}, {retroelements}, {retroelements_length}, {dna_transposons}, {dna_transposons_length}, {rolling_circles}, {rolling_circles_length}, {unclassified}, {unclassified_length}, {small_rna}, {small_rna_length}, {satellites}, {satellites_length}, {simple_repeats}, {simple_repeats_length}, {low_complexity}, {low_complexity_length}, {total_non_repetitive_length}, {total_repetitive_length}, {numberN}, {percentN})"
            )
            connection.commit()
            return 1, {}
        except:
            return 0, {
                "label": "Error",
                "message": "Nothing imported!",
                "type": "error",
            }

    # ================== BOOKMARK ================== #
    # ADD NEW BOOKMARK
    def addNewBookmark(self, userID, assemblyID):
        """
        add new bookmark
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"INSERT INTO bookmark (userID, assemblyID) VALUES ({userID}, {assemblyID})"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Error while adding bookmark!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully bookmarked assembly!",
            "type": "success",
        }

    # REMOVE BOOKMARK
    def removeBookmark(self, userID, assemblyID):
        """
        remove bookmark
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"DELETE FROM bookmark WHERE userID={userID} AND assemblyID={assemblyID}"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Error while removing bookmark!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully removed bookmark!",
            "type": "success",
        }
