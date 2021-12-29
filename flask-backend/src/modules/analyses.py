from os.path import basename, exists, isdir, isfile
from subprocess import run
from re import sub, compile

from .notifications import createNotification
from .db_connection import connect, DB_NAME
from .environment import BASE_PATH_TO_IMPORT, BASE_PATH_TO_STORAGE

## ============================ IMPORT AND DELETE ============================ ##
# full import of analyses
def import_analyses(taxon, assembly_id, dataset, analyses_type, userID):
    """
    Import workflow for new analyses.
    """
    try:
        if not taxon:
            return 0, createNotification(message="Missing taxon data!")

        if not assembly_id:
            return 0, createNotification(message="Missing assembly ID!")

        if not dataset or not dataset["main_file"] or not dataset["main_file"]["path"]:
            return 0, createNotification(message="Missing file path!")

        if not analyses_type:
            return 0, createNotification(message="Missing analyses type information!")

        if not userID:
            return 0, createNotification(message="Missing user ID!")

        connection, cursor, error = connect()
        cursor.execute(f"SELECT assemblies.name FROM assemblies WHERE assemblies.id={assembly_id}")
        assembly_name = cursor.fetchone()[0]

        analyses_name, analyses_id, error = __generate_analyses_name(assembly_name, analyses_type)
        if not analyses_id:
            return 0, error
    except Exception as err:
        return 0, createNotification(message=f"AnalysesImportError{analyses_type}1: {str(err)}")

    try:
        if not analyses_name:
            return 0, error

        new_file_path, new_path_to_directory, error = __store_analyses(
            dataset, taxon, assembly_name, analyses_name, analyses_type
        )

        if not new_file_path or not exists(new_file_path):
            deleteAnalysesByAnalysesID(analyses_id)
            return 0, error

        if analyses_type == "busco":
            busco_content, error = parseBusco(new_file_path)
            if not busco_content:
                deleteAnalysesByAnalysesID(analyses_id)
                return 0, error
        elif analyses_type == "fcat":
            fcat_content, error = parseFcat(new_file_path)
            if not fcat_content:
                deleteAnalysesByAnalysesID(analyses_id)
                return 0, error
        elif analyses_type == "milts":
            pass
        elif analyses_type == "repeatmasker":
            repeatmasker_content, error = parseRepeatmasker(new_file_path)
            if not repeatmasker_content:
                deleteAnalysesByAnalysesID(analyses_id)
                return 0, error
        else:
            return 0, createNotification(message=f"Invalid analyses type {analyses_type}")

        # zip
        if analyses_type != "milts":
            tar_dir = new_path_to_directory[:-1] + ".tar.gz"
            run(args=["tar", "-zcvf", tar_dir, new_path_to_directory])
            if not exists(tar_dir):
                deleteAnalysesByAnalysesID(analyses_id)
                return 0, createNotification(message=f"Compressing files failed")

            run(args=["rm", "-r", new_path_to_directory])
            new_file_path = tar_dir

        import_status, error = __importAnalyses(assembly_id, analyses_name, new_file_path, analyses_type, userID)
        if not import_status:
            deleteAnalysesByAnalysesID(analyses_id)
            return 0, error

        if analyses_type == "busco":
            import_status, error = __importBusco(analyses_id, busco_content)
        elif analyses_type == "fcat":
            import_status, error = __importFcat(analyses_id, fcat_content)
        elif analyses_type == "milts":
            import_status, error = __importMilts(analyses_id)
        elif analyses_type == "repeatmasker":
            import_status, error = __importRepeatmasker(analyses_id, repeatmasker_content)

        if not import_status:
            deleteAnalysesByAnalysesID(analyses_id)
            return 0, error

        print(f"New analyses {analyses_name} ({analyses_type}) added!")
        return analyses_id, createNotification("Success", f"New annotation {analyses_name} added!", "success")
    except Exception as err:
        deleteAnalysesByAnalysesID(analyses_id)
        return 0, createNotification(message=f"AnalysesImportError{analyses_type}2: {str(err)}")


