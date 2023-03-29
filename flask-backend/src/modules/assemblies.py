from genericpath import isdir, isfile
from os import listdir
from os.path import exists, basename, getsize
from subprocess import run
from json import dumps
from re import compile, sub
from math import floor

from .environment import BASE_PATH_TO_IMPORT, BASE_PATH_TO_STORAGE
from .db_connection import DB_NAME, connect
from .notifications import createNotification
from .files import scanFiles
from .producer import notify_assembly, notify_worker
from .tasks import updateTask

FASTA_FILE_PATTERN = {
    "main_file": compile(
        r"^(.*\.fasta$)|(.*\.fa$)|(.*\.faa$)|(.*\.fna$)|(.*\.fasta\.gz$)|(.*\.fa\.gz$)|(.*\.faa\.gz$)|(.*\.fna\.gz$)"
    ),
    "default_parent_dir": None,
    "additional_files": [],
}

## ============================ IMPORT AND DELETE ============================ ##
# full import of .fasta
def import_assembly(taxon, dataset, userID, taskID=""):
    """
    Import workflow for new assemblies.
    """
    # Check input parameters and get new ID
    print("Start importing assembly...")
    try:
        if not taxon:
            return 0, createNotification(message="Missing taxon data!")

        if not dataset or not dataset["main_file"] or not dataset["main_file"]["path"]:
            return 0, createNotification(message="Missing new file information!")

        if not userID:
            return 0, createNotification(message="Missing user ID!")

        assembly_id, error = __get_new_assembly_ID()
        print(assembly_id, flush=True)
        if not assembly_id:
            return 0, error

    except Exception as err:
        print(f"An unknown error occured: {str(err)}")
        return 0, createNotification(message=f"AssemblyImportError1: {err}")

    try:
        main_file_path, assembly_name, error = __store_assembly(dataset, taxon, assembly_id)
        if not main_file_path or not exists(main_file_path):
            deleteAssemblyByAssemblyID(assembly_id)
            print(error, flush=True)
            return 0, error

        fasta_content, error = parseFasta(main_file_path, taskID)
        if not fasta_content:
            deleteAssemblyByAssemblyID(assembly_id)
            print(error)
            return 0, error

        try:
            run(args=["bgzip", main_file_path])
            main_file_path += ".gz"
        except Exception as err:
            print(f"An unknown error occured: {str(err)}")
            pass

        notify_assembly(assembly_id, assembly_name, main_file_path, "Added")

        imported_status, error = __importDB(taxon, assembly_id, assembly_name, main_file_path, userID, fasta_content)
        if not imported_status:
            deleteAssemblyByAssemblyID(assembly_id)
            print(error)
            return 0, error

        try:
            connection, cursor, error = connect()
            cursor.execute(
                "SELECT COUNT(*) FROM assemblies, taxa WHERE taxa.id=%s AND assemblies.taxonID=taxa.id",
                (taxon["id"],),
            )
            assemblyCountPerTaxon = cursor.fetchone()

            if not assemblyCountPerTaxon:
                print("UPDATING TAXON TREE... (FALLBACK)", flush=True)
                notify_worker("Update", "LocalTaxonTree")
            else:
                if assemblyCountPerTaxon[0] == 1:
                    print("UPDATING TAXON TREE... (ADD)", flush=True)
                    notify_worker("Update", "LocalTaxonTree")
        except Exception as err:
            print(f"An unknown error occured: {str(err)}")

        scanFiles()

        try:
            if "label" in dataset:
                updateAssemblyLabel(assembly_id, dataset["label"], userID)
        except Exception as err:
            print(f"Change assembly label failed due to an error: {str(err)}!")
            pass

        print(f"New assembly ({basename(main_file_path)}) added!\n", flush=True)
        return assembly_id, createNotification(
            "Success", f"Successfully imported {basename(main_file_path)}!", "success"
        )
    except Exception as err:
        print(f"An unknown error occured: {str(err)}")
        deleteAssemblyByAssemblyID(assembly_id)
        return 0, createNotification(message=f"AssemblyImportError2: {str(err)}")


