from sys import argv
from json import dumps, loads

from modules.environment import BASE_PATH_TO_STORAGE
from modules.db_connection import connect
from modules.notifications import createNotification


# IMPORT ALL FROM TAXDUMP FILE
def reloadTaxonIDsFromFile(userID):
    """
    Takes names.dmp/nodes.dmp out of storage directory and inserts all taxa into database.
    """

    print("Start importing taxa...")

    connection, cursor, error = connect()

    taxonData = []
    try:
        with open(f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/names.dmp", "r") as taxonFile, open(
            f"{BASE_PATH_TO_STORAGE}taxa/taxdmp/nodes.dmp", "r"
        ) as nodeFile:
            taxonData = taxonFile.readlines()
            nodeData = nodeFile.readlines()
            taxonFile.close()
            nodeFile.close()
    except Exception as err:
        return 0, createNotification(message=str(err))

    try:
        cursor.execute("DELETE FROM taxa")
        connection.commit()
        cursor.execute("ALTER TABLE taxa AUTO_INCREMENT = 1")
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

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
                    cursor.execute("DELETE FROM taxa")
                    connection.commit()
                    return 0, createNotification(message="Error while inserting taxa (Missing name)!")

                nodeSplit = nodeData[counter].split("\t")
                if int(nodeSplit[0]) != taxonID:
                    cursor.execute("DELETE FROM taxa")
                    connection.commit()
                    cursor.execute("ALTER TABLE taxa AUTO_INCREMENT = 1")
                    connection.commit()
                    return 0, createNotification(message="Error while retreiving node data (Missing node)!")

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
                    sql = f"INSERT INTO taxa (ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, lastUpdatedBy, lastUpdatedOn, commonName) VALUES {values}"
                    cursor.execute(sql)
                    connection.commit()
                    values = ""

        values = values[:-1]
        sql = f"INSERT INTO taxa (ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, lastUpdatedBy, lastUpdatedOn, commonName) VALUES {values}"
        cursor.execute(sql)
        connection.commit()
    except Exception as err:
        cursor.execute("DELETE FROM taxa")
        connection.commit()
        cursor.execute("ALTER TABLE taxa AUTO_INCREMENT = 1")
        connection.commit()
        return 0, createNotification(message=str(err))

    try:
        cursor.execute(f"SELECT COUNT(ncbiTaxonID) FROM taxa")
        taxaCount = cursor.fetchone()[0]
    except Exception as err:
        cursor.execute("DELETE FROM taxa")
        connection.commit()
        cursor.execute("ALTER TABLE taxa AUTO_INCREMENT = 1")
        connection.commit()
        return 0, createNotification(message=str(err))

    if taxaCount:
        print(f"{taxaCount:,} taxa imported!")
        return taxaCount, createNotification("Success", f"{taxaCount:,} taxa imported!", "success")
    else:
        cursor.execute("DELETE FROM taxa")
        connection.commit()
        cursor.execute("ALTER TABLE taxa AUTO_INCREMENT = 1")
        connection.commit()
        return 0, createNotification("Info", "No taxa imported!", "info")