# generate analyses name
def __generate_analyses_name(assembly_name, analyses_type):
    """
    Generates new analyses name.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='{DB_NAME}' AND TABLE_NAME='analyses'"
        )
        auto_increment_counter = cursor.fetchone()[0]

        if not auto_increment_counter:
            next_id = 1
        else:
            next_id = auto_increment_counter
    except Exception as err:
        return 0, 0, createNotification(message=str(err))

    new_analyses_name = f"{assembly_name}_{analyses_type}_id{next_id}"

    return new_analyses_name, next_id, []


# moves .gff3 into storage
def __store_analyses(dataset, taxon, assembly_name, analyses_name, analyses_type, forceIdentical=False):
    """
    Moves analyses data to storage directory.
    """
    try:
        # check if path exists
        old_file_path = BASE_PATH_TO_IMPORT + dataset["main_file"]["path"]
        if not exists(old_file_path):
            return 0, createNotification(message="Import path not found!")

        if old_file_path.lower().endswith(".gz"):
            run(["gunzip", old_file_path])

            if exists(old_file_path[:-3]):
                old_file_path = old_file_path[:-3]
            else:
                return 0, createNotification(message="Unzipping of gff failed!")

        # # check if file exists already in db
        # if not forceIdentical:
        #     connection, cursor, error = connect()
        #     cursor.execute(f"SELECT id, name, path FROM genomicAnnotations WHERE assemblyID={assembly_id}")
        #     row_headers = [x[0] for x in cursor.description]
        #     annotation_paths = cursor.fetchall()
        #     annotation_paths = [dict(zip(row_headers, x)) for x in annotation_paths]

        # for file in annotation_paths:
        #     if cmp(old_file_path, file["path"]):
        #         same_annotation = file["name"]
        #         return 0, createNotification(message=f"New assembly seems to be identical to {same_annotation}")

        # move to storage
        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])
        new_file_path = (
            f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/{assembly_name}/analyses/{analyses_type}/{analyses_name}/"
        )
        run(["mkdir", "-p", new_file_path])
        if not isdir(new_file_path):
            return 0, createNotification(message="Creation of new directory failed!")

        if isfile(old_file_path):
            new_file_name = basename(old_file_path)
            new_file_path_main_file = f"{new_file_path}{new_file_name}"
            run(["cp", old_file_path, new_file_path_main_file])
        else:
            return 0, createNotification(message="Invalid path to analyses file!")

        # check if main file was moved
        if not exists(new_file_path_main_file):
            return 0, createNotification(message="Moving analyses to storage failed!")
        # add remove?

        if analyses_type == "milts":
            try:
                with open(new_file_path_main_file, "r") as plotFile:
                    plot_data = "".join(plotFile.readlines()).replace("\n", "")
                    plot_data = plot_data.replace('"title":"taxonomic assignment"', f'"title":"{analyses_name}"')
                    plotFile.close()

                with open("src/Tools/templates/milts_head_template.html", "r") as milts_template_file:
                    milts_template = milts_template_file.readlines()
                    milts_template_file.close()

                body_regex = compile(r"<body>.*</body>")
                body_match = body_regex.findall(plot_data)
                if len(body_match) != 1:
                    return 0, createNotification(message="Error inserting scripts into old milts version!")

                for i in range(len(milts_template) - 1, len(milts_template) - 5, -1):
                    if "<body>REPLACE_BODY</body>" in milts_template[i]:
                        milts_template[i] = milts_template[i].replace("<body>REPLACE_BODY</body>", body_match[0])
                    elif "<title>REPLACE_TITLE</title>" in milts_template[i]:
                        milts_template[i] = milts_template[i].replace("REPLACE_TITLE", analyses_name)
                        break

                with open(new_file_path_main_file, "w") as plotFile:
                    plotFile.writelines(milts_template)
                    plotFile.close()
            except Exception as err:
                return 0, createNotification(message=f"MiltsHeaderInsertionError: {str(err)}")

        # handle additional files
        for additional_file in dataset["additional_files"]:
            old_additional_file_path = BASE_PATH_TO_IMPORT + additional_file["path"]
            if exists(old_additional_file_path):
                run(["cp", "-r", old_additional_file_path, new_file_path])

        print(f"Analyses ({analyses_type}; {basename(new_file_path_main_file)}) moved to storage!")
        return new_file_path_main_file, new_file_path, []

    except Exception as err:
        return 0, createNotification(message=f"AnalysesStorageError: {str(err)}")


# import Analyses
def __importAnalyses(assembly_id, analyses_name, analyses_path, analyses_type, userID):
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"INSERT INTO analyses (assemblyID, name, type, path, addedBy, addedOn) VALUES ({assembly_id}, '{analyses_name}', '{analyses_type}', '{analyses_path}', {userID}, NOW())"
        )
        connection.commit()
        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"ImportAnalysesError: {str(err)}")


# import Busco
def __importBusco(analysisID, buscoData):
    """
    Imports Busco analysis results
    """
    try:
        completeSingle = buscoData["completeSingle"]
        completeSinglePercent = buscoData["completeSinglePercent"]
        completeDuplicated = buscoData["completeDuplicated"]
        completeDuplicatedPercent = buscoData["completeDuplicatedPercent"]
        fragmented = buscoData["fragmented"]
        fragmentedPercent = buscoData["fragmentedPercent"]
        missing = buscoData["missing"]
        missingPercent = buscoData["missingPercent"]
        total = buscoData["total"]
        dataset = buscoData["dataset"]
        buscoMode = buscoData["buscoMode"]
        targetFile = buscoData["targetFile"]

        if total != completeSingle + completeDuplicated + fragmented + missing:
            return 0, createNotification(message="Busco total number does not match sum of all categories!")

        connection, cursor, error = connect()
        cursor.execute(
            "INSERT INTO analysesBusco (analysisID, completeSingle, completeSinglePercent, completeDuplicated, completeDuplicatedPercent, fragmented, fragmentedPercent, missing, missingPercent, total, dataset, buscoMode, targetFile) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                analysisID,
                completeSingle,
                completeSinglePercent,
                completeDuplicated,
                completeDuplicatedPercent,
                fragmented,
                fragmentedPercent,
                missing,
                missingPercent,
                total,
                dataset,
                buscoMode,
                targetFile,
            ),
        )
        connection.commit()
        return 1, []

    except Exception as err:
        return 0, createNotification(message=f"BuscoImportDBError: {str(err)}")


# import fCat
def __importFcat(analysisID, fcatData):
    """
    Imports fCat analysis results
    """
    try:
        for mode in fcatData:
            if mode == "mode_1":
                m1_similar = fcatData[mode]["similar"]
                m1_similarPercent = fcatData[mode]["similarPercent"]
                m1_dissimilar = fcatData[mode]["dissimilar"]
                m1_dissimilarPercent = fcatData[mode]["dissimilarPercent"]
                m1_duplicated = fcatData[mode]["duplicated"]
                m1_duplicatedPercent = fcatData[mode]["duplicatedPercent"]
                m1_missing = fcatData[mode]["missing"]
                m1_missingPercent = fcatData[mode]["missingPercent"]
                m1_ignored = fcatData[mode]["ignored"]
                m1_ignoredPercent = fcatData[mode]["ignoredPercent"]
                m1_total = fcatData[mode]["total"]
                m1_genomeID = fcatData[mode]["genomeID"]
            elif mode == "mode_2":
                m2_similar = fcatData[mode]["similar"]
                m2_similarPercent = fcatData[mode]["similarPercent"]
                m2_dissimilar = fcatData[mode]["dissimilar"]
                m2_dissimilarPercent = fcatData[mode]["dissimilarPercent"]
                m2_duplicated = fcatData[mode]["duplicated"]
                m2_duplicatedPercent = fcatData[mode]["duplicatedPercent"]
                m2_missing = fcatData[mode]["missing"]
                m2_missingPercent = fcatData[mode]["missingPercent"]
                m2_ignored = fcatData[mode]["ignored"]
                m2_ignoredPercent = fcatData[mode]["ignoredPercent"]
                m2_total = fcatData[mode]["total"]
                m2_genomeID = fcatData[mode]["genomeID"]
            elif mode == "mode_3":
                m3_similar = fcatData[mode]["similar"]
                m3_similarPercent = fcatData[mode]["similarPercent"]
                m3_dissimilar = fcatData[mode]["dissimilar"]
                m3_dissimilarPercent = fcatData[mode]["dissimilarPercent"]
                m3_duplicated = fcatData[mode]["duplicated"]
                m3_duplicatedPercent = fcatData[mode]["duplicatedPercent"]
                m3_missing = fcatData[mode]["missing"]
                m3_missingPercent = fcatData[mode]["missingPercent"]
                m3_ignored = fcatData[mode]["ignored"]
                m3_ignoredPercent = fcatData[mode]["ignoredPercent"]
                m3_total = fcatData[mode]["total"]
                m3_genomeID = fcatData[mode]["genomeID"]
            elif mode == "mode_4":
                m4_similar = fcatData[mode]["similar"]
                m4_similarPercent = fcatData[mode]["similarPercent"]
                m4_dissimilar = fcatData[mode]["dissimilar"]
                m4_dissimilarPercent = fcatData[mode]["dissimilarPercent"]
                m4_duplicated = fcatData[mode]["duplicated"]
                m4_duplicatedPercent = fcatData[mode]["duplicatedPercent"]
                m4_missing = fcatData[mode]["missing"]
                m4_missingPercent = fcatData[mode]["missingPercent"]
                m4_ignored = fcatData[mode]["ignored"]
                m4_ignoredPercent = fcatData[mode]["ignoredPercent"]
                m4_total = fcatData[mode]["total"]
                m4_genomeID = fcatData[mode]["genomeID"]

        connection, cursor, error = connect()
        cursor.execute(
            "INSERT INTO analysesFcat (analysisID, m1_similar, m1_similarPercent, m1_dissimilar, m1_dissimilarPercent, m1_duplicated, m1_duplicatedPercent, m1_missing, m1_missingPercent, m1_ignored, m1_ignoredPercent, m2_similar, m2_similarPercent, m2_dissimilar, m2_dissimilarPercent, m2_duplicated, m2_duplicatedPercent, m2_missing, m2_missingPercent, m2_ignored, m2_ignoredPercent, m3_similar, m3_similarPercent, m3_dissimilar, m3_dissimilarPercent, m3_duplicated, m3_duplicatedPercent, m3_missing, m3_missingPercent, m3_ignored, m3_ignoredPercent, m4_similar, m4_similarPercent, m4_dissimilar, m4_dissimilarPercent, m4_duplicated, m4_duplicatedPercent, m4_missing, m4_missingPercent, m4_ignored, m4_ignoredPercent, total, genomeID) VALUES ({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, '{}')".format(
                analysisID,
                m1_similar,
                m1_similarPercent,
                m1_dissimilar,
                m1_dissimilarPercent,
                m1_duplicated,
                m1_duplicatedPercent,
                m1_missing,
                m1_missingPercent,
                m1_ignored,
                m1_ignoredPercent,
                m2_similar,
                m2_similarPercent,
                m2_dissimilar,
                m2_dissimilarPercent,
                m2_duplicated,
                m2_duplicatedPercent,
                m2_missing,
                m2_missingPercent,
                m2_ignored,
                m2_ignoredPercent,
                m3_similar,
                m3_similarPercent,
                m3_dissimilar,
                m3_dissimilarPercent,
                m3_duplicated,
                m3_duplicatedPercent,
                m3_missing,
                m3_missingPercent,
                m3_ignored,
                m3_ignoredPercent,
                m4_similar,
                m4_similarPercent,
                m4_dissimilar,
                m4_dissimilarPercent,
                m4_duplicated,
                m4_duplicatedPercent,
                m4_missing,
                m4_missingPercent,
                m4_ignored,
                m4_ignoredPercent,
                m1_total,
                m1_genomeID,
            )
        )
        connection.commit()
        return 1, []

    except Exception as err:
        return 0, createNotification(message=f"FcatImportDBError; {str(err)}")


# import Milts
def __importMilts(analysisID):
    try:
        connection, cursor, error = connect()
        cursor.execute(f"INSERT INTO analysesMilts (analysisID) VALUES ({analysisID})")
        connection.commit()
        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"MiltsImportDBError: {str(err)}")


# import Repeatmasker
def __importRepeatmasker(analysisID, repeatmaskerData):
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
        connection, cursor, error = connect()
        cursor.execute(
            f"INSERT INTO analysesRepeatmasker (analysisID, sines, sines_length, `lines`, lines_length, ltr_elements, ltr_elements_length, dna_elements, dna_elements_length, rolling_circles, rolling_circles_length, unclassified, unclassified_length, small_rna, small_rna_length, satellites, satellites_length, simple_repeats, simple_repeats_length, low_complexity, low_complexity_length, total_non_repetitive_length, total_repetitive_length, numberN, percentN) VALUES ({analysisID}, {sines}, {sines_length}, {lines}, {lines_length}, {ltr_elements}, {ltr_elements_length}, {dna_elements}, {dna_elements_length}, {rolling_circles}, {rolling_circles_length}, {unclassified}, {unclassified_length}, {small_rna}, {small_rna_length}, {satellites}, {satellites_length}, {simple_repeats}, {simple_repeats_length}, {low_complexity}, {low_complexity_length}, {total_non_repetitive_length}, {total_repetitive_length}, {numberN}, {percentN})"
        )
        connection.commit()
        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"RepeatmaskerImportDBError: {str(err)}")


# fully deletes annotation by its ID
def deleteAnalysesByAnalysesID(analyses_id):
    """
    Deletes files and datatbase entry for specific analyses by analyses ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT assemblies.id, assemblies.name, analyses.path FROM assemblies, analyses WHERE analyses.id={analyses_id} AND analyses.assemblyID=assemblies.id"
        )
        assembly_id, assembly_name, analyses_path = cursor.fetchone()

        cursor.execute(
            f"SELECT taxa.* FROM assemblies, taxa WHERE assemblies.id={assembly_id} AND assemblies.taxonID=taxa.id"
        )

        row_headers = [x[0] for x in cursor.description]
        taxon = cursor.fetchone()
        taxon = dict(zip(row_headers, taxon))

        if analyses_id:
            status, error = __deleteAnalysesEntryByAnalysesID(analyses_id)

        if status and taxon and assembly_name and analyses_path:
            status, error = __deleteAnalysesFile(taxon, assembly_name, analyses_path)
        else:
            return 0, error

        if not status:
            return 0, error

        return 1, createNotification("Success", f"Successfully deleted anaylsis", "success")
    except Exception as err:
        return 0, createNotification(message=f"AnalysesDeletionError1: {str(err)}")


