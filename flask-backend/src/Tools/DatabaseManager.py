import mysql.connector
from hashlib import sha512
from math import ceil

from .FileManager import FileManager
from .Parsers import Parsers

fileManager = FileManager()
parsers = Parsers()


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
    def reloadTaxonIDsFromFile(self):
        """
        Takes names.dmp from /src directory and fills db with
        all tax IDs
        """

        connection, cursor = self.updateConnection()

        taxonData = []
        try:
            with open("src/Tools/dependencies/names.dmp", "r") as taxonFile:
                taxonData = taxonFile.readlines()
                taxonFile.close()
        except:
            return (
                0,
                "Error: Error while reading names.dmp. Check if file is provided at src/Tools/dependencies/ directory!",
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
                    values += f"({taxonID}, '{scientificName}'),"
                    counter += 1
                    taxonID = None

                if counter == 5000:
                    values = values[:-1]
                    sql = f"INSERT INTO taxon (ncbiTaxonID, scientificName) VALUES {values}"
                    cursor.execute(sql)
                    connection.commit()
                    counter = 0
                    values = ""

            values = values[:-1]
            sql = f"INSERT INTO taxon (ncbiTaxonID, scientificName) VALUES {values}"
            cursor.execute(sql)
            connection.commit()
        except:
            return 0, "Error: Error while inserting taxa!"

        try:
            cursor.execute(f"SELECT COUNT(ncbiTaxonID) FROM taxon")
            taxaCount = cursor.fetchone()[0]
        except:
            return 0, "Error: Error while receiving taxon count!"

        if taxaCount:
            return taxaCount, ""
        else:
            return 0, "No taxa imported"

    # ================== ASSEMBLY ================== #
    # FETCH ALL ASSEMBLIES
    def fetchAllAssemblies(self, page=1, range=0, search=""):
        """
        Gets all assemblies from db
        """
        try:
            connection, cursor = self.updateConnection()
            cursor.execute(
                f"SELECT assembly.id, assembly.name, taxon.scientificName, taxon.imageStored, assembly.taxonID FROM assembly, taxon WHERE assembly.taxonID = taxon.ncbiTaxonID"
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
                                "previous": f"http://localhost:3002/fetchAllAssemblies?page=1&range={range}&search={search}"
                            }
                        )
                    else:
                        pagination.update(
                            {
                                "previous": f"http://localhost:3002/fetchAllAssemblies?page={page-1}&range={range}&search={search}"
                            }
                        )

                    if page + 1 == pages:
                        lastRange = len(assemblies) % range
                        if lastRange == 0:
                            lastRange = range
                        pagination.update(
                            {
                                "next": f"http://localhost:3002/fetchAllAssemblies?page={page+1}&range={lastRange}&search={search}"
                            }
                        )
                    elif page + 1 > pages:
                        lastRange = len(assemblies) % range
                        if lastRange == 0:
                            lastRange = range
                        pagination.update(
                            {
                                "next": f"http://localhost:3002/fetchAllAssemblies?page={page}&range={lastRange}&search={search}"
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
