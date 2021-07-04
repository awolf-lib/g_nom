import mysql.connector
from hashlib import sha512

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
            auth_plugin='mysql_native_password'
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
            cursor.execute(
                f"SELECT * FROM user where username='{username}'")
            user = cursor.fetchone()
            if user:
                return {}, {"label": "Error", "message": f"Name '{username}' already exists!", "type": "error"}
        except:
            return {}, {"label": "Error", "message": "Something went wrong while adding user to db!", "type": "error"}

        checkpoint = False
        try:
            connection, cursor = self.updateConnection()
            password = sha512(f"{password}$g#n#o#m$".encode('utf-8')).hexdigest()
            cursor.execute(
                f"INSERT INTO user (username, password, role) VALUES ('{username}', '{password}', '{role}')")
            connection.commit()
            checkpoint = True
        except:
            return {}, {"label": "Error", "message": "Something went wrong while adding user to db!", "type": "error"}

        if checkpoint:
            return {"username": username, "role": role}, {"label": "Success", "message": f"User '{username}' with role '{role}' added to database!", "type": "success"}
        else:
            return {}, {"label": "Error", "message": "Something went wrong while adding user to db!", "type": "error"}

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
            return 0, "Error: Error while reading names.dmp. Check if file is provided at src/Tools/dependencies/ directory!"

        try:
            taxonID = None
            counter = 0
            values = ""
            for index, line in enumerate(taxonData):
                split = line.split("\t")
                taxonID = int(split[0])

                if "scientific name" in line:
                    scientificName = split[2].replace("'", "")

                if index < len(taxonData) - 1 and int(taxonData[index+1].split("\t")[0]) != taxonID:
                    values += f"({taxonID}, '{scientificName}'),"
                    counter += 1
                    taxonID = None

                if counter == 5000:
                    values = values[:-1]
                    sql = f"INSERT INTO taxon (id, scientificName) VALUES {values}"
                    cursor.execute(sql)
                    connection.commit()
                    counter = 0
                    values = ""

            values = values[:-1]
            sql = f"INSERT INTO taxon (id, scientificName) VALUES {values}"
            cursor.execute(sql)
            connection.commit()
        except:
            return 0, "Error: Error while inserting taxa!"

        try:
            cursor.execute(f"SELECT COUNT(id) FROM taxon")
            taxaCount = cursor.fetchone()[0]
        except:
            return 0, "Error: Error while receiving taxon count!"

        if taxaCount:
            return taxaCount, ""
        else:
            return 0, "No taxa imported"

    # FETCH ONE TAXON BY TAXON ID
    def fetchTaxonByTaxonID(self, taxonID):
        """
            Gets taxon by taxon id from taxon table
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(f"SELECT * FROM taxon WHERE id = {taxonID}")
            row_headers = [x[0] for x in cursor.description]
            taxon = cursor.fetchone()

        except:
            return {}, f"Error while fetching taxon information!"

        if taxon:
            return dict(zip(row_headers, taxon)), ""
        else:
            return {}, f"No taxon with taxonomy ID {taxonID} found!"

    # FETCH PROFILE IMAGE
    def fetchImageByTaxonID(self, taxonID):
        """
            Gets image path by taxon id from taxon table
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT taxon.imagePath FROM taxon WHERE id = {taxonID}")
            imagePath = cursor.fetchone()[0]
        except:
            return "", f"Error while fetching from DB. Check database connection!"

        if imagePath:
            return imagePath, ""
        else:
            return "", f"No image to taxonomy ID {taxonID} found! Upload image to database!"

    # ================== TAXON - GENERAL INFO ================== #
    # FETCH ALL GENERAL INFOS FOR ONE SPECIES BY TAXON ID
    def fetchTaxonGeneralInfosByTaxonID(self, taxonID):
        """
            Get general infos for each taxon id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT * FROM generalInfo WHERE taxonID = {taxonID}")

            row_headers = [x[0] for x in cursor.description]
            generalInfos = cursor.fetchall()
        except:
            return [], f"Error while fetching from DB. Check database connection!"

        if len(generalInfos):
            return dict(zip(row_headers, generalInfos))
        else:
            return {}, f"No general infos for taxonID {taxonID} found!"

    # ADD NEW GENERAL INFO
    def addTaxonGeneralInfo(self, taxonID, keyword, info, category=None):
        """
            Add a general info to db
        """
        connection, cursor = self.updateConnection()

        taxon = ""
        try:
            cursor.execute(
                f"INSERT INTO generalInfo (taxonID, category, keyword, info) VALUES ({taxonID}, '{category}', '{keyword}', '{info}')")

            taxon = cursor.fetchone()
            connection.commit()
        except:
            return {}, f"Error while inserting ('{category}', '{keyword}', {info}) into db."

        if taxon:
            return {"category": category, "keyword": keyword, "info": info}, ""
        else:
            return {}, f"Error while inserting ('{category}', '{keyword}', {info}) into db."

    # REMOVE ONE TAXON GENERAL INFO BY ID
    def removeTaxonGeneralInfo(self, generalInfoID):
        """
            Remove a taxon general info from db
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"DELETE FROM generalInfo WHERE id={generalInfoID}")

            connection.commit()
        except:
            return 0, f"Error while deleting general info from db."

        return generalInfoID, ""

    # ================== ASSEMBLY ================== #
    # FETCH ALL ASSEMBLIES
    def fetchAllAssemblies(self):
        """
            Gets all assemblies from db
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT assembly.id, assembly.name, taxon.scientificName, assembly.taxonID FROM assembly, taxon WHERE assembly.taxonID = taxon.id")

            row_headers = [x[0] for x in cursor.description]
            taxon = cursor.fetchall()
        except:
            return [], f"Error while fetching from DB. Check database connection!"

        if len(taxon):
            return [dict(zip(row_headers, x)) for x in taxon], ""
        else:
            return [], f"No assemblies found! Upload genomes first!"

    # FETCH ALL ASSEMBLIES OF ONE SPECIES BY TAXON ID
    def fetchAssembliesByTaxonID(self, taxonID):
        """
            Gets all assemblies with given taxon id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT assembly.id, assembly.name, taxon.scientificName, assembly.taxonID FROM assembly, taxon WHERE assembly.taxonID = {taxonID} AND assembly.taxonID = taxon.id")

            row_headers = [x[0] for x in cursor.description]
            assemblies = cursor.fetchall()
        except:
            return [], f"Error while fetching from DB. Check database connection!"

        if len(assemblies):
            return [dict(zip(row_headers, x)) for x in assemblies], ""
        else:
            return [], f"No assemblies for taxonomy ID {taxonID} found!"

    # FETCH ONE ASSEMBLY BY ASSEMBLY ID
    def fetchAssemblyByAssemblyID(self, assemblyID):
        """
            Get assembly with given assembly id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT assembly.id, assembly.name, taxon.scientificName, assembly.taxonID FROM assembly, taxon WHERE assembly.assemblyID = {assemblyID} AND assembly.taxonID = taxon.id")

            row_headers = [x[0] for x in cursor.description]
            taxon = cursor.fetchone()
        except:
            return [], f"Error while fetching from DB. Check database connection!"

        if taxon:
            return dict(zip(row_headers, taxon)), ""
        else:
            return {}, f"No assembly with assemblyID {assemblyID} found! Upload assembly first!"

    # ADD NEW ASSEMBLY
    def addAssembly(self, name, taxonID, path, additionalFilesPath=None):
        """
            Add an assembly to db
        """
        connection, cursor = self.updateConnection()

        taxon = ""
        try:
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO assembly (name, taxonID, path) VALUES ('{name}', {taxonID}, '{path}')")
            else:
                cursor.execute(
                    f"INSERT INTO assembly (name, taxonID, path. additionalFilesPath) VALUES ('{name}', {taxonID}, '{path}', '{additionalFilesPath}')")

            taxon = cursor.fetchone()
            connection.commit()
        except:
            return {}, f"Error while importing new assembly!"

        if taxon:
            return {"name": name, "taxonID": taxonID, "path": path, "additionalFilesPath": additionalFilesPath}, ""
        else:
            return {}, f"Error while inserting assembly into db."

    # REMOVE ASSEMBLY BY ASSEMBLY ID
    def removeAssembly(self, assemblyID):
        """
            Remove an assembly from db
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"DELETE FROM assembly WHERE id = {assemblyID}")

            connection.commit()
        except:
            return "", f"Error while deleting {assemblyID} from assembly table."

        return assemblyID, ""

    # ================== ASSEMBLY - GENERAL INFO ================== #
    # FETCH ALL ASSEMBLY INFOS BY ASSEMBLY ID
    def fetchAssemblyGeneralInfosByAssemblyID(self, assemblyID):
        """
            Get all assembly infos for assembly
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT * FROM assemblyGeneralInfo WHERE assemblyID = {assemblyID}")

            row_headers = [x[0] for x in cursor.description]
            assemblyInfos = cursor.fetchall()
        except:
            return [], f"Error while fetching assembly information!"

        if len(assemblyInfos):
            return [dict(zip(row_headers, x)) for x in assemblyInfos], ""
        else:
            return {}, f"No infomation for this assembly found!"

    # ADD NEW GENERAL INFO
    def addAssemblyGeneralInfo(self, taxonID, key, value):
        """
            Add a general info to assembly level
        """
        connection, cursor = self.updateConnection()

        taxon = ""
        try:
            cursor.execute(
                f"INSERT INTO assemblyGeneralInfo (taxonID, key, value) VALUES ({taxonID}, '{key}', '{value}')")

            taxon = cursor.fetchone()
            connection.commit()
        except:
            return {}, f"Error while inserting assembly info!"

        if taxon:
            return {"key": key, "value": value}, ""
        else:
            return {}, f"Error while inserting ('{key}', {value}) into db."

    # REMOVE ONE ASSEMBLY GENERAL INFO BY ID
    def removeAssemblyGeneralInfo(self, generalInfoID):
        """
            Remove an assembly general info from db
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"DELETE FROM assemblyGeneralInfo WHERE id={generalInfoID}")

            connection.commit()
        except:
            return 0, f"Error while deleting assembly general info!"

        return generalInfoID, ""

    # ================== ASSEMBLY STATISTICS - GENERAL INFO ================== #
    # FETCH ALL ASSEMBLY STATISTICS INFOS BY ASSEMBLY ID
    def fetchAssemblyStatisticGeneralInfosByAssemblyID(self, assemblyID):
        """
            Get all assembly infos for assembly
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT assemblyStatisticGeneralInfo.key, assemblyStatisticGeneralInfo.value FROM assemblyStatisticGeneralInfo, assemblyStatistic WHERE assemblyStatisticGeneralInfo.assemblyStatisticID = assemblyStatistic.id AND assemblyStatistic.assemblyID = {assemblyID}")

            row_headers = [x[0] for x in cursor.description]
            assemblyInfos = cursor.fetchall()
        except:
            return [], f"Error while fetching assembly statistic information!"

        if len(assemblyInfos):
            return [dict(zip(row_headers, x)) for x in assemblyInfos], ""
        else:
            return {}, f"No statistic general information found for this assembly!"

    # ================== ASSEMBLY STATISTICS - PLOTS ================== #
    # FETCH ALL ASSEMBLY STATISTIC PLOTS BY ASSEMBLY ID
    def fetchAssemblyStatisticPlotsByAssemblyID(self, assemblyID):
        """
            Gets assembly stat plot by assemblyID
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT assemblyPlot.path FROM assemblyPlot, assemblyStatistic WHERE assemblyPlot.assemblyStatisticID = assemblyStatistic.id AND assemblyStatistic.assemblyID = {assemblyID}")

            row_headers = [x[0] for x in cursor.description]
            plotPaths = cursor.fetchall()
        except:
            return "", f"Error while fetching from DB. Check database connection!"

        if len(plotPaths):
            return [dict(zip(row_headers, x)) for x in plotPaths], ""
        else:
            return "", f"No plots to assembly ID {assemblyID} found!"

    # ================== BOOKMARK ================== #
    # FETCH ALL BOOKMARKS BY USER ID
    def fetchBookmarkByUserID(self, userID):
        """
            Fetch all bookmark by userID
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT * FROM bookmark WHERE userID = {userID}")

            row_headers = [x[0] for x in cursor.description]
            bookmarks = cursor.fetchall()
        except:
            return {}, f"Error while fetching bookmarks!"

        if len(bookmarks):
            return [dict(zip(row_headers, x)) for x in bookmarks], ""
        else:
            return {}, f"No subscriptions for {userID} found!"

    # FETCH DASHBOARD INFO (bookmarked assemblies, taxon info, analyses status) BY USER ID
    def fetchBookmarksWithDashboardInfoByUserID(self, userID):
        """
            Fetch all bookmarked assembly by userID with additional information for dashboard
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT bookmark.assemblyID, assembly.assemblyName, taxon.scientificName, taxon.taxonID FROM assembly, taxon, bookmark WHERE bookmark.userID={userID} AND bookmark.assemblyID=assembly.assemblyID AND assembly.taxonID=taxon.taxonID")

            row_headers1 = [x[0] for x in cursor.description]
            assemblies = cursor.fetchall()
            assemblies = [dict(zip(row_headers1, x)) for x in assemblies]

            for i in assemblies:
                assemblyID = i["assemblyID"]
                cursor.execute(
                    f"SELECT analysis.type FROM analysis WHERE analysis.assemblyID={assemblyID} GROUP BY analysis.type")
                analyses = cursor.fetchall()
                i.update({"types": [x[0] for x in analyses]})
        except:
            return [], f"Error while fetching bookmarked assemblies!"

        if len(assemblies):
            return assemblies, ""
        else:
            return {}, "No bookmarks for user found!"

    # ADD NEW BOOKMARK
    def addBookmarkByAssemblyID(self, userID, assemblyID):
        """
            Add new assembly bookmark to user
        """
        connection, cursor = self.updateConnection()

        bookmark = ""
        try:
            cursor.execute(
                f"INSERT INTO bookmark (userID, assemblyID) VALUES ({userID}, {assemblyID})")

            bookmark = cursor.fetchone()
            connection.commit()
        except:
            return {}, f"Error while bookmarking ID {assemblyID}."

        if bookmark:
            return {"userID": userID, "assemblyID": assemblyID}, ""
        else:
            return 0, f"Error while bookmarking ID {assemblyID}."

    # REMOVE BOOKMARK BY BOOKMARK ID
    def removeBookmarkByBookmarkID(self, id):
        """
            remove assembly bookmark from user
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"DELETE FROM bookmark WHERE id = {id}")

            connection.commit()
        except:
            return 0, f"Error while removing bookmark."

        return id, ""

    # ================== BUSCO ================== #
    # FETCH ALL BUSCO RESULTS BY ASSEMBLY ID
    def fetchBuscoDataByAssemblyID(self, assemblyID):
        """
            Get busco results for each assembly id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT * FROM analysis, busco WHERE analysis.assemblyID = {assemblyID} AND analysis.analysisID = busco.analysisID")

            row_headers = [x[0] for x in cursor.description]
            analyses = cursor.fetchall()
        except:
            return [], f"Error while fetching Busco results!"

        if len(analyses):
            return [dict(zip(row_headers, x)) for x in analyses], ""
        else:
            return [], f"No busco results for {assemblyID} found!"

    # ================== FCAT ================== #
    # FETCH ALL FCAT RESULTS BY ASSEMBLY ID
    def fetchFcatDataByAssemblyID(self, assemblyID):
        """
            Get fCat results for each assembly id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT * from analysis, fcat WHERE analysis.assemblyID = '{assemblyID}' AND analysis.analysisID = fcat.analysisID")

            row_headers = [x[0] for x in cursor.description]
            analyses = cursor.fetchall()
        except:
            return [], f"Error while fetching fCat results!"

        if len(analyses):
            return [dict(zip(row_headers, x)) for x in analyses], ""
        else:
            return [], f"No fCat results for {assemblyID} found!"

    # ================== REPEATMASKER ================== #
    # FETCH ALL REPEATMASKER RESULTS BY ASSEMBLY ID
    def fetchRepeatmaskerDataByAssemblyID(self, assemblyID):
        """
            Get Repeatmasker results for each assembly id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT * from analysis, repeatmasker WHERE analysis.assemblyID = {assemblyID} AND analysis.analysisID = repeatmasker.analysisID")

            row_headers = [x[0] for x in cursor.description]
            analyses = cursor.fetchall()
        except:
            return [], f"Error while fetching Repeatmasker results!"

        if len(analyses):
            return [dict(zip(row_headers, x)) for x in analyses], ""
        else:
            return [], f"No fCat results for {assemblyID} found!"

    # ================== MILTS ================== #
    # FETCH ALL MILTS PLOT PATHS BY ASSEMBLY ID
    def fetchMiltsDataByAssemblyID(self, assemblyID):
        """
            Get milts results for each assembly id
        """
        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"SELECT miltsPlot.path FROM analysis, miltsPlot WHERE analysis.assemblyID = {assemblyID} AND analysis.analysisID = miltsPlot.analysisID")

            row_headers = [x[0] for x in cursor.description]
            analyses = cursor.fetchall()
        except:
            return [], f"Error while fetching Milts results!"

        if len(analyses):
            return [dict(zip(row_headers, x)) for x in analyses], ""
        else:
            return [], f"No busco results for {assemblyID} found!"

    #####################################################################################################
    # ========================================== FILE IMPORT ========================================== #
    # DISTRIBUTE FILES BY TYPE
    def importFromFile(self, assemblyID, assemblyName, taxonID, path, additionalFilesPath, type):
        """
            Imports different files by type
        """
        connection, cursor = self.updateConnection()

        try:
            if type == "assembly":
                status, error = self.newAssemblyImport(
                    assemblyID, assemblyName, taxonID, path, additionalFilesPath)
            elif type == "proteins":
                pass
            elif type == "milts" or type == "busco" or type == "fcat" or type == "repeatmasker":
                status, error = self.combinedAnalysisImport(
                    assemblyID, path, additionalFilesPath, type)
            elif type == "gff3" or type == "gff":
                status, error = self.combinedGff3Import(
                    assemblyID, path, additionalFilesPath)
            elif type == "mapping":
                status, error = self.combinedMappingImport(
                    assemblyID, path, additionalFilesPath)
        except:
            return 0, f"Error while importing new file!"

        return status, error

    # move fasta to storage, import assembly, run Quast, parse Quast, import Quast
    def newAssemblyImport(self, assemblyID, assemblyName, taxonID, path, additionalFilesPath):
        status, error = fileManager.createDirectoriesForSpecies(assemblyName)

        if not status:
            return 0, error

        fastaPath, error = fileManager.moveFastaToSpeciesStorage(
            assemblyID, path, additionalFilesPath)
        if isfile(fastaPath):
            fastaImportObject, fastaImportError = self.addAssembly(
                assemblyName, taxonID, path, additionalFilesPath=None)
            output, error = fileManager.runQuast(
                fastaPath, assemblyID, overwrite=True)
        else:
            return 0, error

        if "name" not in fastaImportObject.keys():
            return 0, fastaImportError

        if output:
            data, error = parsers.parseQuast(output)
            if data:
                status, error = self.importQuast(assemblyID, data)
                return status, error
            else:
                return 0, "Error while parsing Quast results."
        else:
            return 0, error

    # import Quast
    def importQuast(self, assemblyID, assemblyInfos):
        """
            Imports Quast assembly stats
        """

        connection, cursor = self.updateConnection()

        added_infos = []
        if "fullReportHTML" in assemblyInfos:
            try:

                fullReportPath = assemblyInfos["fullReportHTML"]
                cursor.execute(
                    f"INSERT INTO assemblyStatistic (assemblyID, path) VALUES ({assemblyID}, '{fullReportPath}')")

                report = cursor.fetchone()
                statisticID = cursor.lastrowid
                connection.commit()
            except:
                pass

        if assemblyInfos and "metadata" in assemblyInfos:
            for key in assemblyInfos["metadata"]:
                info = assemblyInfos["metadata"][key]
                try:

                    cursor.execute(
                        f"INSERT INTO assemblyStatisticGeneralInfo (assemblyStatisticID, key, value) VALUES ({statisticID}, '{key}', '{info}')")

                    lastGeneralInfo = cursor.fetchone()
                    connection.commit()
                except:
                    pass

        if "plots" in assemblyInfos:
            for plot in assemblyInfos["plots"]:
                path = assemblyInfos["plots"][plot]
                try:

                    cursor.execute(
                        f"INSERT INTO assemblyStatisticPlot (assemblyStatisticID, type, path) VALUES ({statisticID}, '{plot}', '{path}')")

                    lastPlot = cursor.fetchone()
                    connection.commit()
                except:
                    pass

        if report and lastGeneralInfo and lastPlot:
            return 1, ""
        else:
            return 0, "Nothing imported!"

    # move milts files to storage and import milts plot
    def combinedAnalysisImport(self, assemblyID, filepath, additionalFilesPath, type):
        newPath, error = fileManager.moveAnalysisToSpeciesStorage(
            assemblyID, filepath, additionalFilesPath, type)

        if newPath:
            if type == "milts":
                status, error = self.importMilts(assemblyID, newPath)
            elif type == "busco":
                status, error = self.importBusco(assemblyID, newPath)
            elif type == "fcat":
                status, error = self.importFcat(assemblyID, newPath)
            elif type == "repeatmasker":
                status, error = self.importRepeatmasker(assemblyID, newPath)
            return status, error
        else:
            return 0, error

    # import Milts

    def importMilts(self, assemblyID, path):
        """
            Imports milts path to 3D_plot.html
        """

        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"INSERT INTO analysis (assemblyID, type) VALUES ({assemblyID}, 'milts')")
            connection.commit()

            analysisID = cursor.lastrowid

            cursor.execute(
                f"INSERT INTO miltsPlot (analysisID, path) VALUES ({analysisID}, '{path}')")
            connection.commit()
            return 1, ""

        except:
            return 0, "Nothing imported!"

    # import Busco

    def importBusco(self, assemblyID, path):
        """
            Imports busco analysis results
        """

        data, error = parsers.parseBusco(path)

        if not data and error:
            return 0, error
        elif not data:
            return 0, "Error: Something went wrong while parsing busco!"

        if "completeSingle" in data:
            completeSingle = data["completeSingle"]
        else:
            completeSingle = 0

        if "completeDuplicated" in data:
            completeDuplicated = data["completeDuplicated"]
        else:
            completeDuplicated = 0

        if "fragmented" in data:
            fragmented = data["fragmented"]
        else:
            fragmented = 0

        if "missing" in data:
            missing = data["missing"]
        else:
            missing = 0

        if "total" in data:
            total = data["total"]
        else:
            total = 0

        if total != completeSingle + completeDuplicated + fragmented + missing:
            return 0, "Error: Something went wrong while parsing busco!"

        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"INSERT INTO analysis (assemblyID, type) VALUES ('{assemblyID}', 'busco')")
            connection.commit()

            analysisID = cursor.lastrowid

            cursor.execute(
                f"INSERT INTO busco (analysisID, path, completeSingle, completeDuplicated, fragmented, missing, total) VALUES ({analysisID}, '{path}', '{completeSingle}', '{completeDuplicated}', '{fragmented}', '{missing}', '{total}')")
            connection.commit()
            return 1, ""

        except:
            return 0, "Nothing imported!"

    # import fCat

    def importFcat(self, assemblyID, path):
        """
            Imports fCat analysis results
        """

        data, error = parsers.parseFcat(path)

        if not data and error:
            return 0, error
        elif not data:
            return 0, "Error: Something went wrong while parsing fCat!"

        for mode in data:
            if mode == "mode_1":
                if "similar" in data[mode]:
                    m1_similar = data[mode]["similar"]
                if "dissimilar" in data[mode]:
                    m1_dissimilar = data[mode]["dissimilar"]
                if "duplicated" in data[mode]:
                    m1_duplicated = data[mode]["duplicated"]
                if "missing" in data[mode]:
                    m1_missing = data[mode]["missing"]
                if "ignored" in data[mode]:
                    m1_ignored = data[mode]["ignored"]
                if "total" in data[mode]:
                    m1_total = data[mode]["total"]
            elif mode == "mode_2":
                if "similar" in data[mode]:
                    m2_similar = data[mode]["similar"]
                if "dissimilar" in data[mode]:
                    m2_dissimilar = data[mode]["dissimilar"]
                if "duplicated" in data[mode]:
                    m2_duplicated = data[mode]["duplicated"]
                if "missing" in data[mode]:
                    m2_missing = data[mode]["missing"]
                if "ignored" in data[mode]:
                    m2_ignored = data[mode]["ignored"]
                if "total" in data[mode]:
                    m2_total = data[mode]["total"]
            elif mode == "mode_3":
                if "similar" in data[mode]:
                    m3_similar = data[mode]["similar"]
                if "dissimilar" in data[mode]:
                    m3_dissimilar = data[mode]["dissimilar"]
                if "duplicated" in data[mode]:
                    m3_duplicated = data[mode]["duplicated"]
                if "missing" in data[mode]:
                    m3_missing = data[mode]["missing"]
                if "ignored" in data[mode]:
                    m3_ignored = data[mode]["ignored"]
                if "total" in data[mode]:
                    m3_total = data[mode]["total"]
            elif mode == "mode_4":
                if "similar" in data[mode]:
                    m4_similar = data[mode]["similar"]
                if "dissimilar" in data[mode]:
                    m4_dissimilar = data[mode]["dissimilar"]
                if "duplicated" in data[mode]:
                    m4_duplicated = data[mode]["duplicated"]
                if "missing" in data[mode]:
                    m4_missing = data[mode]["missing"]
                if "ignored" in data[mode]:
                    m4_ignored = data[mode]["ignored"]
                if "total" in data[mode]:
                    m4_total = data[mode]["total"]

        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"INSERT INTO analysis (assemblyID, type) VALUES ('{assemblyID}', 'fcat')")
            connection.commit()

            analysisID = cursor.lastrowid

            cursor.execute(
                f"INSERT INTO fcat (analysisID, path, m1_similar, m1_dissimilar, m1_duplicated, m1_missing, m1_ignored, m2_similar, m2_dissimilar, m2_duplicated, m2_missing, m2_ignored, m3_similar, m3_dissimilar, m3_duplicated, m3_missing, m3_ignored, m4_similar, m4_dissimilar, m4_duplicated, m4_missing, m4_ignored, total) VALUES ({analysisID}, '{path}', {m1_similar}, {m1_dissimilar}, {m1_duplicated}, {m1_missing}, {m1_ignored}, {m2_similar}, {m2_dissimilar}, {m2_duplicated}, {m2_missing}, {m2_ignored}, {m3_similar}, {m3_dissimilar}, {m3_duplicated}, {m3_missing}, {m3_ignored}, {m4_similar}, {m4_dissimilar}, {m4_duplicated}, {m4_missing}, {m4_ignored}, {m1_total})")
            connection.commit()
            return 1, ""

        except:
            return 0, "Nothing imported!"

    # import Repeatmasker

    def importRepeatmasker(self, assemblyID, path):
        """
            Imports Repeatmasker analysis results
        """

        data, error = parsers.parseRepeatmasker(path)

        if not data and error:
            return 0, error
        elif not data:
            return 0, "Error: Something went wrong while parsing Repeatmasker!"

        if "retroelements" in data:
            retroelements = data["retroelements"]
        if "retroelements_length" in data:
            retroelements_length = data["retroelements_length"]
        if "dna_transposons" in data:
            dna_transposons = data["dna_transposons"]
        if "dna_transposons_length" in data:
            dna_transposons_length = data["dna_transposons_length"]
        if "rolling_circles" in data:
            rolling_circles = data["rolling_circles"]
        if "rolling_circles_length" in data:
            rolling_circles_length = data["rolling_circles_length"]
        if "unclassified" in data:
            unclassified = data["unclassified"]
        if "unclassified_length" in data:
            unclassified_length = data["unclassified_length"]
        if "small_rna" in data:
            small_rna = data["small_rna"]
        if "small_rna_length" in data:
            small_rna_length = data["small_rna_length"]
        if "satellites" in data:
            satellites = data["satellites"]
        if "satellites_length" in data:
            satellites_length = data["satellites_length"]
        if "simple_repeats" in data:
            simple_repeats = data["simple_repeats"]
        if "simple_repeats_length" in data:
            simple_repeats_length = data["simple_repeats_length"]
        if "low_complexity" in data:
            low_complexity = data["low_complexity"]
        if "low_complexity_length" in data:
            low_complexity_length = data["low_complexity_length"]
        if "total_non_repetitive_length" in data:
            total_non_repetitive_length = data["total_non_repetitive_length"]
        if "total_repetitive_length" in data:
            total_repetitive_length = data["total_repetitive_length"]
        if "numberN" in data:
            numberN = data["numberN"]
        if "percentN" in data:
            percentN = data["percentN"]

        connection, cursor = self.updateConnection()

        try:
            cursor.execute(
                f"INSERT INTO analysis (assemblyID, type) VALUES ('{assemblyID}', 'repeatmasker')")
            connection.commit()

            analysisID = cursor.lastrowid

            cursor.execute(
                f"INSERT INTO repeatmasker (analysisID, path, retroelements, retroelements_length, dna_transposons, dna_transposons_length, rolling_circles, rolling_circles_length, unclassified, unclassified_length, small_rna, small_rna_length, satellites, satellites_length, simple_repeats, simple_repeats_length, low_complexity, low_complexity_length, total_non_repetitive_length, total_repetitive_length, numberN, percentN) VALUES ({analysisID}, '{path}', {retroelements}, {retroelements_length}, {dna_transposons}, {dna_transposons_length}, {rolling_circles}, {rolling_circles_length}, {unclassified}, {unclassified_length}, {small_rna}, {small_rna_length}, {satellites}, {satellites_length}, {simple_repeats}, {simple_repeats_length}, {low_complexity}, {low_complexity_length}, {total_non_repetitive_length}, {total_repetitive_length}, {numberN}, {percentN})")
            connection.commit()
            return 1, ""

        except:
            return 0, "Nothing imported!"

    # move gff3 to storage, import gff3 path

    def combinedGff3Import(self, assemblyID, filepath, directoryPath):
        Gff3Path, error = fileManager.moveGff3ToSpeciesStorage(
            assemblyID, filepath, directoryPath)
        if Gff3Path:
            gff3ImportStatus, gff3ImportError = self.importGff3(
                Gff3Path, assemblyID)
        else:
            return 0, error

        if gff3ImportStatus:
            return gff3ImportStatus, ""
        else:
            return 0, gff3ImportError

    # import gff3
    def importGff3(self, path, assemblyID, additionalFilesPath=None):
        """
            Imports gff3 file path into annotation table
        """

        connection, cursor = self.updateConnection()

        try:
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO annotation (assemblyID, path) VALUES ({assemblyID}, '{path}')")
            else:
                cursor.execute(
                    f"INSERT INTO annotation (assemblyID, path, additionalFilesPath) VALUES ({assemblyID}, '{path}', '{additionalFilesPath}')")
            connection.commit()

            return 1, ""
        except:
            return 0, "Nothing imported!"

    # move protein set to storage, import protein path
    def combinedProteinsImport(self, annotationID, filepath, additionalFilesPath):
        proteinsPath, error = fileManager.moveProteinsToSpeciesStorage(
            annotationID, filepath, additionalFilesPath)
        if proteinsPath:
            proteinsImportStatus, proteinsImportError = self.importProteins(
                proteinsPath, annotationID, additionalFilesPath)
        else:
            return 0, error

        if proteinsImportStatus:
            return proteinsImportStatus, ""
        else:
            return 0, proteinsImportError

    # import proteins

    def importProteins(self, path, annotationID, additionalFilesPath=None):
        """
            Imports proteins fasta file path into proteins table
        """

        connection, cursor = self.updateConnection()

        try:
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO proteins (annotationID, path) VALUES ({annotationID}, '{path}')")
            else:
                cursor.execute(
                    f"INSERT INTO proteins (annotationID, path, additionalFilesPath) VALUES ({annotationID}, '{path}', '{additionalFilesPath}')")
            connection.commit()

            return 1, ""
        except:
            return 0, "Nothing imported!"

    # move mapping to storage, import mapping path

    def combinedMappingImport(self, assemblyID, filepath, additionalFilesPath):
        mappingPath, error = fileManager.moveMappingToSpeciesStorage(
            assemblyID, filepath, additionalFilesPath)
        if mappingPath:
            mappingImportStatus, mappingImportError = self.importMapping(
                assemblyID, filepath, additionalFilesPath)
        else:
            return 0, error

        if mappingImportStatus:
            return mappingImportStatus, ""
        else:
            return 0, mappingImportError

    # import mapping

    def importMapping(self, assemblyID, path, additionalFilesPath=None):
        """
            Imports mapping file path into mapping table
        """

        connection, cursor = self.updateConnection()

        try:
            if not additionalFilesPath:
                cursor.execute(
                    f"INSERT INTO mapping (assemblyID, path) VALUES ({assemblyID}, '{path}')")
            else:
                cursor.execute(
                    f"INSERT INTO proteins (annotationID, path, additionalFilesPath) VALUES ({assemblyID}, '{path}', '{additionalFilesPath}')")
            connection.commit()

            return 1, ""
        except:
            return 0, "Nothing imported!"
