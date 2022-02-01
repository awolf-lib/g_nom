from sys import argv
from json import dumps, loads
from re import sub, compile, IGNORECASE
from subprocess import run
from PIL import Image

from modules.environment import BASE_PATH_TO_STORAGE
from modules.db_connection import connect
from modules.notifications import createNotification
from modules.files import scanFiles
from .producer import notify_worker

IMAGE_FILE_PATTERN = {
    "main_file": compile(r"^image/(png|jfif|jpg|jpeg)$", IGNORECASE),
    "default_parent_dir": None,
    "additional_files": [],
}

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
        values = []
        commonName = ""
        sql = "INSERT INTO taxa (ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, lastUpdatedBy, lastUpdatedOn, commonName) VALUES (%s, %s, %s, %s, %s, NOW(), %s)"
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

                values.append((taxonID, parentTaxonID, scientificName, rank, userID, commonName))
                counter += 1
                taxonID = None
                scientificName = ""
                commonName = ""

                if counter % 5000 == 0 and counter > 0:
                    cursor.executemany(sql, values)
                    connection.commit()
                    values = []

        cursor.executemany(sql, values)
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
            f"SELECT assemblies.taxonID, taxa.ncbiTaxonID, taxa.parentNcbiTaxonID, taxa.scientificName, taxa.taxonRank, taxa.imagePath FROM assemblies, taxa WHERE assemblies.taxonID = taxa.id"
        )
        taxa = [x for x in cursor.fetchall()]
        taxa = set(taxa)
        taxa = list(taxa)

        if len(taxa) == 0:
            with open(f"{BASE_PATH_TO_STORAGE}/taxa/tree.json", "w") as treeFile:
                treeFile.write("")
                treeFile.close()
            return 1, createNotification("Info", "No assemblies in database!", "info")

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
                        "imagePath": taxon[5],
                    }
                }
            )
            if taxon[2] not in lineageDict:
                lineageDict.update({taxon[2]: {"children": [taxon[1]]}})
            else:
                children = lineageDict[taxon[2]]["children"]
                children.append(taxon[1])

    except Exception as err:
        return {}, createNotification(message=f"Error while fetching taxa in database! {str(err)}")

    try:
        connection, cursor, error = connect()
        safetyCounter = 0
        while (len(taxa) > 1 or (1, 1, "root", "no rank") not in taxa) and safetyCounter < 100:
            level += 1
            cursor.execute(
                f"SELECT ncbiTaxonID, parentNcbiTaxonID, scientificName, taxonRank, id, imagePath FROM taxa WHERE ncbiTaxonID IN {taxonSqlString}"
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
                            "imagePath": taxon[5],
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
        return {}, createNotification(message=f"Error while fetching parent nodes! {str(err)}")

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
def fetchTaxonTree():
    """
    Fetch taxon tree from file
    """
    try:
        with open(f"{BASE_PATH_TO_STORAGE}taxa/tree.json", "r") as treeFile:
            treeData = treeFile.readline()
            treeData = loads(treeData)
            treeFile.close()

        return treeData, []
    except Exception as err:
        return {}, createNotification(message=str(err))


# FULL IMPORT WORKFLOW FOR NEW IMAGES
def import_image(taxonID, taxonScientificName, image, userID):
    """
    Imports a new image into database.
    """
    connection, cursor, error = connect()

    if not IMAGE_FILE_PATTERN["main_file"].match(image.content_type):
        return 0, createNotification(message="Unsupported image type!")

    scientificName = sub("[^a-zA-Z0-9_]", "_", taxonScientificName)
    SIZE = 256, 256
    try:
        imagePath = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/image/"
        run(args=["mkdir", "-p", imagePath])
        with Image.open(image) as image:
            image.thumbnail(SIZE)
            newPath = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/image/" + scientificName + ".thumbnail.jpg"
            image.save(newPath, "JPEG")

        cursor.execute(
            "UPDATE taxa SET imagePath=%s, lastUpdatedBy=%s, lastUpdatedOn=NOW() WHERE taxa.id=%s;",
            (newPath, userID, taxonID),
        )
        connection.commit()

        scanFiles()

        return 1, createNotification("Success", f"Successfully imported image!", "success")
    except Exception as err:
        return 0, createNotification(message=f"ImageImportError: {str(err)}")


def removeImageByTaxonID(taxonID, userID):
    """
    Deletes imagePath (DB) and file.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute("SELECT taxa.scientificName, taxa.imagePath FROM taxa WHERE taxa.id=%s", (taxonID,))

        row_headers = [x[0] for x in cursor.description]
        taxon = cursor.fetchone()
        taxon = dict(zip(row_headers, taxon))

        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])

        imagePath = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/image/"
        run(args=["rm", imagePath])

        cursor.execute(
            "UPDATE taxa SET imagePath=NULL, lastUpdatedBy=%s, lastUpdatedOn=NOW() WHERE taxa.id=%s;", (userID, taxonID)
        )
        connection.commit()
        return 1, createNotification("Success", f"Successfully deleted image!", "success")
    except Exception as err:
        return 0, createNotification(message=f"ImageDeletionError: {str(err)}")


# FETCH ONE TAXON BY NCBI TAXON ID
def fetchTaxonByTaxonID(taxonID):
    """
    Fetches taxon by taxon ID
    """
    try:
        connection, cursor, error = connect()
        cursor.execute("SELECT * FROM taxa WHERE id=%s", (taxonID,))
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchone()

    except Exception as err:
        return [], createNotification(message=str(err))

    if not taxa or not len(taxa):
        return [], createNotification("Info", f"No taxon for ID {taxonID} found!", "info")

    return dict(zip(row_headers, taxa)), []


def fetchTaxonImageByTaxonID(taxonID):
    """
    Fetches taxon image by taxon ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute("SELECT imagePath FROM taxa WHERE id=%s", (taxonID,))
        row_headers = [x[0] for x in cursor.description]
        imagePath = cursor.fetchone()[0]
        return imagePath, []
    except Exception as err:
        return "", createNotification(message=f"FetchImageError: {str(err)}")


# FETCH TAXA BY SEARCH STRING
def fetchTaxonBySearch(search):
    """
    Fetches taxon by search value.
    """
    connection, cursor, error = connect()

    try:
        cursor.execute(
            "SELECT * FROM taxa WHERE taxa.scientificName LIKE %s OR taxa.commonName LIKE %s",
            ("%" + search + "%", "%" + search + "%"),
        )
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchall()
        sorted_taxa = sorted([dict(zip(row_headers, x)) for x in taxa], key=lambda x: x["scientificName"])

    except Exception as err:
        return [], createNotification(message=str(err))

    if not len(taxa):
        return [], createNotification("Info", f"No taxon for search '{search}' found!", "info")

    return sorted_taxa, []


# FETCH ONE TAXON BY NCBI TAXON ID
def fetchTaxonByNCBITaxonID(ncbiTaxonID):
    """
    Fetches taxon by NCBI taxon id.
    """
    connection, cursor, error = connect()

    try:
        cursor.execute("SELECT * FROM taxa WHERE ncbiTaxonID = %s", (ncbiTaxonID,))
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchall()

    except Exception as err:
        return [], createNotification(message=str(err))

    if not len(taxa):
        return [], createNotification("Info", f"No taxon for NCBI taxonomy ID {ncbiTaxonID} found!", "info")

    return [dict(zip(row_headers, x)) for x in taxa], []


# FETCH ALL TAXA WITH AT LEAST ONE ASSEMBLY
def fetchTaxaWithAssemblies():
    """
    Fetches taxa with at least one assembly.
    """
    connection, cursor, error = connect()

    try:
        cursor.execute(
            "SELECT taxa.id, taxa.ncbiTaxonID, taxa.scientificName, taxa.commonName FROM taxa, assemblies WHERE taxa.id=assemblies.taxonID GROUP BY taxa.id"
        )
        row_headers = [x[0] for x in cursor.description]
        taxa = cursor.fetchall()

        if not len(taxa):
            return [], createNotification("Info", f"No taxon with at least one assembly found!", "info")

        return sorted([dict(zip(row_headers, x)) for x in taxa], key=lambda x: x["scientificName"]), []

    except Exception as err:
        return [], createNotification(message=str(err))


# FETCH ALL GENERAL INFOS OF SPECIFIC LEVEL
def fetchTaxonGeneralInformationByTaxonID(taxonID):
    """
    Gets all general information by specific taxon ID.
    """

    generalInfos = []
    try:
        connection, cursor, error = connect()
        cursor.execute("SELECT * from taxaGeneralInfo WHERE taxonID=%s", (taxonID,))

        row_headers = [x[0] for x in cursor.description]
        generalInfos = cursor.fetchall()
    except Exception as err:
        return [], createNotification(message=str(err))

    # if not len(generalInfos):
    #     return [], createNotification("Info", "No taxon general information!", "info")

    return [dict(zip(row_headers, x)) for x in generalInfos], []


# ADD GENERAL INFO
def addTaxonGeneralInformation(taxonID, key, value):
    """
    add general info by level and id
    """

    try:
        connection, cursor, error = connect()

        # TODO: validate string

        cursor.execute(
            "INSERT INTO taxaGeneralInfo (taxonID, generalInfoLabel, generalInfoDescription) VALUES (%s, %s, %s)",
            (taxonID, key, value),
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
            "UPDATE taxaGeneralInfo SET generalInfoLabel=%s, generalInfoDescription=%s WHERE id=%s", (key, value, id)
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
        cursor.execute("DELETE FROM taxaGeneralInfo WHERE id=%s", (id,))
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