# deletes files for annotation
def __deleteAnalysesFile(taxon, assembly_name, analyses_path):
    """
    Deletes data for specific annotation.
    """
    try:
        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])
        path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}"

        run(args=["rm", "-r", analyses_path])

        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"AnalysesDeletionError2: {str(err)}")


def __deleteAnalysesEntryByAnalysesID(id):
    try:
        connection, cursor, error = connect()
        cursor.execute(f"DELETE FROM analyses WHERE id={id}")
        connection.commit()
        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"AnalysesDeletionError3: {str(err)}")


## ============================ PARSERS ============================ ##
# busco
def parseBusco(pathToBusco):
    """
    Extract data of busco analysis (short_summary.txt)
    """
    try:
        with open(pathToBusco, "r") as f:
            summaryData = f.readlines()
            f.close()

        FILE_PATTERN = compile(r"^.+\.\w+$")

        data = {}
        data["dataset"] = None
        data["targetFile"] = None
        data["buscoMode"] = None

        for line in summaryData:
            split = line.split()
            line = line.lower()
            if "(c)" in line:
                pass
            elif "(s)" in line:
                data["completeSingle"] = int(split[0])
            elif "(d)" in line:
                data["completeDuplicated"] = int(split[0])
            elif "(f)" in line:
                data["fragmented"] = int(split[0])
            elif "(m)" in line:
                data["missing"] = int(split[0])
            elif "total" in line:
                data["total"] = int(split[0])
            elif "_odb10" in line or "lineage dataset" in line:
                if "_odb10" in line:
                    for word in split:
                        if "_odb10" in word:
                            data["dataset"] = word
                            break
                elif ":" in line:
                    data["dataset"] = line.split(":")[1].split()[0]
            elif "notation for file" in line:
                for word in split:
                    if FILE_PATTERN.match(word):
                        data["targetFile"] = word.strip()
                        break
            elif "mode" in line:
                if ":" in line:
                    data["buscoMode"] = line.split(":")[1].split()[0]
                elif "genome" in line:
                    data["buscoMode"] = "genome"
                elif "protein" in line:
                    data["buscoMode"] = "proteins"
                elif "transcriptome" in line:
                    data["buscoMode"] = "transcriptome"

        data["completeSinglePercent"] = (data["completeSingle"] * 100) / data["total"]
        data["completeDuplicatedPercent"] = (data["completeDuplicated"] * 100) / data["total"]
        data["fragmentedPercent"] = (data["fragmented"] * 100) / data["total"]
        data["missingPercent"] = (data["missing"] * 100) / data["total"]

        if len(data.keys()):
            return data, []
        else:
            return 0, createNotification(message=f"{basename(pathToBusco)}: No data found!")

    except Exception as err:
        return 0, createNotification(message=f"BuscoParsingError: {str(err)}")


