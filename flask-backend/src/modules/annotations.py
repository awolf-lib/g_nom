from os.path import exists, isdir, isfile
from os import remove
from posixpath import basename
from re import compile, sub
from json import dumps, loads
from subprocess import run
from glob import glob
from operator import contains, is_, is_not, lt, le, eq, ne, ge, gt

from .notifications import createNotification
from .db_connection import connect, DB_NAME
from .environment import BASE_PATH_TO_STORAGE, BASE_PATH_TO_IMPORT
from .files import scanFiles
from .producer import notify_annotation

ANNOTATION_FILE_PATTERN = {
    "main_file": compile(r"^(.*\.gff$)|(.*\.gff3$)|(.*\.gff\.gz$)|(.*\.gff3\.gz$)"),
    "default_parent_dir": None,
    "additional_files": [],
}

## ============================ IMPORT AND DELETE ============================ ##
# full import of .gff3
def import_annotation(taxon, assembly_id, dataset, userID):
    """
    Import workflow for new annotation.
    """
    print("Start importing annotation...")
    try:
        if not taxon:
            return 0, createNotification(message="Missing taxon data!")

        if not assembly_id:
            return 0, createNotification(message="Missing assembly ID!")

        if not dataset or not dataset["main_file"] or not dataset["main_file"]["path"]:
            return 0, createNotification(message="Missing file path!")

        if not userID:
            return 0, createNotification(message="Missing user ID!")

        connection, cursor, error = connect()
        cursor.execute("SELECT assemblies.name FROM assemblies WHERE assemblies.id=%s", (assembly_id,))
        assembly_name = cursor.fetchone()[0]

        annotation_name, annotation_id, error = __generate_annotation_name(assembly_name)
        if not annotation_id:
            print(error)
            return 0, error
    except Exception as err:
        print(err)
        return 0, createNotification(message=f"AnnotationImportError1: {str(err)}")

    try:
        if not annotation_name:
            print(error)
            return 0, error

        new_file_path, error = __store_annotation(dataset, taxon, assembly_name, annotation_name)

        if not new_file_path or not exists(new_file_path):
            print(error)
            deleteAnnotationByAnnotationID(annotation_id)
            return 0, error

        # sort gff
        path_to_dir = "/".join(new_file_path.split("/")[:-1])
        new_file_path_sorted = path_to_dir + f"/{annotation_name}.sorted.gff3"

        run(args=["gt", "gff3", "-sortlines", "-tidy", "-retainids", "-o", new_file_path_sorted, new_file_path])
        if exists(new_file_path_sorted):
            run(args=["rm", "-r", new_file_path])
            new_file_path = new_file_path_sorted

        gff_content, error = parseGff(new_file_path)

        if not gff_content:
            deleteAnnotationByAnnotationID(annotation_id)
            print(error)
            return 0, error

        # zip
        run(args=["bgzip", "--force", new_file_path])
        new_file_path += ".gz"

        imported_status, error = __importDB(
            annotation_id, assembly_id, annotation_name, new_file_path, userID, gff_content
        )

        if not imported_status:
            print(error)
            deleteAnnotationByAnnotationID(annotation_id)
            return 0, error

        notify_annotation(assembly_id, assembly_name, annotation_id, annotation_name, new_file_path, "Added")

        scanFiles()

        try:
            if "label" in dataset:
                updateAnnotationLabel(annotation_id, dataset["label"])
        except:
            print("Change annotation label failed!")
            pass

        print(f"New annotation {annotation_name} added!\n", flush=True)
        return annotation_id, createNotification("Success", f"New annotation {annotation_name} added!", "success")
    except Exception as err:
        print(str(err), flush=True)
        deleteAnnotationByAnnotationID(annotation_id)
        return 0, createNotification(message=f"AnnotationImportError2: {str(err)}")


