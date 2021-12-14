from genericpath import isdir, isfile
from sys import argv
from time import time
from os import listdir
from os.path import exists
from subprocess import run
from json import dumps
from filecmp import cmp

from .environment import BASE_PATH_TO_IMPORT, BASE_PATH_TO_STORAGE
from .bioparsers import parseFasta, FASTA_PATTERN
from .db_connection import DB_NAME, connect
from .notifications import createNotification, notify_assembly
from .taxa import updateTaxonTree

## ============================ IMPORT AND DELETE ============================ ##
# full import of .fasta
def import_assembly(taxon, file_path, userID):
    """
    Import workflow for new assemblies.
    """
    if not taxon:
        return 0, createNotification(message="Missing taxon data!")

    if not file_path:
        return 0, createNotification(message="Missing file path!")

    if not userID:
        return 0, createNotification(message="Missing user ID!")

    assembly_name, assembly_id, error = __generate_assembly_name()

    if not assembly_name:
        return 0, error

    new_file_path, error = __store_assembly(file_path, taxon, assembly_name)

    if not new_file_path or not exists(new_file_path):
        __deleteAssemblyFolder(taxon, assembly_name)
        return 0, error

    fasta_content, error = parseFasta(new_file_path)

    if not fasta_content:
        __deleteAssemblyFolder(taxon, assembly_name)
        return 0, error

    imported_status, error = __importDB(taxon, assembly_name, new_file_path, userID, fasta_content)

    if not imported_status:
        __deleteAssemblyEntryByAssemblyID(assembly_id)
        __deleteAssemblyFolder(taxon, assembly_name)
        return 0, error

    tree, error = updateTaxonTree()
    if not tree:
        __deleteAssemblyEntryByAssemblyID(assembly_id)
        __deleteAssemblyFolder(taxon, assembly_name)
        return 0, error

    # TODO: send info to jbrowse container
    # notify_assembly(assembly_id, assembly_name, new_file_path)

    print(f"New assembly {assembly_name} added!")
    return 1, createNotification("Success", f"New assembly {assembly_name} added!", "success")