# UPDATE TAXON TREE
def updateTaxonTree():
    """
    Update existing tree
    """
    lineageDict = {}
    taxonInfo = {}
    level = 0
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT assemblies.taxonID, taxa.ncbiTaxonID, taxa.parentNcbiTaxonID, taxa.scientificName, taxa.taxonRank, taxa.imageStatus FROM assemblies, taxa WHERE assemblies.taxonID = taxa.id"
        )
        taxa = [x for x in cursor.fetchall()]
        taxa = set(taxa)
        taxa = list(taxa)

        if len(taxa) == 0:
            with open(f"{BASE_PATH_TO_STORAGE}taxa/tree.json", "w") as treeFile:
                treeFile.write("")
                treeFile.close()
            return {}, createNotification("Info", "No assemblies in database!", "info")

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

    except Exception as err:
        return {}, createNotification(message=str(err))

    try:
        connection, cursor, error = connect()
        safetyCounter = 0
        while (len(taxa) > 1 or (1, 1, "root", "no rank") not in taxa) and safetyCounter < 100:
            level += 1
            cursor.execute(
                f"SELECT ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, id, imageStatus FROM taxa WHERE ncbiTaxonID IN {taxonSqlString}"
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

    except Exception as err:
        return {}, createNotification(message=str(err))

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
        treeFile.write(dumps(lineageDict[1], separators=(",", ":")))
        treeFile.close()

    return lineageDict[1], {}


# FETCH TAXON TREE
def fetchTaxonTree():
    """
    Fetch taxon tree from file
    """
    try:
        with open(f"{BASE_PATH_TO_STORAGE}taxa/tree.json", "r") as treeFile:
            treeData = treeFile.readline()
            treeData = loads(treeData)
            treeFile.close()

        return treeData, {}
    except Exception as err:
        return {}, createNotification(message=str(err))


# FETCH ONE TAXON BY NCBI TAXON ID
def fetchTaxonByTaxonID(taxonID):
    """
    Fetches taxon by taxon ID
    """
    connection, cursor, error = connect()

    try:
        cursor.execute(f"SELECT * FROM taxa WHERE id = {taxonID}")
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchone()

    except Exception as err:
        return [], createNotification(message=str(err))

    if not len(taxa):
        return [], createNotification("Info", f"No taxon for ID {taxonID} found!", "info")

    return dict(zip(row_headers, taxa)), {}


# FETCH TAXA BY SEARCH STRING
def fetchTaxonBySearch(search):
    """
    Fetches taxon by taxon ID
    """
    connection, cursor, error = connect()

    try:
        cursor.execute(
            f"SELECT * FROM taxa WHERE taxa.scientificName LIKE '%{search}%' OR taxa.commonName LIKE '%{search}%'"
        )
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchall()
        sorted_taxa = sorted([dict(zip(row_headers, x)) for x in taxa], key=lambda x: x["scientificName"])

    except Exception as err:
        return [], createNotification(message=str(err))

    if not len(taxa):
        return [], createNotification("Info", f"No taxon for search '{search}' found!", "info")

    return sorted_taxa, {}


# FETCH ONE TAXON BY NCBI TAXON ID
def fetchTaxonByNCBITaxonID(ncbiTaxonID):
    """
    Fetches taxon by NCBI taxon id
    """
    connection, cursor, error = connect()

    try:
        cursor.execute(f"SELECT * FROM taxa WHERE ncbiTaxonID = {ncbiTaxonID}")
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchall()

    except Exception as err:
        return [], createNotification(message=str(err))

    if not len(taxa):
        return [], createNotification("Info", f"No taxon for NCBI taxonomy ID {ncbiTaxonID} found!", "info")

    return [dict(zip(row_headers, x)) for x in taxa], {}


# FETCH ALL GENERAL INFOS OF SPECIFIC LEVEL
def fetchTaxonGeneralInformationByTaxonID(taxonID):
    """
    Gets all general information by specific taxon ID
    """

    generalInfos = []
    try:
        connection, cursor, error = connect()
        cursor.execute(f"SELECT * from taxaGeneralInfo WHERE taxonID={taxonID}")

        row_headers = [x[0] for x in cursor.description]
        generalInfos = cursor.fetchall()
    except Exception as err:
        return [], createNotification(message=str(err))

    if len(generalInfos):
        return [dict(zip(row_headers, x)) for x in generalInfos], {}
    else:
        return [], createNotification("Info", "No general information!", "info")


# ADD GENERAL INFO
def addTaxonGeneralInformation(taxonID, key, value):
    """
    add general info by level and id
    """

    try:
        connection, cursor, error = connect()

        # TODO: validate string

        cursor.execute(
            f"INSERT INTO taxaGeneralInfo (taxonID, generalInfoLabel, generalInfoDescription) VALUES ({taxonID}, '{key}', '{value}')"
        )
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return {"taxonID": taxonID, "key": key, "value": value}, createNotification(
        "Success", "Successfully added general info!", "success"
    )


# UPDATE GENERAL INFO
def updateTaxonGeneralInformationByID(id, key, value):
    """
    update general info by level and id
    """

    try:
        connection, cursor, error = connect()

        # TODO: validate string

        cursor.execute(
            f"UPDATE taxaGeneralInfo SET generalInfoLabel='{key}', generalInfoDescription='{value}' WHERE id={id}"
        )
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, createNotification("Success", "Successfully updated general info!", "success")


# DELETE GENERAL INFO
def deleteTaxonGeneralInformationByID(id):
    """
    deletes general information and id
    """

    try:
        connection, cursor, error = connect()
        cursor.execute(f"DELETE FROM taxaGeneralInfo WHERE id={id}")
        connection.commit()
    except Exception as err:
        return [], createNotification(message=str(err))

    return 1, createNotification("Success", "Successfully removed general information!", "success")


# Main
if __name__ == "__main__":
    if len(argv[1:]) == 1:
        if argv[1] == "reloadTaxonIDsFromFile":
            reloadTaxonIDsFromFile(1)
            pass
    else:
        pass
