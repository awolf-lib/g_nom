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
from .notifications import createNotification

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

    assembly_name, error = __generate_assembly_name()

    if not assembly_name:
        return 0, error

    new_file_path, error = __store_assembly(file_path, taxon, assembly_name)

    if not new_file_path or not exists(new_file_path):
        __deleteAssemblyFolder(assembly_name)
        return 0, error

    fasta_content, error = parseFasta(new_file_path)

    if not fasta_content:
        __deleteAssemblyFolder(assembly_name)
        return 0, error

    imported_status, error = __importDB(taxon, assembly_name, new_file_path, userID, fasta_content)

    if not imported_status:
        __deleteAssemblyFolder(assembly_name)
        return 0, error

    # TODO: send info to jbrowse container

    print(f"New assembly {assembly_name} added!")
    return 1, createNotification(message=f"New assembly {assembly_name} added!")


# generate assembly name (Scientific_name_TaxonID_assembly_newAssemblyID)
def __generate_assembly_name():
    """
    Generates new assembly name.
    """
    try:
        connection, cursor = connect()
        cursor.execute(
            f"SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='{DB_NAME}' AND TABLE_NAME='assemblies'"
        )
        auto_increment_counter = cursor.fetchone()

        if not auto_increment_counter:
            next_id = 1
        else:
            next_id = auto_increment_counter[0] + 1
    except:
        return 0, createNotification(message="Could not get new assembly ID!")

    return f"assembly{next_id}"


# moves .fasta into storage
def __store_assembly(file_path, taxon, assembly_name):
    """
    Moves assembly data to storage directory.
    """
    try:
        # check if path exists
        old_file_path = BASE_PATH_TO_IMPORT + file_path
        if not exists(BASE_PATH_TO_IMPORT + file_path):
            return 0, createNotification(message="Import path not found!")

        scientificName = taxon["scientificName"].replace(" ", "_")

        # TODO: check if file exists already in db
        # connection, cursor = connect()
        # taxonID = taxon["id"]
        # cursor.execute(
        #     f"SELECT id, path FROM assemblies WHERE taxonID={taxonID}"
        # )
        # row_headers = [x[0] for x in cursor.description]
        # assemblies = cursor.fetchall()
        # assemblies = [dict(zip(row_headers, x)) for x in assemblies]

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
            new_file_path_main_file = f"{new_file_path}/{new_file_name}"
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
    except:
        return 0, createNotification(message="Moving assembly to storage failed!")
    return new_file_path_main_file, {}


# database import
def __importDB(taxon, assembly_name, path, userID, file_content):
    """
    G-nom database import (table: assemblies)
    """
    try:
        connection, cursor = connect()
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
            f"INSERT INTO assemblies (taxonID, name, path, addedBy, addedOn, lastUpdatedBy, lastUpdatedOn, numberOfSequences, sequenceType, cumulativeSequenceLength, n50, n90, shortestSequence, largestSequence, meanSequence, medianSequence, gcPercent, gcPercentMasked, lengthDistributionString, charCountString) VALUES ({taxonID}, '{assembly_name}', '{path}', {userID}, NOW(), {userID}, NOW(), {numberOfSequences}, {sequenceType}, {cumulativeSequenceLength}, {n50}, {n90}, {shortestSequence}, {largestSequence}, {meanSequence}, {medianSequence}, {gcPercent}, {gcPercentMasked}, '{lengthDistributionString}', '{charCountString}')"
        )
        connection.commit()
    except:
        return 0, createNotification(message="Insertion into database failed!")

    return 1, {}


# deletes folder for assembly
def __deleteAssemblyFolder(taxon, assembly_name):
    """
    Deletes data for specific assembly.
    """
    try:
        scientificName = taxon["scientificName"].replace(" ", "_")
        path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/{assembly_name}"
        run(
            f"rm -f {path}",
            shell=True,
        )
        return 1, {}
    except:
        return 0, createNotification(message="Removing assembly failed!")


def __deleteAssemblyEntryByAssemblyID(id):
    connection, cursor = connect()
    cursor.execute(f"DELETE FROM assembly WHERE id={id}")
    connection.commit()
    return 1, {}


## ============================ FETCH ============================ ##
# fetches all assemblies (includes filtering by search, offset, range, userID)
def fetchAssemblies(search="", offset=0, range=10, userID=0):
    """
    Fetches all assemblies from database. Filtering by search term, offset, range and/or userID.
    """

    try:
        connection, cursor = connect()

        offset = int(offset)
        range = int(range)
        userID = int(userID)

        if not userID:
            cursor.execute(
                f"SELECT assemblies.*, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users WHERE assemblies.taxonID=taxa.id AND assemblies.addedBy=users.id"
            )
        else:
            cursor.execute(
                f"SELECT assemblies.* taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users bookmarks WHERE bookmarks.userID={userID} AND bookmarks.assemblyID=assemblies.id AND assemblies.taxonID=taxa.id AND assemblies.addedBy=users.id"
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
        connection, cursor = connect()

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