# generate assembly name (Scientific_name_TaxonID_assembly_newAssemblyID)
def __generate_assembly_name():
    """
    Generates new assembly name.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='{DB_NAME}' AND TABLE_NAME='assemblies'"
        )
        auto_increment_counter = cursor.fetchone()

        if not auto_increment_counter:
            next_id = 1
        else:
            next_id = auto_increment_counter[0]
    except Exception as err:
        return 0, createNotification(message=str(err))

    return f"assembly{next_id}", next_id, {}


# moves .fasta into storage
def __store_assembly(file_path, taxon, assembly_name, forceIdentical=False):
    """
    Moves assembly data to storage directory.
    """
    try:
        # check if path exists
        old_file_path = BASE_PATH_TO_IMPORT + file_path
        if not exists(old_file_path):
            return 0, createNotification(message="Import path not found!")

        if old_file_path.lower().endswith(".gz"):
            run(
                f"gunzip {old_file_path}",
                shell=True,
            )
            old_file_path = old_file_path[:-3]

        scientificName = taxon["scientificName"].replace(" ", "_")

        # check if file exists already in db
        if not forceIdentical:
            connection, cursor, error = connect()
            taxonID = taxon["id"]
            cursor.execute(f"SELECT id, name, path FROM assemblies WHERE taxonID={taxonID}")
            row_headers = [x[0] for x in cursor.description]
            assembly_paths = cursor.fetchall()
            assembly_paths = [dict(zip(row_headers, x)) for x in assembly_paths]

        for file in assembly_paths:
            if cmp(old_file_path, file["path"]):
                same_assembly = file["name"]
                return 0, createNotification(
                    message=f"New assembly seems to be identical to assembly with ID {same_assembly}"
                )

        # move to storage
        new_file_path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/{assembly_name}/sequences/dna/"
        run(
            f"mkdir -p {new_file_path}",
            shell=True,
        )

        if isdir(old_file_path):
            run(
                f"cp -r {old_file_path}/* {new_file_path}",
                shell=True,
            )

            for file in listdir(new_file_path):
                if FASTA_PATTERN.match(file):
                    new_file_name = f"{assembly_name}.fasta"
                    new_file_path_main_file = f"{new_file_path}/{new_file_name}"
                else:
                    new_file_name = f"{assembly_name}_{file}"

                run(
                    f"mv {new_file_path}/{file} {new_file_path}/{new_file_name}",
                    shell=True,
                )

        elif isfile(old_file_path):
            new_file_name = f"{assembly_name}.fasta"
            new_file_path_main_file = f"{new_file_path}{new_file_name}"
            run(
                f"cp {old_file_path} {new_file_path_main_file}",
                shell=True,
            )
        else:
            return 0, createNotification(message="Moving assembly to storage failed!")

        # check if main file was moved
        if not exists(f"{new_file_path}/{assembly_name}.fasta"):
            return 0, createNotification(message="Moving assembly to storage failed!")
        else:
            pass
            # run(
            #     f"rm -r {old_file_path}",
            #     shell=True,
            # )

        print(f"Assembly ({assembly_name}) moved to storage!")
    except Exception as err:
        return 0, createNotification(message=str(err))
    return new_file_path_main_file, {}


# database import
def __importDB(taxon, assembly_name, path, userID, file_content):
    """
    G-nom database import (tables: assemblies, assembliesSequences)
    """
    try:
        connection, cursor, error = connect()
        taxonID = taxon["id"]
        numberOfSequences = file_content["statistics"]["number_of_sequences"]
        sequenceType = file_content["type"]
        cumulativeSequenceLength = file_content["statistics"]["cumulative_sequence_length"]
        n50 = file_content["statistics"]["N50"]
        n90 = file_content["statistics"]["N90"]
        shortestSequence = file_content["statistics"]["min_sequence_length"]
        largestSequence = file_content["statistics"]["max_sequence_length"]
        meanSequence = file_content["statistics"]["mean_sequence_length"]
        medianSequence = file_content["statistics"]["median_sequence_length"]
        gcPercent = file_content["statistics"]["GC"]
        gcPercentMasked = file_content["statistics"]["GC_masked"]
        lengthDistributionString = dumps(file_content["statistics"]["length_distribution"], separators=(",", ":"))
        charCountString = dumps(file_content["statistics"]["cumulative_char_counts"], separators=(",", ":"))

        cursor.execute(
            f"INSERT INTO assemblies (taxonID, name, path, addedBy, addedOn, lastUpdatedBy, lastUpdatedOn, numberOfSequences, sequenceType, cumulativeSequenceLength, n50, n90, shortestSequence, largestSequence, meanSequence, medianSequence, gcPercent, gcPercentMasked, lengthDistributionString, charCountString) VALUES ({taxonID}, '{assembly_name}', '{path}', {userID}, NOW(), {userID}, NOW(), {numberOfSequences}, '{sequenceType}', {cumulativeSequenceLength}, {n50}, {n90}, {shortestSequence}, {largestSequence}, {meanSequence}, {medianSequence}, {gcPercent}, {gcPercentMasked}, '{lengthDistributionString}', '{charCountString}')"
        )
        assemblyID = cursor.lastrowid
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    try:
        connection, cursor, error = connect()
        counter = 0
        values = ""
        for seq in file_content["sequences"]:
            header_name = seq["header"]
            header_idx = seq["header_idx"]
            sequence_length = seq["statistics"]["sequence_length"]
            GC_local = seq["statistics"]["GC_local"]
            GC_local_masked = seq["statistics"]["GC_local_masked"]

            values += (
                f"({assemblyID}, '{header_name}', {header_idx}, {sequence_length}, {GC_local}, {GC_local_masked}),"
            )
            counter += 1

            if counter % 1000 == 0 and counter > 0:
                values = values[:-1]
                sql = f"INSERT INTO assembliesSequences (assemblyID, header, headerIdx, sequenceLength, gcPercentLocal, gcPercentMaskedLocal) VALUES {values}"
                cursor.execute(sql)
                connection.commit()
                values = ""
        values = values[:-1]
        sql = f"INSERT INTO assembliesSequences (assemblyID, header, headerIdx, sequenceLength, gcPercentLocal, gcPercentMaskedLocal) VALUES {values}"
        cursor.execute(sql)
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, {}


# fully deletes assembly by its ID
def deleteAssemblyByAssemblyID(assemblyID):
    """
    Deletes directory and datatbase entry for specific assembly by assembly ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(f"SELECT assemblies.name FROM assemblies WHERE assemblies.id={assemblyID}")
        assembly_name = cursor.fetchone()[0]

        cursor.execute(
            f"SELECT taxa.* FROM assemblies, taxa WHERE assemblies.id={assemblyID} AND assemblies.taxonID=taxa.id"
        )

        row_headers = [x[0] for x in cursor.description]
        taxon = cursor.fetchone()
        taxon = dict(zip(row_headers, taxon))

        if assemblyID:
            status, error = __deleteAssemblyEntryByAssemblyID(assemblyID)

        if status and taxon and assembly_name:
            status, error = __deleteAssemblyFolder(taxon, assembly_name)
        else:
            return 0, error

        if not status:
            return 0, error

        tree, error = updateTaxonTree()
        if not tree:
            return 0, error

        return 1, []
    except Exception as err:
        return 0, createNotification(message=str(err))