# get assembly name
def __get_new_assembly_ID():
    """
    Gets new assembly ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='{DB_NAME}' AND TABLE_NAME='assemblies'"
        )
        auto_increment_counter = cursor.fetchone()[0]

        if not auto_increment_counter:
            next_id = 1
        else:
            next_id = auto_increment_counter

        # cursor.execute("ALTER TABLE assemblies AUTO_INCREMENT = %s", (next_id + 1,))
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=f"AssemblyCreationError: {str(err)}")

    return next_id, []


# moves .fasta into storage
def __store_assembly(dataset, taxon, assembly_id, forceIdentical=False):
    """
    Moves assembly data to storage directory.
    """
    try:
        # check if path exists
        old_file_path = BASE_PATH_TO_IMPORT + dataset["main_file"]["path"]
        if not exists(old_file_path):
            return 0, "", createNotification(message="Import path not found!")

        if old_file_path.lower().endswith(".gz"):
            run(["gunzip", "-q", old_file_path])
            old_file_path = old_file_path[:-3]

        # # check if file exists already in db
        # if not forceIdentical:
        #     connection, cursor, error = connect()
        #     taxonID = taxon["id"]
        #     cursor.execute(f"SELECT id, name, path FROM assemblies WHERE taxonID={taxonID}")
        #     row_headers = [x[0] for x in cursor.description]
        #     assembly_paths = cursor.fetchall()
        #     assembly_paths = [dict(zip(row_headers, x)) for x in assembly_paths]

        # for file in assembly_paths:
        #     if cmp(old_file_path, file["path"]):
        #         same_assembly = file["name"]
        #         return 0, "", createNotification(message=f"New assembly seems to be identical to {same_assembly}")

        # move to storage
        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])
        new_assembly_name = f"{scientificName}_id{assembly_id}"
        new_file_path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/{new_assembly_name}/sequences/dna/"
        run(
            ["mkdir", "-p", new_file_path],
        )

        if not isdir(new_file_path):
            return (
                0,
                "",
                createNotification(message="Creation of new directory failed!"),
            )

        if isfile(old_file_path):
            new_file_name = f"{new_assembly_name}.fasta"
            new_file_path_main_file = f"{new_file_path}{new_file_name}"
            run(["cp", old_file_path, new_file_path_main_file])
        else:
            return 0, "", createNotification(message="Invalid path to .fasta!")

        # check if main file was moved
        if not exists(new_file_path_main_file):
            return (
                0,
                "",
                createNotification(message="Moving assembly to storage failed!"),
            )
        else:
            pass
            # add remove?

        if "additional_files" in dataset:
            for additional_file in dataset["additional_files"]:
                old_additional_file_path = BASE_PATH_TO_IMPORT + additional_file["path"]
                if exists(old_additional_file_path):
                    run(["cp", "-r", old_additional_file_path, new_file_path])

        print(f"Assembly ({new_file_name}) moved to storage!")
        return new_file_path_main_file, new_assembly_name, []

    except Exception as err:
        return 0, "", createNotification(message=f"AssemblyStorageError: {str(err)}")


# fully deletes assembly by its ID
def deleteAssemblyByAssemblyID(assembly_id):
    """
    Deletes directory and datatbase entry for specific assembly by assembly ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            "SELECT assemblies.name FROM assemblies WHERE assemblies.id=%s",
            (assembly_id,),
        )
        assembly_name = cursor.fetchone()[0]

        cursor.execute(
            "SELECT taxa.* FROM assemblies, taxa WHERE assemblies.id=%s AND assemblies.taxonID=taxa.id",
            (assembly_id,),
        )

        row_headers = [x[0] for x in cursor.description]
        taxon = cursor.fetchone()
        taxon = dict(zip(row_headers, taxon))

        if assembly_id:
            status, error = __deleteAssemblyEntryByAssemblyID(assembly_id)

        if status and taxon and assembly_name:
            status, error = __deleteAssemblyFolder(taxon, assembly_name)
        else:
            return 0, error

        if not status:
            return 0, error

        notify_assembly(assembly_id, assembly_name, "", "Removed")

        scanFiles()

        return 1, createNotification("Success", "Successfully deleted assembly", "success")
    except Exception as err:
        return 0, createNotification(message=f"AssemblyDeletionError1: {str(err)}")


# deletes folder for assembly
def __deleteAssemblyFolder(taxon, assembly_name):
    """
    Deletes data for specific assemblies.
    """
    try:
        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])
        path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}"
        if len(listdir(path)) == 1:
            run(["rm", "-r", path])
        else:
            run(["rm", "-r", f"{path}/{assembly_name}"])

        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"AssemblyDelitionError2: {str(err)}")