# fCat
def parseFcat(pathToFcat):
    """
    Extract data of fCat analysis (report_summary.txt)
    """
    try:
        with open(pathToFcat, "r") as f:
            summaryData = f.readlines()
            f.close()

        data = {}
        columns = [x.strip().replace("\n", "") for x in summaryData[0].split("\t")]

        for line in summaryData[1:]:
            values = line.split("\t")
            data[values[0]] = {}

            for index, value in enumerate(values[1:]):
                try:
                    data[values[0]][columns[index + 1]] = int(value)
                    data[values[0]][columns[index + 1] + "Percent"] = (int(value) * 100) / int(values[-1])
                except:
                    data[values[0]][columns[index + 1]] = str(value)

        if len(data.keys()):
            return data, []
        else:
            return 0, createNotification(message=f"{basename(pathToFcat)}: No data found!")
    except Exception as err:
        return 0, createNotification(message=f"FcatParsingError: {str(err)}")


# Repeatmasker
def parseRepeatmasker(pathToRepeatmasker):
    """
    Extract data of Repeatmasker analysis
    """
    try:
        with open(pathToRepeatmasker, "r") as f:
            summaryData = f.readlines()
            f.close()

        data = {}
        value_pattern = compile(r"[\d.]+ ")

        number_of_sequences = 0
        total_sequence_length = 0
        sequence_length = 0
        gc_level = 0.0
        data["numberN"] = 0
        data["percentN"] = 0.0

        data["sines"] = 0
        data["sines_length"] = 0
        data["lines"] = 0
        data["lines_length"] = 0
        data["ltr_elements"] = 0
        data["ltr_elements_length"] = 0
        data["dna_elements"] = 0
        data["dna_elements_length"] = 0
        data["unclassified"] = 0
        data["unclassified_length"] = 0
        total_interspersed_repeats = 0
        data["rolling_circles"] = 0
        data["rolling_circles_length"] = 0
        data["small_rna"] = 0
        data["small_rna_length"] = 0
        data["satellites"] = 0
        data["satellites_length"] = 0
        data["simple_repeats"] = 0
        data["simple_repeats_length"] = 0
        data["low_complexity"] = 0
        data["low_complexity_length"] = 0
        for line in summaryData:
            if line[0] == "=" or line[0] == "-":
                continue

            values = value_pattern.findall(line)
            values = [value.strip() for value in values]

            # header
            if len(values) == 0:
                continue
            elif "sequences" in line.lower():
                print(line, values)
                number_of_sequences = int(values[0])
                print("numberSequences", number_of_sequences)
                continue

            elif "total length" in line.lower():
                total_sequence_length = int(values[0])
                sequence_length = int(values[0])
                print("totalLength", total_sequence_length)
                continue

            elif "gc level" in line.lower():
                gc_level = float(values[0])
                print("gc", gc_level)
                continue

            elif "bases masked" in line.lower():
                data["numberN"] = int(values[0])
                data["percentN"] = float(values[1])
                print("n", data["numberN"])
                print("pn", data["percentN"])
                continue

            # body
            if "sines" in line.lower():
                length_occupied = int(values[1])
                data["sines"] = int(values[0])
                data["sines_length"] = length_occupied
                sequence_length -= length_occupied

            elif "lines" in line.lower():
                length_occupied = int(values[1])
                data["lines"] = int(values[0])
                data["lines_length"] = length_occupied
                sequence_length -= length_occupied

            elif "ltr elements" in line.lower():
                length_occupied = int(values[1])
                data["ltr_elements"] = int(values[0])
                data["ltr_elements_length"] = length_occupied
                sequence_length -= length_occupied

            elif "dna transposons" in line.lower() or "dna elements" in line.lower():
                length_occupied = int(values[1])
                data["dna_elements"] = int(values[0])
                data["dna_elements_length"] = length_occupied
                sequence_length -= length_occupied

            elif "unclassified" in line.lower():
                length_occupied = int(values[1])
                data["unclassified"] = int(values[0])
                data["unclassified_length"] = length_occupied
                sequence_length -= length_occupied

            elif "total interspersed repeats" in line.lower():
                print(line, values)
                total_interspersed_repeats = int(values[0])

            elif "rolling-circles" in line.lower():
                length_occupied = int(values[1])
                data["rolling_circles"] = int(values[0])
                data["rolling_circles_length"] = length_occupied
                sequence_length -= length_occupied

            elif "small rna" in line.lower():
                length_occupied = int(values[1])
                data["small_rna"] = int(values[0])
                data["small_rna_length"] = length_occupied
                sequence_length -= length_occupied

            elif "satellites" in line.lower():
                length_occupied = int(values[1])
                data["satellites"] = int(values[0])
                data["satellites_length"] = length_occupied
                sequence_length -= length_occupied

            elif "simple repeats" in line.lower():
                length_occupied = int(values[1])
                data["simple_repeats"] = int(values[0])
                data["simple_repeats_length"] = length_occupied
                sequence_length -= length_occupied

            elif "low complexity" in line.lower():
                length_occupied = int(values[1])
                data["low_complexity"] = int(values[0])
                data["low_complexity_length"] = length_occupied
                sequence_length -= length_occupied

        data["total_non_repetitive_length"] = sequence_length
        data["total_repetitive_length"] = total_sequence_length - sequence_length

        if len(data.keys()):
            return data, []
        else:
            return 0, createNotification(message=f"{basename(pathToRepeatmasker)}: No data found!")
    except Exception as err:
        return 0, createNotification(message=f"RepeatmaskerParsingError: {str(err)}")