# deletes folder for assembly
def __deleteAssemblyFolder(taxon, assembly_name):
    """
    Deletes data for specific assemblies.
    """
    try:
        scientificName = taxon["scientificName"].replace(" ", "_")
        path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}"
        if len(listdir(path)) == 1:
            run(
                f"rm -r {path}",
                shell=True,
            )
        else:
            run(
                f"rm -r {path}/{assembly_name}",
                shell=True,
            )

        return 1, {}
    except Exception as err:
        return 0, createNotification(message=str(err))


def __deleteAssemblyEntryByAssemblyID(id):
    connection, cursor, error = connect()
    cursor.execute(f"DELETE FROM assemblies WHERE id={id}")
    connection.commit()
    return 1, {}


## ============================ FETCH ============================ ##
# fetches all assemblies (includes filtering by search, offset, range, userID)
def fetchAssemblies(search="", offset=0, range=10, userID=0):
    """
    Fetches all assemblies from database. Filtering by search term, offset, range and/or userID.
    """

    try:
        connection, cursor, error = connect()

        offset = int(offset)
        range = int(range)
        userID = int(userID)

        if not userID:
            cursor.execute(
                f"SELECT assemblies.*, taxa.scientificName, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users WHERE assemblies.taxonID=taxa.id AND assemblies.addedBy=users.id"
            )
        else:
            cursor.execute(
                f"SELECT assemblies.*, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users, bookmarks WHERE bookmarks.userID={userID} AND bookmarks.assemblyID=assemblies.id AND assemblies.taxonID=taxa.id AND assemblies.addedBy=users.id"
            )

        row_headers = [x[0] for x in cursor.description]
        assemblies = cursor.fetchall()
        assemblies = [dict(zip(row_headers, x)) for x in assemblies]

        number_of_elements = len(assemblies)

        if search:
            filtered_assemblies = []
            for x in assemblies:
                if len([s for s in x.values() if search == str(s) or search in str(s)]):
                    filtered_assemblies.append(x)

            assemblies = filtered_assemblies

        assemblies = assemblies[offset * range : offset * range + range]

        return (
            assemblies,
            {"offset": offset, "range": range, "pages": number_of_elements // range + 1, "search": search},
            {},
        )
    except Exception as err:
        return [], {}, createNotification(message=str(err))


# fetches all assemblies for specific taxon
def fetchAssembliesByTaxonID(taxonID):
    """
    Fetches all assemblies for specific taxon from database.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute(
            f"SELECT assemblies.*, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users WHERE assemblies.taxonID={taxonID} AND taxa.id={taxonID} AND assemblies.addedBy=users.id"
        )

        row_headers = [x[0] for x in cursor.description]
        assemblies = cursor.fetchall()
        assemblies = [dict(zip(row_headers, x)) for x in assemblies]

        return (
            assemblies,
            {},
        )
    except Exception as err:
        return [], {}, createNotification(message=str(err))


# FETCHES MULTIPLE ASSEMBLIES BY NCBI TAXON IDS
def fetchAssembliesByTaxonIDs(taxonIDsString):
    """
    Fetches assemblies by multiple taxon ID
    """
    try:
        connection, cursor, error = connect()
        taxonIDs = taxonIDsString.split(",")
        taxonSqlString = "(" + ",".join([x for x in taxonIDs]) + ")"
        cursor.execute(
            f"SELECT assemblies.id, assemblies.name, taxa.scientificName, taxa.imageStatus, assemblies.taxonID, taxa.ncbiTaxonID FROM assemblies, taxa WHERE assemblies.taxonID = taxa.id AND taxa.id IN {taxonSqlString}"
        )
        row_headers = [x[0] for x in cursor.description]
        assemblies = cursor.fetchall()

    except Exception as err:
        return {}, createNotification(message=str(err))

    if len(assemblies):
        return [dict(zip(row_headers, x)) for x in assemblies], {}
    else:
        return {}, createNotification("Info", "No assemblies found!", "info")


# FETCHES ONE ASSEMBLY BY ITS ID
def fetchAssemblyByAssemblyID(id, userID):
    """
    Fetches one assembly by its ID.
    """
    assembly = {}

    try:
        connection, cursor, error = connect()

        cursor.execute(
            f"SELECT assemblies.*, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users WHERE assemblies.id={id} AND taxa.id=assemblies.taxonID AND assemblies.addedBy=users.id"
        )

        row_headers = [x[0] for x in cursor.description]
        assembly = cursor.fetchone()
        assembly = dict(zip(row_headers, assembly))

        cursor.execute(f"SELECT * FROM bookmarks WHERE assemblyID={id} AND userID={userID}")
        bookmark = cursor.fetchone()

        if bookmark:
            assembly.update({"bookmarked": 1})
        else:
            assembly.update({"bookmarked": 0})

        return assembly, {}

    except Exception as err:
        return {}, createNotification(message=str(err))


# ADDS A NEW ASSEMBLY TAG
def addAssemblyTag(assemblyID, tag):
    """
    Adds a new assembly tag.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute(
            f"INSERT INTO tags (assemblyID, tag) VALUES ({assemblyID}, '{tag}')"
        )
        connection.commit()

        return tag, createNotification("Success", f"Successfully added tag '{tag}' to assembly{assemblyID}", "success")

    except Exception as err:
        return {}, createNotification(message=str(err))


# REMOVES AN ASSEMBLY TAG BY ID
def removeAssemblyTagbyTagID(tagID):
    """
    Removes a an assembly tag by ID.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute(
            f"DELETE FROM tags WHERE id={tagID}"
        )
        connection.commit()

        return 1, createNotification("Success", f"Successfully removed tag!", "success")

    except Exception as err:
        return {}, createNotification(message=str(err))


# FETCHES ALL ASSEMBLY TAGS BY ID
def fetchAssemblyTagsByAssemblyID(assemblyID):
    """
    Fetches all assembly tags for an assembly.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute(
            f"SELECT * FROM tags WHERE assemblyID={assemblyID}"
        )

        row_headers = [x[0] for x in cursor.description]
        tags = cursor.fetchall()
        tags = [dict(zip(row_headers, x)) for x in tags]

        if len(tags) == 0:
            return [], createNotification("Info", "No tags in database!", "info")
        else:
            return tags, {}

    except Exception as err:
        return {}, createNotification(message=str(err))