# generate annotation name
def __generate_annotation_name(assembly_name):
    """
    Generates new annotation name.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='{DB_NAME}' AND TABLE_NAME='genomicAnnotations'"
        )
        auto_increment_counter = cursor.fetchone()[0]

        if not auto_increment_counter:
            next_id = 1
        else:
            next_id = auto_increment_counter

        cursor.execute("ALTER TABLE genomicAnnotations AUTO_INCREMENT = %s", (next_id + 1,))
        connection.commit()
    except Exception as err:
        return 0, 0, createNotification(message=str(err))

    new_annotation_name = f"{assembly_name}_annotation_id{next_id}"

    return new_annotation_name, next_id, []


# moves .gff3 into storage
def __store_annotation(dataset, taxon, assembly_name, annotation_name, forceIdentical=False):
    """
    Moves annotation data to storage directory.
    """
    try:
        # check if path exists
        old_file_path = BASE_PATH_TO_IMPORT + dataset["main_file"]["path"]
        print(old_file_path)
        if not exists(old_file_path):
            return 0, createNotification(message="Import path not found!")

        if old_file_path.lower().endswith(".gz"):
            run(["gunzip", "-q", old_file_path])

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
        new_file_path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/{assembly_name}/annotations/"
        run(["mkdir", "-p", new_file_path])
        if not isdir(new_file_path):
            return 0, createNotification(message="Creation of new directory failed!")

        if isfile(old_file_path):
            new_file_name = f"{annotation_name}.gff3"
            new_file_path_main_file = f"{new_file_path}{new_file_name}"
            run(["cp", old_file_path, new_file_path_main_file])
        else:
            return 0, createNotification(message="Invalid path to .gff3!")

        # check if main file was moved
        if not exists(new_file_path_main_file):
            return 0, createNotification(message="Moving annotation to storage failed!")

        # handle additional files
        if "additional_files" in dataset:
            for additional_file in dataset["additional_files"]:
                old_additional_file_path = BASE_PATH_TO_IMPORT + additional_file["path"]
                if exists(old_additional_file_path):
                    run(["cp", "-r", old_additional_file_path, new_file_path])

        print(f"Annotation ({basename(new_file_path_main_file)}) moved to storage!\n", flush=True)
        return new_file_path_main_file, []

    except Exception as err:
        return 0, createNotification(message=str(err))


# database import
def __importDB(annotation_id, assembly_id, annotation_name, path, userID, file_content):
    """
    G-nom database import (tables: annotations, annotationsSequences)
    """
    try:
        connection, cursor, error = connect()

        featureCount = dumps(file_content["featureCountDistinct"])
        cursor.execute(
            "INSERT INTO genomicAnnotations (id, assemblyID, name, path, featureCount, addedBy, addedOn) VALUES (%s, %s, %s, %s, %s, %s, NOW())",
            (annotation_id, assembly_id, annotation_name, path, featureCount, userID),
        )
        annotationID = cursor.lastrowid
        connection.commit()

        connection, cursor, error = connect()
        counter = 0
        values = ""

        sql = "INSERT INTO genomicAnnotationFeatures (annotationID, seqID, source, type, start, end, score, strand, phase, attributes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        values = []

        for feature in file_content["features"]:
            seqID = feature["seqID"]
            type = feature["feature"] if feature["feature"] != "." else "N/A"
            start = feature["start"]
            end = feature["end"]
            attributes = feature["info"]
            source = feature["method"][:50] if feature["method"] and feature["method"] != "." else None
            try:
                score = float(feature["score"])
            except:
                score = None
            strand = feature["strand"] if feature["strand"] in ["+", "-"] else None
            phase = int(feature["phase"]) if feature["phase"] in [0, 1, 2, "0", "1", "2"] else None

            if "parent" not in attributes and "Parent" not in attributes:
                values.append((annotationID, seqID, source, type, start, end, score, strand, phase, attributes))
                counter += 1

            if counter % 1000 == 0 and counter > 0:
                cursor.executemany(sql, values)
                connection.commit()
                values = []

        cursor.executemany(sql, values)
        connection.commit()
    except Exception as err:
        print(str(err), flush=True)
        return 0, createNotification(message=f"AnnotationImportDbError: {str(err)}")

    return 1, []


# fully deletes annotation by its ID
def deleteAnnotationByAnnotationID(annotation_id):
    """
    Deletes .gff3 and datatbase entry for specific annotation by annotation ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            "SELECT assemblies.id, assemblies.name, genomicAnnotations.name FROM assemblies, genomicAnnotations WHERE genomicAnnotations.id=%s AND genomicAnnotations.assemblyID=assemblies.id",
            (annotation_id,),
        )
        assembly_id, assembly_name, annotation_name = cursor.fetchone()

        cursor.execute(
            "SELECT taxa.* FROM assemblies, taxa WHERE assemblies.id=%s AND assemblies.taxonID=taxa.id", (assembly_id,)
        )

        row_headers = [x[0] for x in cursor.description]
        taxon = cursor.fetchone()
        taxon = dict(zip(row_headers, taxon))

        if annotation_id:
            status, error = __deleteAnnotationEntryByAnnotationID(annotation_id)

        if status and taxon and assembly_name and annotation_name:
            status, error = __deleteAnnotationFile(taxon, assembly_name, annotation_name)
        else:
            return 0, error

        if not status:
            return 0, error

        notify_annotation(assembly_id, assembly_name, annotation_id, annotation_name, "", "Removed")

        scanFiles()

        return 1, createNotification("Success", "Successfully deleted annotation", "success")
    except Exception as err:
        return 0, createNotification(message=f"AnnotationDeletionError1: {str(err)}")


