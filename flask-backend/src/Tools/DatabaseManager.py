from genericpath import isfile
from os import getenv
from flask.helpers import send_file
import mysql.connector
from hashlib import sha512
from math import ceil
from json import dumps, loads

from .FileManager import FileManager
from .Parsers import Parsers
from .Mysql import HOST_URL as MYSQL_HOST_URL
from .Paths import BASE_PATH_TO_JBROWSE, BASE_PATH_TO_STORAGE, BASE_PATH_TO_UPLOAD, BASE_PATH_TO_IMPORT

fileManager = FileManager()
parsers = Parsers()


class DatabaseManager:
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
            cursor.execute(f"INSERT INTO user (username, password, role) VALUES ('{username}', '{password}', '{role}')")
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
    def reloadTaxonIDsFromFile(self, userID=1, reloadFromNCBI=True):
        """
        Takes names.dmp from storage directory and fills db with
        all tax IDs
        """

        if reloadFromNCBI:
            status, notification = fileManager.reloadTaxonFilesFromNCBI()
            if not status:
                return 0, notification

        connection, cursor = self.updateConnection()

        taxonData = []
        try:
            with open(f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/names.dmp", "r") as taxonFile, open(
                f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/nodes.dmp", "r"
            ) as nodeFile:
                taxonData = taxonFile.readlines()
                nodeData = nodeFile.readlines()
                taxonFile.close()
                nodeFile.close()
        except:

            return 0, {
                "label": "Error",
                "message": f"Error while reading names.dmp/nodes.dmp. Check if files are provided at '{BASE_PATH_TO_STORAGE}taxa/taxdmp/' directory!",
                "type": "error",
            }

        try:
            cursor.execute("DELETE FROM taxon")
            connection.commit()
            cursor.execute("ALTER TABLE taxon AUTO_INCREMENT = 1")
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Error while resetting database!",
                "type": "error",
            }

        try:
            taxonID = None
            counter = 0
            values = ""
            commonName = ""
            for index, line in enumerate(taxonData):
                taxonSplit = line.split("\t")
                taxonID = int(taxonSplit[0])

                if "scientific name" in line:
                    scientificName = taxonSplit[2].replace("'", "")

                if "genbank common name" in line:
                    commonName = taxonSplit[2].replace("'", "")

                if index < len(taxonData) - 1 and int(taxonData[index + 1].split("\t")[0]) != taxonID:
                    if not scientificName or not taxonID:
                        cursor.execute("DELETE FROM taxon")
                        connection.commit()
                        return 0, {
                            "label": "Error",
                            "message": "Error while inserting taxa (Missing name)!",
                            "type": "error",
                        }

                    nodeSplit = nodeData[counter].split("\t")
                    if int(nodeSplit[0]) != taxonID:
                        cursor.execute("DELETE FROM taxon")
                        connection.commit()
                        cursor.execute("ALTER TABLE taxon AUTO_INCREMENT = 1")
                        connection.commit()
                        return 0, {
                            "label": "Error",
                            "message": "Error while retreiving node data (Missing node)!",
                            "type": "error",
                        }

                    parentTaxonID = int(nodeSplit[2])
                    rank = nodeSplit[4].replace("'", "")

                    values += (
                        f"({taxonID}, {parentTaxonID}, '{scientificName}', '{rank}', {userID}, NOW(), '{commonName}'),"
                    )
                    counter += 1
                    taxonID = None
                    scientificName = ""
                    commonName = ""

                    if counter % 5000 == 0 and counter > 0:
                        values = values[:-1]
                        sql = f"INSERT INTO taxon (ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, lastUpdatedBy, lastUpdatedOn, commonName) VALUES {values}"
                        cursor.execute(sql)
                        connection.commit()
                        values = ""

            values = values[:-1]
            sql = f"INSERT INTO taxon (ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, lastUpdatedBy, lastUpdatedOn, commonName) VALUES {values}"
            cursor.execute(sql)
            connection.commit()
        except Exception as err:
            cursor.execute("DELETE FROM taxon")
            connection.commit()
            cursor.execute("ALTER TABLE taxon AUTO_INCREMENT = 1")
            connection.commit()
            return 0, {
                "label": "Error",
                "message": "Error while inserting taxa into database!",
                "type": "error",
            }

        try:
            cursor.execute(f"SELECT COUNT(ncbiTaxonID) FROM taxon")
            taxaCount = cursor.fetchone()[0]
        except:
            cursor.execute("DELETE FROM taxon")
            connection.commit()
            cursor.execute("ALTER TABLE taxon AUTO_INCREMENT = 1")
            connection.commit()
            return 0, {
                "label": "Error",
                "message": "Error while receiving taxon count!",
                "type": "error",
            }

        if taxaCount:
            return taxaCount, {
                "label": "Success",
                "message": f"{taxaCount:,} taxa imported!",
                "type": "success",
            }
        else:
            cursor.execute("DELETE FROM taxon")
            connection.commit()
            cursor.execute("ALTER TABLE taxon AUTO_INCREMENT = 1")
            connection.commit()
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

    # UPDATE TAXON TREE
    def updateTaxonTree(self):
        """
        Update existing tree
        """
        lineageDict = {}
        taxonInfo = {}
        level = 0
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT assembly.taxonID, taxon.ncbiTaxonID, taxon.parentNcbiTaxonID, taxon.scientificName, taxon.taxonRank, taxon.imageStatus FROM assembly, taxon WHERE assembly.taxonID = taxon.id"
            )
            taxa = [x for x in cursor.fetchall()]
            taxa = set(taxa)
            taxa = list(taxa)

            if len(taxa) == 0:
                with open(f"{BASE_PATH_TO_STORAGE}/taxa/tree.json", "w") as treeFile:
                    treeFile.write("")
                    treeFile.close()
                return 1, {
                    "label": "Info",
                    "message": f"No assemblies in database!",
                    "type": "info",
                }

            taxonSqlString = "(" + ",".join([str(x[2]) for x in taxa]) + ")"

            for taxon in taxa:
                taxonInfo.update(
                    {
                        taxon[1]: {
                            "name": taxon[3],
                            "rank": taxon[4],
                            "level": level,
                            "id": taxon[0],
                            "ncbiID": taxon[1],
                            "imageStatus": taxon[5],
                        }
                    }
                )
                if taxon[2] not in lineageDict:
                    lineageDict.update({taxon[2]: {"children": [taxon[1]]}})
                else:
                    children = lineageDict[taxon[2]]["children"]
                    children.append(taxon[1])

        except:
            return {}, {
                "label": "Error",
                "message": f"Error while fetching taxa in database!",
                "type": "error",
            }

        try:
            connection, cursor = self.updateConnection()
            safetyCounter = 0
            while (len(taxa) > 1 or (1, 1, "root", "no rank") not in taxa) and safetyCounter < 100:
                level += 1
                cursor.execute(
                    f"SELECT ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, id, imageStatus FROM taxon WHERE ncbiTaxonID IN {taxonSqlString}"
                )
                taxa = cursor.fetchall()
                taxonSqlString = "(" + ",".join([str(x[1]) for x in taxa]) + ")"
                safetyCounter += 1

                for taxon in taxa:
                    taxonInfo.update(
                        {
                            taxon[0]: {
                                "name": taxon[2],
                                "rank": taxon[3],
                                "level": level,
                                "id": taxon[4],
                                "ncbiID": taxon[0],
                                "imageStatus": taxon[5],
                            }
                        }
                    )
                    if taxon[1] not in lineageDict:
                        lineageDict.update({taxon[1]: {"children": [taxon[0]]}})
                    else:
                        if taxon[0] not in lineageDict[taxon[1]]["children"] and taxon[0] != 1:
                            children = lineageDict[taxon[1]]["children"]
                            children.append(taxon[0])

        except:
            return {}, {
                "label": "Error",
                "message": f"Error while fetching parent nodes!",
                "type": "error",
            }

        for id in taxonInfo:
            if id in lineageDict:
                lineageDict[id].update(taxonInfo[id])
            else:
                lineageDict[id] = taxonInfo[id]

        currentLevel = 1
        while currentLevel <= level:
            for id in lineageDict:
                if lineageDict[id]["level"] == currentLevel:
                    for index, child in enumerate(lineageDict[id]["children"]):
                        childNode = lineageDict[child]
                        lineageDict[id]["children"][index] = childNode
            currentLevel += 1

        with open(f"{BASE_PATH_TO_STORAGE}/taxa/tree.json", "w") as treeFile:
            treeFile.write(dumps(lineageDict[1]))
            treeFile.close()

        return lineageDict[1], {}

    # FETCH TAXON TREE
    def fetchTaxonTree(self):
        """
        Fetch taxon tree from file
        """
        connection, cursor = self.updateConnection()

        try:
            with open(f"{BASE_PATH_TO_STORAGE}/taxa/tree.json", "r") as treeFile:
                treeData = treeFile.readline()
                treeData = loads(treeData)
                treeFile.close()

            return treeData, {}
        except:
            return {}, {
                "label": "Error",
                "message": f"Error while fetching taxon tree from tree.json!",
                "type": "error",
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

        status, notification = self.updateTaxonTree()
        if not status:
            return 0, notification

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
            f"{BASE_PATH_TO_STORAGE}taxa/images/" + taxonID + ".thumbnail.jpg"
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

        status, notification = self.updateTaxonTree()
        if not status:
            return 0, notification

        return taxonID, {
            "label": "Success",
            "message": f"Successfully removed image of taxon with NCBI taxon ID {taxonID}!",
            "type": "success",
        }

    # FETCH TAXON IMAGE
    def fetchSpeciesProfilePictureTaxonID(self, taxonID):
        """
        send image to frontend
        """

        if not isfile(f"{BASE_PATH_TO_STORAGE}taxa/images/" + taxonID + ".thumbnail.jpg"):
            return {
                "label": "Error",
                "message": f"Error loading profile picture for species {taxonID}. No such file!",
                "type": "error",
            }

        return send_file(
            f"{BASE_PATH_TO_STORAGE}taxa/images/" + taxonID + ".thumbnail.jpg",
            "image/jpg",
        )

    # ================== ASSEMBLY ================== #
    # FETCH ALL ASSEMBLIES
    def fetchAllAssemblies(self, page=1, range=0, search="", userID=0):
        """
        Gets all assemblies from db
        """
        try:
            api = getenv("API_ADRESS")
            if not api:
                return (
                    [],
                    {},
                    {
                        "label": "Error",
                        "message": "Environment variables missing!",
                        "type": "error",
                    },
                )
        except:
            return (
                [],
                {},
                {
                    "label": "Error",
                    "message": "Environment variables missing!",
                    "type": "error",
                },
            )
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
                            or search in str(x["ncbiTaxonID"])
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
                                "previous": f"{api}/fetchAllAssemblies?page=1&range={range}&search={search}&userID={userID}"
                            }
                        )
                    else:
                        pagination.update(
                            {
                                "previous": f"{api}/fetchAllAssemblies?page={page-1}&range={range}&search={search}&userID={userID}"
                            }
                        )

                    if page + 1 == pages:
                        lastRange = len(assemblies) % range
                        if lastRange == 0:
                            lastRange = range
                        pagination.update(
                            {
                                "next": f"{api}/fetchAllAssemblies?page={page+1}&range={lastRange}&search={search}&userID={userID}"
                            }
                        )
                    elif page + 1 > pages:
                        lastRange = len(assemblies) % range
                        if lastRange == 0:
                            lastRange = range
                        pagination.update(
                            {
                                "next": f"{api}/fetchAllAssemblies?page={page}&range={lastRange}&search={search}&userID={userID}"
                            }
                        )
                    else:
                        pagination.update(
                            {
                                "next": f"{api}/fetchAllAssemblies?page={page+1}&range={range}&search={search}&userID={userID}"
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

                assembly.update({"addedByUsername": addedBy, "lastUpdatedByUsername": lastUpdatedBy})
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

    # FETCH MULTIPLE ASSEMBLIES BY NCBI TAXON IDS
    def fetchAssembliesByTaxonIDs(self, taxonIDsString):
        """
        Gets taxa by taxon id from taxon table
        """
        try:
            connection, cursor = self.updateConnection()
            taxonIDs = taxonIDsString.split(",")
            taxonSqlString = "(" + ",".join([x for x in taxonIDs]) + ")"
            cursor.execute(
                f"SELECT assembly.id, assembly.name, taxon.scientificName, taxon.imageStatus, assembly.taxonID, taxon.ncbiTaxonID FROM assembly, taxon WHERE assembly.taxonID = taxon.id AND taxon.id IN {taxonSqlString}"
            )
            row_headers = [x[0] for x in cursor.description]
            assemblies = cursor.fetchall()

        except:
            return {}, {
                "label": "Error",
                "message": f"Error while fetching assembly information from database!",
                "type": "error",
            }

        if len(assemblies):
            return [dict(zip(row_headers, x)) for x in assemblies], {}
        else:
            return {}, {
                "label": "Info",
                "message": f"No assemblies found!",
                "type": "info",
            }

    # FETCH ONE ASSEMBLY
    def fetchAssemblyInformationByAssemblyID(self, id, userID):
        """
        Gets all necessary information for one assembly from db
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * FROM assembly, taxon WHERE assembly.id={id} AND assembly.taxonID=taxon.id")

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
            assemblyInformation.update({"assemblyStatistics": dict(zip(row_headers, assemblyStatistics))})
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
            cursor.execute(f"SELECT * FROM bookmark WHERE assemblyID={id} AND userID={userID}")
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
    def addNewAssembly(
        self,
        taxonID: int,
        name: str,
        path: str,
        userID: int,
        additionalFilesPath: str = "",
    ):
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

        path, notification = fileManager.moveAssemblyToStorage(path, name, additionalFilesPath)

        if not path:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
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
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting assembly into database!",
                "type": "error",
            }

        fileManager.notify_assembly(lastID, name, path)

        data, notification = parsers.parseFasta(path)

        if not data:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
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
            cursor.execute(f"INSERT INTO assemblyStatistics ({fields}) VALUES ({values})")
            connection.commit()
        except:
            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{name}")
            self.removeAssemblyByAssemblyID(lastID)
            return 0, {
                "label": "Error",
                "message": "Something went wrong while inserting assembly statistics into database!",
                "type": "error",
            }

        status, notification = self.updateTaxonTree()
        if not status:
            return 0, notification

        return {
            "assemblyId": lastID,
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
            # TODO signal deletion + handle in jbrowse

            status, notification = self.updateTaxonTree()
            if not status:
                return 0, notification
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

    # # RENAME ASSEMBLY
    # def renameAssembly(self, id, name, userID):
    #     """
    #     update assembly name
    #     """
    #     name = name.replace("/", "_")
    #     try:
    #         connection, cursor = self.updateConnection()
    #         cursor.execute(f"SELECT path from assembly where id={id}")
    #         path = cursor.fetchone()[0]
    #         pathSplit = path.split("/")
    #         oldPath = "/".join(pathSplit[:5])
    #         oldName = pathSplit[4]
    #         pathSplit[4] = name
    #         newPath = "/".join(pathSplit[:5])
    #         pathSplit[-1] = f"{name}_assembly.fasta"
    #         fullNewPath = "/".join(pathSplit)
    #         newPath, notification = fileManager.renameDirectory(oldPath, newPath)
    #         if not newPath:
    #             return 0, notification

    #         fileManager.renameDirectory(
    #             f"{BASE_PATH_TO_JBROWSE}/{oldName}", f"{BASE_PATH_TO_JBROWSE}/{name}"
    #         )

    #         fileManager.renameJbrowseTrack(name, "assembly", oldName, name)

    #     except:
    #         return 0, {
    #             "label": "Error",
    #             "message": "Something went wrong while renaming directory/file name",
    #             "type": "error",
    #         }

    #     try:
    #         connection, cursor = self.updateConnection()
    #         cursor.execute(
    #             f"UPDATE assembly SET name='{name}', path='{fullNewPath}', lastUpdatedBy='{userID}', lastUpdatedOn=NOW()  WHERE id={id}"
    #         )
    #         connection.commit()
    #     except:
    #         return 0, {
    #             "label": "Error",
    #             "message": "Something went wrong while updating assembly name",
    #             "type": "error",
    #         }

    #     return 1, {
    #         "label": "Success",
    #         "message": f"Successfully updated assembly name to {name}!",
    #         "type": "success",
    #     }

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
    def updateGeneralInfoByID(self, level, id, generalInfoLabel, generalInfoDescription):
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
    # FETCH ALL ANNOTATIONS BY ASSEMBLY ID
    def fetchAnnotationsByAssemblyID(self, id):
        """
        Gets all annotations by assembly ID
        """

        annotations = []
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * from annotation WHERE assemblyID={id}")

            row_headers = [x[0] for x in cursor.description]
            annotations = cursor.fetchall()
        except:
            return (
                [],
                f"Error while fetching annotations from DB. Check database connection!",
            )

        if len(annotations):
            return [dict(zip(row_headers, x)) for x in annotations], {}
        else:
            return [], {
                "label": "Info",
                "message": "No annotations for given assembly in database!",
                "type": "info",
            }

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

        path, notification = fileManager.moveAnnotationToStorage(path, assemblyName, name, additionalFilesPath)

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

        fileManager.notify_annotation(int(assemblyID), assemblyName, name, path)

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

        return {"assemblyID": assemblyID, "name": name, "path": path, "additionalFilesPath": additionalFilesPath,}, {
            "label": "Success",
            "message": f"Successfully imported annotation!",
            "type": "success",
        }

    # REMOVE ANNOTATION
    def removeAnnotationByAnnotationID(self, id):
        """
        remove annotation by id
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT assembly.name, annotation.name from assembly, annotation where annotation.id={id} AND annotation.assemblyID=assembly.id"
            )
            assemblyName, annotationName = cursor.fetchone()
            cursor.execute(f"DELETE FROM annotation WHERE id={id}")

            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyName}/gff3/{annotationName}")
            status, notification = fileManager.removeTrackFromJbrowse(assemblyName, annotationName, "annotation")

            if not status:
                return 0, notification

            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while removing annotation from database!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully removed annotation '{annotationName}'!",
            "type": "success",
        }

    # ================== MAPPING ================== #
    # FETCH ALL MAPPINGS BY ASSEMBLY ID
    def fetchMappingsByAssemblyID(self, id):
        """
        Gets all mappings by assembly ID
        """

        mappings = []
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * from mapping WHERE assemblyID={id}")

            row_headers = [x[0] for x in cursor.description]
            mappings = cursor.fetchall()
        except:
            return (
                [],
                f"Error while fetching mappings from DB. Check database connection!",
            )

        if len(mappings):
            return [dict(zip(row_headers, x)) for x in mappings], {}
        else:
            return [], {
                "label": "Info",
                "message": "No mappings for given assembly in database!",
                "type": "info",
            }

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

        path, notification = fileManager.moveMappingToStorage(path, assemblyName, name, additionalFilesPath)

        fileManager.notify_mapping(int(assemblyID), assemblyName, name, path)

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

        return {"assemblyID": assemblyID, "name": name, "path": path, "additionalFilesPath": additionalFilesPath,}, {
            "label": "Success",
            "message": f"Successfully imported mapping!",
            "type": "success",
        }

    # REMOVE MAPPING
    def removeMappingByMappingID(self, id):
        """
        remove mapping by id
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT assembly.name, mapping.name from assembly, mapping where mapping.id={id} AND mapping.assemblyID=assembly.id"
            )
            assemblyName, mappingName = cursor.fetchone()
            cursor.execute(f"DELETE FROM mapping WHERE id={id}")

            fileManager.deleteDirectories(f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyName}/mappings/{mappingName}")
            status, notification = fileManager.removeTrackFromJbrowse(assemblyName, mappingName, "mapping")

            if not status:
                return 0, notification

            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while removing mapping from database!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully removed mapping '{mappingName}'!",
            "type": "success",
        }

    # ================== ANALYSIS ================== #
    # FETCH ALL ANALYSES BY ASSEMBLY ID
    def fetchAnalysesByAssemblyID(self, id):
        """
        Gets all analyses by assembly ID
        """

        analyses = []
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(f"SELECT * from analysis WHERE assemblyID={id}")

            row_headers = [x[0] for x in cursor.description]
            analyses = cursor.fetchall()
        except:
            return (
                [],
                f"Error while fetching analyses from DB. Check database connection!",
            )

        if len(analyses):
            return [dict(zip(row_headers, x)) for x in analyses], {}
        else:
            return [], {
                "label": "Info",
                "message": "No analyses for given assembly in database!",
                "type": "info",
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

        if "3D_plot.html" in fileName and fileName.endswith(".html"):
            type = "milts"
        elif "short_summary" in fileName and fileName.endswith(".txt"):
            type = "busco"
        elif "report_summary" in fileName and fileName.endswith(".txt"):
            type = "fcat"
        elif fileName.endswith(".tbl"):
            type = "repeatmasker"
        else:
            return 0, {
                "label": "Error",
                "message": "Unknown analysis type!",
                "type": "error",
            }

        print(type, path, name, additionalFilesPath, assemblyName)
        path, notification = fileManager.moveFileToStorage(type, path, name, additionalFilesPath, assemblyName)

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

                importStatus, notification = self.importRepeatmasker(lastID, repeatmaskerData)

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

        return {"assemblyID": assemblyID, "name": name, "path": path, "additionalFilesPath": additionalFilesPath,}, {
            "label": "Success",
            "message": f"Successfully imported analysis!",
            "type": "success",
        }

    # REMOVE ANALYSIS
    def removeAnalysisByAnalysisID(self, id):
        """
        remove analysis by id
        """

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT assembly.name, analysis.name, analysis.type from assembly, analysis where analysis.id={id} AND analysis.assemblyID=assembly.id"
            )
            assemblyName, analysisName, analysisType = cursor.fetchone()
            cursor.execute(f"DELETE FROM analysis WHERE id={id}")

            fileManager.deleteDirectories(
                f"{BASE_PATH_TO_STORAGE}assemblies/{assemblyName}/{analysisType}/{analysisName}"
            )
            connection.commit()
        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while removing analysis from database!",
                "type": "error",
            }

        return 1, {
            "label": "Success",
            "message": f"Successfully removed analysis '{analysisName}'!",
            "type": "success",
        }

        # FETCH MILTS 3D PLOT

    def fetchMiltsPlotByPath(self, path):
        """
        send milts plot to frontend
        """

        if not isfile(path):
            return {
                "label": "Error",
                "message": f"Error loading MILTS 3D plot. No such file!",
                "type": "error",
            }

        return send_file(path, "text/html")

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
            connection, cursor = self.updateConnection()
            cursor.execute(f"DELETE FROM ANALYSIS WHERE id = {analysisID}")
            connection.commit()
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
            connection, cursor = self.updateConnection()
            cursor.execute(f"DELETE FROM ANALYSIS WHERE id = {analysisID}")
            connection.commit()
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

        if "sines" in repeatmaskerData:
            sines = repeatmaskerData["sines"]
        if "sines_length" in repeatmaskerData:
            sines_length = repeatmaskerData["sines_length"]
        if "lines" in repeatmaskerData:
            lines = repeatmaskerData["lines"]
        if "lines_length" in repeatmaskerData:
            lines_length = repeatmaskerData["lines_length"]
        if "ltr_elements" in repeatmaskerData:
            ltr_elements = repeatmaskerData["ltr_elements"]
        if "ltr_elements_length" in repeatmaskerData:
            ltr_elements_length = repeatmaskerData["ltr_elements_length"]
        if "dna_elements" in repeatmaskerData:
            dna_elements = repeatmaskerData["dna_elements"]
        if "dna_elements_length" in repeatmaskerData:
            dna_elements_length = repeatmaskerData["dna_elements_length"]
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
            total_non_repetitive_length = repeatmaskerData["total_non_repetitive_length"]
        if "total_repetitive_length" in repeatmaskerData:
            total_repetitive_length = repeatmaskerData["total_repetitive_length"]
        if "numberN" in repeatmaskerData:
            numberN = repeatmaskerData["numberN"]
        if "percentN" in repeatmaskerData:
            percentN = repeatmaskerData["percentN"]

        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"INSERT INTO repeatmasker (analysisID, sines, sines_length, `lines`, lines_length, ltr_elements, ltr_elements_length, dna_elements, dna_elements_length, rolling_circles, rolling_circles_length, unclassified, unclassified_length, small_rna, small_rna_length, satellites, satellites_length, simple_repeats, simple_repeats_length, low_complexity, low_complexity_length, total_non_repetitive_length, total_repetitive_length, numberN, percentN) VALUES ({analysisID}, {sines}, {sines_length}, {lines}, {lines_length}, {ltr_elements}, {ltr_elements_length}, {dna_elements}, {dna_elements_length}, {rolling_circles}, {rolling_circles_length}, {unclassified}, {unclassified_length}, {small_rna}, {small_rna_length}, {satellites}, {satellites_length}, {simple_repeats}, {simple_repeats_length}, {low_complexity}, {low_complexity_length}, {total_non_repetitive_length}, {total_repetitive_length}, {numberN}, {percentN})"
            )
            connection.commit()
            return 1, {}
        except:
            connection, cursor = self.updateConnection()
            cursor.execute(f"DELETE FROM ANALYSIS WHERE id = {analysisID}")
            connection.commit()
            return 0, {
                "label": "Error",
                "message": "Nothing imported! Maybe the selected Version of Repeatmasker is not supported!",
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
            cursor.execute(f"INSERT INTO bookmark (userID, assemblyID) VALUES ({userID}, {assemblyID})")
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
            cursor.execute(f"DELETE FROM bookmark WHERE userID={userID} AND assemblyID={assemblyID}")
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

    def importFiles(self, importSpecifications):
        """
        start import from object
        """
        if not importSpecifications:
            return 0, {
                "label": "Error",
                "message": f"No data!",
                "type": "error",
            }

        if not importSpecifications["taxon"]:
            return 0, {
                "label": "Error",
                "message": f"No target taxon specified!",
                "type": "error",
            }
        taxon = importSpecifications["taxon"]

        if not importSpecifications["assembly"]:
            return 0, {
                "label": "Error",
                "message": f"No target assembly specified!",
                "type": "error",
            }
        assembly = importSpecifications["assembly"]

        genericAssemblyName = taxon["scientificName"] + "_" + assembly["id"]
        pathToAssembly = BASE_PATH_TO_IMPORT + assembly["path"]
        print(pathToAssembly)

        if importSpecifications["assembly"]["new"]:
            a, b = self.addNewAssembly(taxon["id"], genericAssemblyName, pathToAssembly, 1)

        print(a)
        print(b)

        return 0, {}