def __deleteAssemblyEntryByAssemblyID(id):
    try:
        connection, cursor, error = connect()
        cursor.execute("DELETE FROM assemblies WHERE id=%s", (id,))
        connection.commit()

        cursor.execute(
            "SELECT COUNT(*) FROM assemblies, taxa WHERE taxa.id=%s AND assemblies.taxonID=taxa.id",
            (id,),
        )
        assemblyCountPerTaxon = cursor.fetchone()

        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"AssemblyDelitionError3: {str(err)}")


# database import
def __importDB(taxon, assembly_id, assembly_name, path, userID, file_content):
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
            "INSERT INTO assemblies (id, taxonID, name, path, addedBy, addedOn, lastUpdatedBy, lastUpdatedOn, numberOfSequences, sequenceType, cumulativeSequenceLength, n50, n90, shortestSequence, largestSequence, meanSequence, medianSequence, gcPercent, gcPercentMasked, lengthDistributionString, charCountString) VALUES (%s, %s, %s, %s, %s, NOW(), %s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                assembly_id,
                taxonID,
                assembly_name,
                path,
                userID,
                userID,
                numberOfSequences,
                sequenceType,
                cumulativeSequenceLength,
                n50,
                n90,
                shortestSequence,
                largestSequence,
                meanSequence,
                medianSequence,
                gcPercent,
                gcPercentMasked,
                lengthDistributionString,
                charCountString,
            ),
        )
        assemblyID = cursor.lastrowid
        connection.commit()

        connection, cursor, error = connect()
        counter = 0
        values = []
        sql = "INSERT INTO assembliesSequences (assemblyID, header, headerIdx, sequenceLength, gcPercentLocal, gcPercentMaskedLocal) VALUES (%s, %s, %s, %s, %s, %s)"
        for seq in file_content["sequences"]:
            header_name = seq["header"]
            header_idx = seq["header_idx"]
            sequence_length = seq["statistics"]["sequence_length"]
            GC_local = seq["statistics"]["GC_local"]
            GC_local_masked = seq["statistics"]["GC_local_masked"]

            values.append(
                (
                    assemblyID,
                    header_name,
                    header_idx,
                    sequence_length,
                    GC_local,
                    GC_local_masked,
                )
            )
            counter += 1

            if counter % 1000 == 0 and counter > 0:
                values = values[:-1]

                cursor.executemany(sql, values)
                connection.commit()
                values = []
        cursor.executemany(sql, values)
        connection.commit()
    except Exception as err:
        print(str(err), flush=True)
        return 0, createNotification(message=f"AssemblyImportDbError: {str(err)}")

    return 1, []