# deletes files for annotation
def __deleteAnnotationFile(taxon, assembly_name, annotation_name):
    """
    Deletes data for specific annotation.
    """
    try:
        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])
        path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}"

        for file in glob(f"{path}/{assembly_name}/annotations/{annotation_name}*"):
            remove(file)

        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"AnnotationDeletionError2: {str(err)}")


def __deleteAnnotationEntryByAnnotationID(id):
    try:
        connection, cursor, error = connect()
        cursor.execute("DELETE FROM genomicAnnotations WHERE id=%s", (id,))
        connection.commit()
        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"AnnotationDeletionError3: {str(err)}")


# parse gff
def parseGff(path):
    GFF3_SKIPABLE = compile(r"^[ #]+$")
    GFF3_EXTENSION_PATTERN = compile(r".*\.gff3?$")
    GFF3_FINGERPRINT_PATTERN = compile(r"##gff-version 3")
    # GFF3_SEQUENCE_REGION_PATTERN = compile(r"^(##sequence-region)[ \t]+(\w+)[ \t]+(\d+)[ \t]+(\d+)$")
    GFF3_FEATURE_PATTERN = compile(
        r"^([%\w\.-]+)\s+([%\.\w-]+)\s+([%\.\w-]+)\s+(\d+)\s+(\d+)\s+([\.\de+-]+)\s+([\.+-])\s+([\.012])\s*(.*)$"
    )
    GFF3_KEY_VALUE_PATTERN = compile(r"^([%\w\.-]+)[:= ]+(.+)$")

    def parseSequenceRegion(sequence_region_raw):
        seqID = sequence_region_raw[2]
        start = sequence_region_raw[3]
        end = sequence_region_raw[4]

        return {"seqID": seqID, "start": start, "end": end}

    def parseFeature(feature_raw):
        seqID = feature_raw[1]
        method = feature_raw[2]
        feature = feature_raw[3]
        start = int(feature_raw[4])
        end = int(feature_raw[5])
        score = feature_raw[6]
        strand = feature_raw[7]
        phase = feature_raw[8]
        info_complete = feature_raw[9]

        info = {}

        try:
            if info_complete != ".":
                info_split = info_complete.split(";")
                info_split_stripped = [info.strip().replace('"', "").replace("'", "") for info in info_split]
                for i in info_split_stripped:
                    if not i:
                        continue
                    match = GFF3_KEY_VALUE_PATTERN.match(i)
                    if match:
                        try:
                            key_value = {match[1]: float(match[2])}
                        except:
                            key_value = {match[1]: match[2]}
                        info.update(key_value)
                    else:
                        print(f"Warning: Info did not match pattern. Skipping...\n'{i}'", flush=True)

            return {
                "seqID": seqID,
                "method": method,
                "feature": feature,
                "start": start,
                "end": end,
                "score": score,
                "strand": strand,
                "phase": phase,
                "info": dumps(info, separators=(",", ":")),
            }
        except Exception as err:
            print(str(err), flush=True)
            return {}

    try:
        file_name = basename(path)

        print(f"Parsing file: {file_name}", flush=True)

        # check file extension
        if not GFF3_EXTENSION_PATTERN.match(file_name):
            print("Warning: File extension did not match '.gff' or '.gff3'! Searching for fingerprint...")

        # open file
        try:
            with open(path) as gff3:
                data = gff3.readlines()
                gff3.close()
        except Exception as err:
            return 0, createNotification(message=str(err))

        # for % processed
        number_of_rows = len(data)

        number_of_regions = 0
        number_of_features = 0
        features = []
        featureCountDistinct = {}
        for index, row in enumerate(data):
            if not index % 100:
                print(f"Parsed: {round((index / number_of_rows) * 100)}%", end="\r")
            row = row.strip()
            # only '#' or empty row
            if GFF3_SKIPABLE.match(row):
                continue

            # fingerprint: '##gff-version 3'
            match = GFF3_FINGERPRINT_PATTERN.match(row)
            if match:
                print("Fingerprint found...")
                continue

            # # '##sequence-region' scaffold/contig start end
            # match = GFF3_SEQUENCE_REGION_PATTERN.match(row)
            # if match:
            #     number_of_regions += 1
            #     sequence_region = parseSequenceRegion(match)
            #     # print(sequence_region)
            #     continue

            # scaffold/contig method feature start end ? strand offset id/parent/infos
            match = GFF3_FEATURE_PATTERN.match(row)
            if match:
                number_of_features += 1
                feature = parseFeature(match)

                if not feature:
                    print(f"Warning: A feature could not be parsed. Skipping...", flush=True)
                    continue

                if feature["feature"] in featureCountDistinct:
                    featureCountDistinct.update({feature["feature"]: featureCountDistinct[feature["feature"]] + 1})
                else:
                    featureCountDistinct.update({feature["feature"]: 0})
                features.append(feature)
                continue

            # no matching pattern
            else:
                print(f"Warning: Row did not match any patterns. Skipping...\n'{row}'", flush=True)
                continue

        featureCountDistinct.update({"total": len(features)})

        print(f"Parsed: 100%", end="\r")

        return {"features": features, "featureCountDistinct": featureCountDistinct}, []

    except Exception as err:
        return {"features": [], "featureCountDistinct": {}}, createNotification(
            message=f"AnnotationParsingError: {str(err)}"
        )