## ============================ FETCH ============================ ##
# fetches all analyses for specific assembly
def fetchAnalysesByAssemblyID(assemblyID):
    """
    Fetches all analyses for specific assembly.
    """
    try:
        connection, cursor, error = connect()
        if error and error["message"]:
            return error

        analyses = {}

        # busco analyses
        cursor.execute(
            f"SELECT analyses.*, analysesBusco.* FROM analyses, analysesBusco WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesBusco.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["busco"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        # fcat analyses
        cursor.execute(
            f"SELECT analyses.*, analysesFcat.* FROM analyses, analysesFcat WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesFcat.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["fcat"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        # milts analyses
        cursor.execute(
            f"SELECT analyses.*, analysesMilts.* FROM analyses, analysesMilts WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesMilts.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["milts"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        # repeatmasker analyses
        cursor.execute(
            f"SELECT analyses.*, analysesRepeatmasker.* FROM analyses, analysesRepeatmasker WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesRepeatmasker.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["repeatmasker"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        print(analyses)
        return analyses, []
    except Exception as err:
        return {}, createNotification(message=str(err))


# fetches busco analyses for specific assembly
def fetchBuscoAnalysesByAssemblyID(assemblyID):
    """
    Fetches all analyses for specific assembly.
    """
    try:
        connection, cursor, error = connect()
        if error and error["message"]:
            return error

        # busco analyses
        cursor.execute(
            f"SELECT analyses.*, analysesBusco.* FROM analyses, analysesBusco WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesBusco.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        buscoList = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        return (
            buscoList,
            [],
        )
    except Exception as err:
        return [], createNotification(message=str(err))


# fetches all analyses for specific assembly
def fetchFcatAnalysesByAssemblyID(assemblyID):
    """
    Fetches fCat analyses for specific assembly.
    """
    try:
        connection, cursor, error = connect()
        if error and error["message"]:
            return error

        # fcat analyses
        cursor.execute(
            f"SELECT analyses.*, analysesFcat.* FROM analyses, analysesFcat WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesFcat.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        fcatList = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        return (
            fcatList,
            [],
        )
    except Exception as err:
        return [], createNotification(message=str(err))


# fetches all analyses for specific assembly
def fetchMiltsAnalysesByAssemblyID(assemblyID):
    """
    Fetches all analyses for specific assembly.
    """
    try:
        connection, cursor, error = connect()
        if error and error["message"]:
            return error

        # milts analyses
        cursor.execute(
            f"SELECT analyses.*, analysesMilts.* FROM analyses, analysesMilts WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesMilts.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        miltsList = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        return (
            miltsList,
            [],
        )
    except Exception as err:
        return [], createNotification(message=str(err))


# fetches all analyses for specific assembly
def fetchRepeatmaskerAnalysesByAssemblyID(assemblyID):
    """
    Fetches Repeatmasker analyses for specific assembly.
    """
    try:
        connection, cursor, error = connect()
        if error and error["message"]:
            return error

        # repeatmasker analyses
        cursor.execute(
            f"SELECT analyses.*, analysesRepeatmasker.* FROM analyses, analysesRepeatmasker WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesRepeatmasker.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        repeatmaskerList = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        return (
            repeatmaskerList,
            [],
        )
    except Exception as err:
        return [], createNotification(message=str(err))
