from os.path import exists, isdir, isfile
from os import remove
from posixpath import basename
from re import compile, sub
from subprocess import run
from glob import glob

from .notifications import createNotification
from .db_connection import connect, DB_NAME
from .environment import BASE_PATH_TO_STORAGE, BASE_PATH_TO_IMPORT
from .files import scanFiles
from .producer import notify_mapping

ANNOTATION_FILE_PATTERN = {
    "main_file": compile(r"^(.*\.gff$)|(.*\.gff3$)|(.*\.gff\.gz$)|(.*\.gff3\.gz$)"),
    "default_parent_dir": None,
    "additional_files": [],
}

## ============================ IMPORT AND DELETE ============================ ##
# full import of .sam/.bam
def import_mapping(taxon, assembly_id, dataset, userID):
    """
    Import workflow for new mapping.
    """
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

        mapping_name, mapping_id, error = __generate_mapping_name(assembly_name)
        if not mapping_id:
            return 0, error
    except Exception as err:
        return 0, createNotification(message=f"AnnotationImportError1: {str(err)}")

    try:
        if not mapping_name:
            return 0, error

        new_file_path, error = __store_mapping(dataset, taxon, assembly_name, mapping_name)

        if not new_file_path or not exists(new_file_path):
            deleteMappingByMappingID(mapping_id)
            return 0, error

        imported_status, error = __importDB(mapping_id, assembly_id, mapping_name, new_file_path, userID)

        if not imported_status:
            deleteMappingByMappingID(mapping_id)
            return 0, error

        notify_mapping(assembly_id, assembly_name, mapping_id, mapping_name, new_file_path, "Added")

        scanFiles()

        print(f"New mapping {mapping_name} added!")
        return mapping_id, createNotification("Success", f"New mapping {mapping_name} added!", "success")
    except Exception as err:
        deleteMappingByMappingID(mapping_id)
        return 0, createNotification(message=f"AnnotationImportError2: {str(err)}")


# generate mapping name
def __generate_mapping_name(assembly_name):
    """
    Generates new mapping name.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='{DB_NAME}' AND TABLE_NAME='mappings'"
        )
        auto_increment_counter = cursor.fetchone()[0]

        if not auto_increment_counter:
            next_id = 1
        else:
            next_id = auto_increment_counter

        cursor.execute("ALTER TABLE mappings AUTO_INCREMENT = %s", (next_id + 1,))
        connection.commit()
    except Exception as err:
        return 0, 0, createNotification(message=str(err))

    new_mapping_name = f"{assembly_name}_mapping_id{next_id}"

    return new_mapping_name, next_id, []


# moves .gff3 into storage
def __store_mapping(dataset, taxon, assembly_name, annotation_name, forceIdentical=False):
    """
    Moves annotation data to storage directory.
    """
    try:
        # check if path exists
        old_file_path = BASE_PATH_TO_IMPORT + dataset["main_file"]["path"]
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
        new_file_path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}/{assembly_name}/mappings/"
        run(["mkdir", "-p", new_file_path])
        if not isdir(new_file_path):
            return 0, createNotification(message="Creation of new directory failed!")

        if isfile(old_file_path):
            new_file_name = f"{annotation_name}.bam"
            new_file_path_main_file = f"{new_file_path}{new_file_name}"
            run(["cp", old_file_path, new_file_path_main_file])
        else:
            return 0, createNotification(message="Invalid path to .bam!")

        # check if main file was moved
        if not exists(new_file_path_main_file):
            return 0, createNotification(message="Moving mapping to storage failed!")
        # add remove?

        # handle additional files
        for additional_file in dataset["additional_files"]:
            old_additional_file_path = BASE_PATH_TO_IMPORT + additional_file["path"]
            if exists(old_additional_file_path):
                run(["cp", "-r", old_additional_file_path, new_file_path])

        print(f"Mapping ({basename(new_file_path_main_file)}) moved to storage!")
        return new_file_path_main_file, []

    except Exception as err:
        return 0, createNotification(message=str(err))


# database import
def __importDB(mapping_id, assembly_id, annotation_name, path, userID):
    """
    G-nom database import (table: mappings)
    """
    try:
        connection, cursor, error = connect()

        cursor.execute(
            "INSERT INTO mappings (id, assemblyID, name, path, addedBy, addedOn) VALUES (%s, %s, %s, %s, %s, NOW())",
            (mapping_id, assembly_id, annotation_name, path, userID),
        )
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, []


# fully deletes mapping by its ID
def deleteMappingByMappingID(mapping_id):
    """
    Deletes .bam and datatbase entry for specific mapping by mapping ID.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            "SELECT assemblies.id, assemblies.name, mappings.name FROM assemblies, mappings WHERE mappings.id=%s AND mappings.assemblyID=assemblies.id",
            (mapping_id,),
        )
        assembly_id, assembly_name, mapping_name = cursor.fetchone()

        cursor.execute(
            "SELECT taxa.* FROM assemblies, taxa WHERE assemblies.id=%s AND assemblies.taxonID=taxa.id", (assembly_id,)
        )

        row_headers = [x[0] for x in cursor.description]
        taxon = cursor.fetchone()
        taxon = dict(zip(row_headers, taxon))

        if mapping_id:
            status, error = __deleteMappingEntryByMappingID(mapping_id)

        if status and taxon and assembly_name and mapping_name:
            status, error = __deleteMappingFile(taxon, assembly_name, mapping_name)
        else:
            return 0, error

        if not status:
            return 0, error

        notify_mapping(assembly_id, assembly_name, mapping_id, mapping_name, "", "Removed")

        scanFiles()

        return 1, createNotification("Success", "Successfully deleted mapping", "success")
    except Exception as err:
        return 0, createNotification(message=f"AnnotationDeletionError1: {str(err)}")