# parse fasta
def parseFasta(path, taskID=""):
    """
    Reads content of .fa/.fasta/.faa/.fna
    """

    __TYPE_AUTO_DETECT_ATGCU_THRESHOLD = 65

    if not exists(path):
        return 0, createNotification(message="Path not found.")

    filename = basename(path)
    print(f"Parsing {filename}...", flush=True)

    extensionMatch = FASTA_FILE_PATTERN["main_file"].match(filename)
    if not extensionMatch:
        return (
            0,
            createNotification(message="Uncorrect filetype! Only files of type .fa/.fasta/.faa/.fna are allowed."),
        )

    try:
        num_lines = sum(1 for line in open(path))

        if not num_lines:
            return 0, createNotification(message=f"{filename} is empty!")

        sequences = []
        cumulative_char_counts = {}
        cumulative_sequence_length = 0
        length_distribution = {
            0: {},
            1000: {},
            2500: {},
            5000: {},
            10000: {},
            25000: {},
            50000: {},
            100000: {},
            250000: {},
            500000: {},
            1000000: {},
            2500000: {},
            5000000: {},
            10000000: {},
            25000000: {},
            50000000: {},
        }

        with open(path, "r") as fa:
            # lines = fa.readlines()

            next_line = next(fa, -1)
            
            idx = 0
            while next_line != -1:

                line = next_line.replace("\n", "")
                idx += 1

                # header
                if line[0] == ">":
                    sequence_header = line[1:].split(" ")[0]
                    sequence_header_idx = idx
                    sequence = ""
                    sequence_length = 0
                    char_counts = {}
                    print(line)
                    progress = ((idx + 1) * 100) // num_lines
                    print(f"Parsed: {progress}%", end="\r", flush=True)
                    updateTask(taskID, "running", round((30 * progress) // 100))

                # sequences
                else:
                    sequence = sequence + line
                    sequence_length = sequence_length + len(line)

                    for char in line:
                        char = char.upper()
                        if char in cumulative_char_counts:
                            cumulative_char_counts[char] = cumulative_char_counts[char] + 1
                        else:
                            cumulative_char_counts[char] = 1

                        if char in char_counts:
                            char_counts[char] = char_counts[char] + 1
                        else:
                            char_counts[char] = 1

                next_line = next(fa, -1)
                if next_line == -1 or next_line[0] == ">":
                    # length distribution
                    for length in length_distribution:
                        if sequence_length >= length:
                            if "n" in length_distribution[length]:
                                length_distribution[length]["n"] = length_distribution[length]["n"] + 1
                                length_distribution[length]["l"] = length_distribution[length]["l"] + sequence_length
                            else:
                                length_distribution[length]["n"] = 1
                                length_distribution[length]["l"] = sequence_length

                    # local GC
                    local_gc = 0
                    local_gc_masked = 0
                    if "G" in char_counts:
                        local_gc += char_counts["G"]
                    if "g" in char_counts:
                        local_gc += char_counts["g"]
                        local_gc_masked += char_counts["g"]
                    if "C" in char_counts:
                        local_gc += char_counts["C"]
                    if "c" in char_counts:
                        local_gc += char_counts["c"]
                        local_gc_masked += char_counts["c"]

                    local_gc /= sequence_length
                    local_gc_masked /= sequence_length
                    sequences.append(
                        {
                            "header": sequence_header,
                            "header_idx": sequence_header_idx,
                            "sequence": sequence,
                            "statistics": {
                                "sequence_length": sequence_length,
                                "char_counts": char_counts,
                                "GC_local": local_gc,
                                "GC_local_masked": local_gc_masked,
                            },
                        }
                    )
                    cumulative_sequence_length += sequence_length

            fa.close()

        # sequence type auto detection
        DNA_RNA_ALPHABET = ["A", "a", "C", "c", "G", "g", "T", "t", "U", "u", "N", "n"]
        dna_rna_char_sum = 0
        for char in DNA_RNA_ALPHABET:
            if char in cumulative_char_counts:
                dna_rna_char_sum += cumulative_char_counts[char]

        if dna_rna_char_sum * 100 // cumulative_sequence_length <= __TYPE_AUTO_DETECT_ATGCU_THRESHOLD:
            sequence_type = "protein"
        else:
            Ts = 0
            Us = 0
            if "T" in cumulative_char_counts:
                Ts += cumulative_char_counts["T"]
            if "U" in cumulative_char_counts:
                Us += cumulative_char_counts["U"]

            if Ts > Us:
                sequence_type = "dna"
            elif Ts < Us:
                sequence_type = "rna"
            else:
                sequence_type = ""

        print(f"Sequence type detected: {sequence_type.upper()}")

        if sequence_type == "dna" or sequence_type == "rna":
            print(f"{len(sequences):,} sequences loaded! (Total length: {cumulative_sequence_length:,} bp)")
        elif sequence_type == "protein":
            print(f"{len(sequences):,} sequences loaded! (Total length: {cumulative_sequence_length:,} aa)")
        else:
            print(f"{len(sequences):,} sequences loaded! (Total length: {cumulative_sequence_length:,} chars)")

        # sorting
        print("Sorting sequences by sequence length...")
        sequences.sort(key=lambda x: x["statistics"]["sequence_length"], reverse=True)
        print("Sequences sorted!")

        # additional statistics
        print("Calculating additional statistics!")
        number_of_sequences = len(sequences)

        # mean sequence length
        mean_sequence_length = cumulative_sequence_length / number_of_sequences

        # median sequence length
        index = (number_of_sequences - 1) // 2
        if number_of_sequences % 2:
            median_sequence_length = sequences[index]["statistics"]["sequence_length"]
        else:
            median_sequence_length = (
                sequences[index]["statistics"]["sequence_length"]
                + sequences[index + 1]["statistics"]["sequence_length"]
            ) / 2

        # N50 / N90
        seq_length_sum = 0
        n50 = 0
        n90 = 0
        for seq in sequences:
            seq_length_sum += seq["statistics"]["sequence_length"]
            if seq_length_sum * 100 // cumulative_sequence_length >= 50 and not n50:
                n50 = seq["statistics"]["sequence_length"]
            if seq_length_sum * 100 // cumulative_sequence_length >= 90 and not n90:
                n90 = seq["statistics"]["sequence_length"]

        # GC
        gc_count = 0
        gc_count_masked = 0
        if "G" in cumulative_char_counts:
            gc_count += cumulative_char_counts["G"]
        if "g" in cumulative_char_counts:
            gc_count_masked += cumulative_char_counts["g"]
        if "C" in cumulative_char_counts:
            gc_count += cumulative_char_counts["C"]
        if "c" in cumulative_char_counts:
            gc_count_masked += cumulative_char_counts["c"]
        gc_count_masked += gc_count

        gc = gc_count / cumulative_sequence_length
        gc_masked = gc_count_masked / cumulative_sequence_length

        # print("\nLength distribution:")
        # for key in length_distribution:
        #     print("{:10s}".format(str(key)) + f": {length_distribution[key]}")
        # print("")

        statistics = {
            "cumulative_sequence_length": cumulative_sequence_length,
            "cumulative_char_counts": cumulative_char_counts,
            "number_of_sequences": number_of_sequences,
            "min_sequence_length": sequences[-1]["statistics"]["sequence_length"],
            "max_sequence_length": sequences[0]["statistics"]["sequence_length"],
            "mean_sequence_length": mean_sequence_length,
            "median_sequence_length": median_sequence_length,
            "N50": n50,
            "N90": n90,
            "GC": gc,
            "GC_masked": gc_masked,
            "length_distribution": length_distribution,
        }

        # print("\nSequence statistics:")
        # for key in statistics:
        #     print("{:30s}".format(" ".join(key.split("_"))) + f": {statistics[key]}")
        # print("")

        print(f"Done parsing {filename}!")

        return {
            "filename": filename,
            "filesize": getsize(path),
            "sequences": sequences,
            "type": sequence_type,
            "statistics": statistics,
        }, []
    except Exception as err:
        print(str(err), flush=True)
        return 0, createNotification(message=f"Error while opening {filename}.")


## ============================ FETCH ============================ ##
# fetches all assemblies (includes filtering by search, offset, range, userID)
def fetchAssemblies(
    search="",
    filter={},
    sortBy={"column": "label", "order": True},
    offset=0,
    range=10,
    userID=0,
):
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
                "SELECT taxa.*, assemblies.*, users.id AS userID, users.username, GROUP_CONCAT(tags.tag) AS tags FROM taxa RIGHT JOIN assemblies ON assemblies.taxonID=taxa.id LEFT JOIN users ON assemblies.addedBy=users.id LEFT JOIN tags ON assemblies.id=tags.assemblyID GROUP BY assemblies.name"
            )
        else:
            cursor.execute(
                "SELECT taxa.*, assemblies.*, users.id AS userID, users.username, GROUP_CONCAT(tags.tag) AS tags FROM taxa RIGHT JOIN assemblies ON assemblies.taxonID=taxa.id LEFT JOIN users ON assemblies.addedBy=users.id INNER JOIN bookmarks ON bookmarks.userID=%s AND assemblies.id=bookmarks.assemblyID LEFT JOIN tags ON assemblies.id=tags.assemblyID GROUP BY assemblies.name",
                (userID,),
            )

        row_headers = [x[0] for x in cursor.description]
        assemblies = cursor.fetchall()
        assemblies = [dict(zip(row_headers, x)) for x in assemblies]

        if search:
            search = str(search).lower()
            filtered_assemblies = []
            for x in assemblies:
                if len([s for s in x.values() if search == str(s).lower() or search in str(s).lower()]):
                    filtered_assemblies.append(x)
            assemblies = filtered_assemblies

        if sortBy["column"] == "label":
            assemblies = sorted(
                assemblies,
                key=lambda x: (x[sortBy["column"]] is None, x["label"], x["name"]),
                reverse=sortBy["order"],
            )
        else:
            assemblies = sorted(
                assemblies,
                key=lambda x: (x[sortBy["column"]] is None, x[sortBy["column"]]),
                reverse=sortBy["order"],
            )

        # get annotations, mappings, analyses
        for index, assembly in enumerate(assemblies):
            cursor.execute(
                "SELECT COUNT(*) FROM genomicAnnotations WHERE genomicAnnotations.assemblyID=%s",
                (assembly["id"],),
            )
            annotations = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COUNT(*) FROM mappings WHERE mappings.assemblyID=%s",
                (assembly["id"],),
            )
            mappings = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COUNT(*), MAX(analysesBusco.completeSinglePercent) FROM analyses, analysesBusco WHERE analyses.assemblyID=%s AND analysesBusco.analysisID=analyses.id",
                (assembly["id"],),
            )
            buscos, maxBuscoScore = cursor.fetchone()

            cursor.execute(
                "SELECT COUNT(*), MAX(analysesFcat.m1_similarPercent), MAX(analysesFcat.m2_similarPercent), MAX(analysesFcat.m3_similarPercent), MAX(analysesFcat.m4_similarPercent) FROM analyses, analysesFcat WHERE analyses.assemblyID=%s AND analysesFcat.analysisID=analyses.id",
                (assembly["id"],),
            )
            (
                fcats,
                maxFcatScoreM1,
                maxFcatScoreM2,
                maxFcatScoreM3,
                maxFcatScoreM4,
            ) = cursor.fetchone()

            cursor.execute(
                "SELECT COUNT(*) FROM analyses, analysesTaxaminer WHERE analyses.assemblyID=%s AND analysesTaxaminer.analysisID=analyses.id",
                (assembly["id"],),
            )
            taxaminers = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COUNT(*), AVG(analysesRepeatmasker.total_repetitive_length_percent) FROM analyses, analysesRepeatmasker WHERE analyses.assemblyID=%s AND analysesRepeatmasker.analysisID=analyses.id",
                (assembly["id"],),
            )
            repeatmaskers, averageRepetitiveness = cursor.fetchone()

            assembly.update(
                {
                    "annotations": annotations,
                    "mappings": mappings,
                    "buscos": buscos,
                    "maxBuscoScore": maxBuscoScore,
                    "fcats": fcats,
                    "maxFcatScoreM1": maxFcatScoreM1,
                    "maxFcatScoreM2": maxFcatScoreM2,
                    "maxFcatScoreM3": maxFcatScoreM3,
                    "maxFcatScoreM4": maxFcatScoreM4,
                    "taxaminers": taxaminers,
                    "repeatmaskers": repeatmaskers,
                    "averageRepetitiveness": averageRepetitiveness,
                }
            )

            assemblies[index] = {key: value for key, value in assembly.items() if value is not None}

        if filter:
            if "taxonIDs" in filter:
                assemblies = [x for x in assemblies if x["taxonID"] in filter["taxonIDs"]]
            if "tags" in filter:
                filtered_assemblies = []
                for x in assemblies:
                    print(x)
                    for tag in filter["tags"]:
                        if "tags" in x:
                            if tag in x["tags"]:
                                filtered_assemblies.append(x)
                assemblies = filtered_assemblies
            if "userIDs" in filter:
                assemblies = [x for x in assemblies if x["userID"] in filter["userIDs"]]
            if "hasAnnotation" in filter:
                assemblies = [x for x in assemblies if x["annotations"]]
            if "hasMapping" in filter:
                assemblies = [x for x in assemblies if x["mappings"]]
            if "hasBusco" in filter:
                assemblies = [x for x in assemblies if x["buscos"]]
            if "hasFcat" in filter:
                assemblies = [x for x in assemblies if x["fcats"]]
            if "hasTaxaminer" in filter:
                assemblies = [x for x in assemblies if x["taxaminer"]]
            if "hasRepeatmasker" in filter:
                assemblies = [x for x in assemblies if x["repeatmaskers"]]
            if "minBuscoComplete" in filter:
                assemblies = [
                    x for x in assemblies if f"maxBuscoScore" in x and x["maxBuscoScore"] >= filter["minBuscoComplete"]
                ]
            if "minFcatSimilar" in filter:
                mode = filter["minFcatSimilar"]["mode"]
                value = filter["minFcatSimilar"]["value"]
                assemblies = [
                    x for x in assemblies if f"maxFcatScoreM{mode}" in x and x[f"maxFcatScoreM{mode}"] >= value
                ]

        number_of_elements = len(assemblies)
        if number_of_elements % range:
            pages = (number_of_elements // range) + 1
        else:
            pages = number_of_elements // range

        assemblies = assemblies[offset * range : offset * range + range]

        if not len(assemblies):
            return (
                [],
                {"offset": offset, "range": range, "pages": pages, "search": search},
                createNotification("Info", "No assemblies found!", "info"),
            )

        return (
            assemblies,
            {"offset": offset, "range": range, "pages": pages, "search": search},
            [],
        )
    except Exception as err:
        return (
            [],
            {},
            createNotification(message=f"AssembliesFetchingError: {str(err)}"),
        )


# update assembly label
def updateAssemblyLabel(assembly_id: int, label: str, userID: int):
    """
    Set label for assembly.
    """
    try:
        connection, cursor, error = connect()

        LABEL_PATTERN = compile(r"^\w+$")

        if label and not LABEL_PATTERN.match(label):
            return 0, createNotification(message="Invalid label. Use only [a-zA-Z0-9_]!")
        elif not label:
            label = None

        cursor.execute(
            "UPDATE assemblies SET label=%s, lastUpdatedBy=%s, lastUpdatedOn=NOW() WHERE id=%s",
            (label, userID, assembly_id),
        )
        connection.commit()

        if label:
            return 1, createNotification("Success", f"Successfully added label: {label}", "success")
        else:
            return 1, createNotification("Info", f"Default name restored", "info")
    except Exception as err:
        return 0, createNotification(message=f"AssemblyLabelUpdateError: {str(err)}")


# fetches all assemblies for specific taxon
def fetchAssembliesByTaxonID(taxonID):
    """
    Fetches all assemblies for specific taxon by internal taxon ID.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute(
            "SELECT assemblies.*, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users WHERE assemblies.taxonID=%s AND taxa.id=%s AND assemblies.addedBy=users.id",
            (taxonID, taxonID),
        )

        row_headers = [x[0] for x in cursor.description]
        assemblies = cursor.fetchall()
        assemblies = [dict(zip(row_headers, x)) for x in assemblies]

        if not len(assemblies):
            return [], createNotification("Info", "No asssemblies for given taxon IDs!", "info")
        return (
            assemblies,
            [],
        )
    except Exception as err:
        return (
            [],
            [],
            createNotification(message=f"AssembliesFetchingError: {str(err)}"),
        )


# FETCHES ONE ASSEMBLY BY ITS ID
def fetchAssemblyByAssemblyID(id, userID):
    """
    Fetches one assembly by its ID.
    """
    assembly = {}

    try:
        connection, cursor, error = connect()

        cursor.execute(
            "SELECT assemblies.*, taxa.ncbiTaxonID, users.username FROM assemblies, taxa, users WHERE assemblies.id=%s AND taxa.id=assemblies.taxonID AND assemblies.addedBy=users.id",
            (id,),
        )

        row_headers = [x[0] for x in cursor.description]
        assembly = cursor.fetchone()
        assembly = dict(zip(row_headers, assembly))

        cursor.execute("SELECT * FROM bookmarks WHERE assemblyID=%s AND userID=%s", (id, userID))
        bookmark = cursor.fetchone()

        if bookmark:
            assembly.update({"bookmarked": 1})
        else:
            assembly.update({"bookmarked": 0})

        return assembly, []

    except Exception as err:
        return {}, createNotification(message=f"AssembliesFetchingError: {str(err)}")


# ADDS A NEW ASSEMBLY TAG
def addAssemblyTag(assemblyID, tag):
    """
    Adds a new assembly tag to specific assembly ID.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute("INSERT INTO tags (assemblyID, tag) VALUES (%s, %s)", (assemblyID, tag))
        connection.commit()

        return tag, createNotification(
            "Success",
            f"Successfully added tag '{tag}' to assembly with ID {assemblyID}",
            "success",
        )

    except Exception as err:
        return {}, createNotification(message=f"AssemblyTagCreationError: {str(err)}")


# REMOVES AN ASSEMBLY TAG BY ID
def removeAssemblyTagbyTagID(tagID):
    """
    Removes a an assembly tag by ID.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute("DELETE FROM tags WHERE id=%s", (tagID,))
        connection.commit()

        return 1, createNotification("Success", f"Successfully removed tag!", "success")

    except Exception as err:
        return {}, createNotification(message=f"AssemblyTagDelitionError: {str(err)}")


# FETCHES ALL ASSEMBLY TAGS BY ID
def fetchAssemblyTags():
    """
    Fetches all unique assembly tags.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute("SELECT DISTINCT(tag) FROM tags")

        row_headers = [x[0] for x in cursor.description]
        tags = cursor.fetchall()

        if tags:
            tags = [x[0] for x in tags]

        # if not len(tags):
        #     return [], createNotification("Info", "No tags found!", "info")

        return tags, []

    except Exception as err:
        return {}, createNotification(message=f"AssemblyTagFetchingError: {str(err)}")


# FETCHES ALL ASSEMBLY TAGS BY ID
def fetchAssemblyTagsByAssemblyID(assemblyID):
    """
    Fetches all assembly tags by specific assembly ID.
    """

    try:
        connection, cursor, error = connect()

        cursor.execute("SELECT * FROM tags WHERE assemblyID=%s", (assemblyID,))

        row_headers = [x[0] for x in cursor.description]
        tags = cursor.fetchall()
        tags = [dict(zip(row_headers, x)) for x in tags]

        # if not len(tags):
        #     return [], createNotification("Info", "No tags for this assembly!", "info")

        return tags, []

    except Exception as err:
        return [], createNotification(message=f"AssemblyTagFetchingError: {str(err)}")


# FETCH ALL GENERAL INFOS OF SPECIFIC LEVEL
def fetchAssemblyGeneralInformationByAssemblyID(assemblyID):
    """
    Fetches all general information for a specific assembly ID (level: assembly)
    """

    generalInfos = []
    try:
        connection, cursor, error = connect()
        cursor.execute("SELECT * from assembliesGeneralInfo WHERE assemblyID=%s", (assemblyID,))

        row_headers = [x[0] for x in cursor.description]
        generalInfos = cursor.fetchall()
    except Exception as err:
        return [], createNotification(message=str(err))

    # if not len(generalInfos):
    #     return [], createNotification("Info", "No assembly general information!", "info")

    return [dict(zip(row_headers, x)) for x in generalInfos], []


# ADD GENERAL INFO
def addAssemblyGeneralInformation(assemblyID, key, value):
    """
    Adds a general information to specific assembly ID.
    """

    try:
        connection, cursor, error = connect()

        # TODO: validate string

        cursor.execute(
            "INSERT INTO assembliesGeneralInfo (assemblyID, generalInfoLabel, generalInfoDescription) VALUES (%s, %s, %s)",
            (assemblyID, key, value),
        )
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return {"assemblyID": assemblyID, "key": key, "value": value}, createNotification(
        "Success", "Successfully added general info!", "success"
    )


# UPDATE GENERAL INFO
def updateAssemblyGeneralInformationByID(id, key, value):
    """
    Updates a general information by specific assembly ID.
    """

    try:
        connection, cursor, error = connect()

        # TODO: validate string

        cursor.execute(
            "UPDATE assembliesGeneralInfo SET generalInfoLabel=%s, generalInfoDescription=%s WHERE id=%s",
            (key, value, id),
        )
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, createNotification("Success", "Successfully updated general info!", "success")


# DELETE GENERAL INFO
def deleteAssemblyGeneralInformationByID(id):
    """
    Deletes general information and id
    """

    try:
        connection, cursor, error = connect()
        cursor.execute("DELETE FROM assembliesGeneralInfo WHERE id=%s", (id,))
        connection.commit()
    except Exception as err:
        return [], createNotification(message=str(err))

    return 1, createNotification("Success", "Successfully removed general information!", "success")


def fetchAssemblySequenceHeaders(search="", assembly_id=-1, number=-1, offset=0):
    """
    Fetches sequence headers (from specific assembly)
    """
    try:
        connection, cursor, error = connect()
        if assembly_id == -1:
            if number == -1:
                cursor.execute("SELECT * FROM assembliesSequences ORDER BY sequenceLength DESC")
            else:
                cursor.execute(
                    "SELECT * FROM assembliesSequences ORDER BY sequenceLength DESC LIMIT %s OFFSET %s",
                    (int(number), int(offset)),
                )
        else:
            if number == -1:
                cursor.execute(
                    "SELECT * FROM assembliesSequences WHERE assemblyID=%s ORDER BY sequenceLength DESC",
                    (assembly_id,),
                )
            else:
                cursor.execute(
                    "SELECT * FROM assembliesSequences WHERE assemblyID=%s ORDER BY sequenceLength DESC LIMIT %s OFFSET %s",
                    (assembly_id, int(number), int(offset)),
                )

        row_headers = [x[0] for x in cursor.description]
        sequenceHeaders = cursor.fetchall()
        sequenceHeaders = [dict(zip(row_headers, x)) for x in sequenceHeaders]

        if search:
            sequenceHeaders = [x for x in sequenceHeaders if search == str(x).lower() or search in str(x).lower()]

        # if not len(sequenceHeaders):
        #     return [], createNotification("Info", "No sequence headers found!", "info")

        return sequenceHeaders, []
    except Exception as err:
        return [], createNotification(message=f"FetchAssemblySequenceHeadersError: {str(err)}")