# update annotation label
def updateAnnotationLabel(annotation_id: int, label: str):
    """
    Set label for annotation.
    """
    try:
        connection, cursor, error = connect()

        LABEL_PATTERN = compile(r"^\w+$")

        if label and not LABEL_PATTERN.match(label):
            return 0, createNotification(message="Invalid label. Use only [a-zA-Z0-9_]!")
        elif not label:
            label = None

        cursor.execute(
            "UPDATE genomicAnnotations SET label=%s WHERE id=%s",
            (label, annotation_id),
        )
        connection.commit()
        if label:
            return 1, createNotification("Success", f"Successfully added label: {label}", "success")
        else:
            return 1, createNotification("Info", f"Default name restored", "info")
    except Exception as err:
        return 0, createNotification(message=f"AnnotationLabelUpdateError: {str(err)}")


## ============================ FETCH ============================ ##
# fetches all annotations for specific assembly
def fetchAnnotationsByAssemblyID(assemblyID):
    """
    Fetches all annotations for specific assembly from database.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute(
            "SELECT genomicAnnotations.*, users.username FROM genomicAnnotations, users WHERE genomicAnnotations.assemblyID=%s AND genomicAnnotations.addedBy=users.id",
            (assemblyID,),
        )

        row_headers = [x[0] for x in cursor.description]
        annotations = cursor.fetchall()
        annotations = [dict(zip(row_headers, x)) for x in annotations]

        if not len(annotations):
            return [], createNotification("Info", "No annotations for this assembly!", "info")

        return (
            annotations,
            [],
        )
    except Exception as err:
        return [], createNotification(message=str(err))


# fetches all features (includes filtering by search, offset, range)
def fetchFeatures(assembly_id=-1, search="", filter={}, sortBy={"column": "seqID", "order": True}, offset=0, range=10):
    """
    Fetches all features from database. Filtering by assembly, search term, offset and/or range.
    """

    try:
        connection, cursor, error = connect()

        offset = int(offset)
        range = int(range)
        assembly_id = int(assembly_id)

        if assembly_id < 0:
            cursor.execute(
                "SELECT assemblies.id AS assemblyID, assemblies.name, assemblies.label, taxa.id AS taxonID, taxa.scientificName, genomicAnnotationFeatures.* FROM assemblies, taxa, genomicAnnotations, genomicAnnotationFeatures WHERE assemblies.id=genomicAnnotations.assemblyID AND assemblies.taxonID=taxa.id AND genomicAnnotations.id=genomicAnnotationFeatures.annotationID"
            )
        else:
            cursor.execute(
                "SELECT assemblies.id AS assemblyID, assemblies.name, assemblies.label, taxa.id as taxonID, taxa.scientificName, genomicAnnotationFeatures.* FROM assemblies, taxa, genomicAnnotations, genomicAnnotationFeatures WHERE assemblies.id=%s AND assemblies.taxonID=taxa.id AND assemblies.id=genomicAnnotations.assemblyID AND genomicAnnotations.id=genomicAnnotationFeatures.annotationID",
                (assembly_id,),
            )

        row_headers = [x[0] for x in cursor.description]
        features = cursor.fetchall()
        features = [dict(zip(row_headers, x)) for x in features]

        if search:
            search = str(search).lower()
            filtered_features = []
            for x in features:
                if len([s for s in x.values() if search == str(s).lower() or search in str(s).lower()]):
                    filtered_features.append(x)
            features = filtered_features

        for idx, feature in enumerate(features):
            if "attributes" in feature:
                features[idx]["attributes"] = loads(features[idx]["attributes"])

        if sortBy["column"] == "label":
            features = sorted(
                features, key=lambda x: (x[sortBy["column"]] is None, x["label"], x["name"]), reverse=sortBy["order"]
            )
        else:
            features = sorted(
                features, key=lambda x: (x[sortBy["column"]] is None, x[sortBy["column"]]), reverse=sortBy["order"]
            )

        numberOperatorsDict = {"=": eq, "!=": ne, "<": lt, ">": gt, "<=": le, ">=": ge}
        stringOperatorsDict = {
            "contains": contains,
            "is": is_,
            "is_not": is_not,
        }

        if filter:
            if "taxonIDs" in filter:
                features = [x for x in features if x["taxonID"] in filter["taxonIDs"]]
            if "featureTypes" in filter:
                features = [x for x in features if x["type"] in filter["featureTypes"]]
            if "featureAttributes" in filter:
                filtered = []
                for feature in features:
                    if "attributes" in feature:
                        feature_attributes = feature["attributes"]
                        for attribute in filter["featureAttributes"]:
                            if not "target" in attribute or not "operator" in attribute or not "value" in attribute:
                                continue

                            target, operatorString, valueString = (
                                attribute["target"],
                                attribute["operator"],
                                attribute["value"],
                            )

                            if target in feature_attributes:
                                check = False
                                try:
                                    target_value = feature_attributes[target]
                                    if operatorString in numberOperatorsDict:
                                        try:
                                            target_value = float(str(target_value).replace("%", "").replace(",", ""))
                                            valueString = float(str(valueString).replace("%", "").replace(",", ""))
                                        except Exception as err:
                                            print(str(err), flush=True)

                                        check = numberOperatorsDict[operatorString](target_value, valueString)
                                    elif operatorString in stringOperatorsDict:
                                        check = stringOperatorsDict[operatorString](target_value, valueString)
                                except Exception as err:
                                    print(str(err), flush=True)

                                if check:
                                    filtered.append(feature)

                features = filtered

        number_of_elements = len(features)
        if number_of_elements % range:
            pages = (number_of_elements // range) + 1
        else:
            pages = number_of_elements // range

        features = features[offset * range : offset * range + range]

        if len(features):
            return (
                features,
                {"offset": offset, "range": range, "pages": pages, "search": search},
                [],
            )
        else:
            return (
                [],
                {"offset": 0, "range": 10, "pages": 0, "search": search},
                createNotification("Info", "No features found!", "info"),
            )
    except Exception as err:
        return [], {}, createNotification(message=f"FeaturesFetchingError: {str(err)}")


# fetches all unique feature types from all features
def fetchFeatureTypes():
    """
    Fetches all unique feature types.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute("SELECT DISTINCT(type) FROM genomicAnnotationFeatures")

        featureTypes_list = cursor.fetchall()
        if featureTypes_list:
            featureTypes_list = [x[0] for x in featureTypes_list]

        return featureTypes_list, []
    except Exception as err:
        return [], createNotification(message=f"FeatureTypesFetchingError: {str(err)}")


# gets all unique attribute keys from all features
def fetchFeatureAttributeKeys():
    """
    Fetches all unique keys in attribute section of features.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute("SELECT DISTINCT(JSON_EXTRACT(JSON_KEYS(attributes),'$[*]')) FROM genomicAnnotationFeatures")

        key_lists = cursor.fetchall()
        keys = []
        for key_list in key_lists:
            try:
                keys += loads(key_list[0])
                keys = list(set(keys))
            except Exception as err:
                print(f"Attribute could not be extracted", flush=True)
                print(key_list[0], flush=True)

        return keys, []
    except Exception as err:
        return [], createNotification(message=f"FeatureAttributeTypeFetchingError: {str(err)}")