# deletes folder for assembly
def __deleteMappingFile(taxon, assembly_name, mapping_name):
    """
    Deletes data for specific mapping.
    """
    try:
        scientificName = sub("[^a-zA-Z0-9_]", "_", taxon["scientificName"])
        path = f"{BASE_PATH_TO_STORAGE}taxa/{scientificName}"

        for file in glob(f"{path}/{assembly_name}/mappings/{mapping_name}*"):
            remove(file)

        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"MappingDeletionError2: {str(err)}")


def __deleteMappingEntryByMappingID(id):
    try:
        connection, cursor, error = connect()
        cursor.execute("DELETE FROM mappings WHERE id=%s", (id,))
        connection.commit()
        return 1, []
    except Exception as err:
        return 0, createNotification(message=f"MappingDeletionError3: {str(err)}")


# update mapping label
def updateMappingLabel(mapping_id: int, label: str):
    """
    Set label for mapping.
    """
    try:
        connection, cursor, error = connect()

        LABEL_PATTERN = compile(r"^\w+$")

        if label and not LABEL_PATTERN.match(label):
            return 0, createNotification(message="Invalid label. Use only [a-zA-Z0-9_]!")
        elif not label:
            label = None

        cursor.execute(
            "UPDATE mappings SET label=%s WHERE id=%s",
            (label, mapping_id),
        )
        connection.commit()
        if label:
            return 1, createNotification("Success", f"Successfully added label: {label}", "success")
        else:
            return 1, createNotification("Info", f"Default name restored", "info")
    except Exception as err:
        return 0, createNotification(message=f"MappingLabelUpdateError: {str(err)}")


## ============================ FETCH ============================ ##
# fetches all mappings for specific assembly
def fetchMappingsByAssemblyID(assemblyID):
    """
    Fetches all mappings for specific assembly from database.
    """
    try:
        connection, cursor, error = connect()

        cursor.execute(
            "SELECT mappings.*, users.username FROM mappings, users WHERE mappings.assemblyID=%s AND mappings.addedBy=users.id",
            (assemblyID,),
        )

        row_headers = [x[0] for x in cursor.description]
        mappings = cursor.fetchall()
        mappings = [dict(zip(row_headers, x)) for x in mappings]

        if not len(mappings):
            return [], createNotification("Info", "No mappings for this assembly", "info")

        return (
            mappings,
            [],
        )
    except Exception as err:
        return [], createNotification(message=str(err))
