import pika
from os import remove, environ, _exit
from json import load, dumps, loads
from subprocess import PIPE, run
from sys import exit
from glob import glob

STORAGE_ROOT = ""
JBROWSE_PATH = "/usr/local/apache2/htdocs"


def handle_new_assembly(message):
    try:
        storage_fasta = "{}{}".format(STORAGE_ROOT, message["storage_path"])
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

        run(args=["samtools", "faidx", storage_fasta])
        run(args=["mkdir", "-p", jbrowse_assembly_path])
        run(
            args=["jbrowse", "add-assembly", storage_fasta, "--load", "symlink", "--name", message["assembly"]["name"]],
            cwd=jbrowse_assembly_path,
        )

        reindexAssemblyFiles(jbrowse_assembly_path, message["assembly"]["name"])
        return True
    except Exception as err:
        print(f"JbrowseAddAssemblyError: {str(err)}")
        return False


def handle_delete_assembly(message):
    try:
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

        run(args=["rm", "-r", jbrowse_assembly_path])
        return True
    except Exception as err:
        print(f"JbrowseConfigUpdateError: {str(err)}")
        return False


def handle_new_mapping(message):
    try:
        storage_bam = "{}{}".format(STORAGE_ROOT, message["storage_path"])
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

        run(args=["samtools", "index", storage_bam])
        run(
            args=[
                "jbrowse",
                "add-track",
                storage_bam,
                "--name",
                message["mapping"]["name"],
                "--trackId",
                message["mapping"]["name"],
                "--category",
                "mapping",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )

        reindexAssemblyFiles(jbrowse_assembly_path, message["mapping"]["name"])
        return True
    except Exception as err:
        print(f"JbrowseAddMappingError: {str(err)}")
        return False


def handle_delete_mapping(message):
    try:
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])
        jbrowse_config_path = jbrowse_assembly_path + f"/config.json"
        mapping_id = message["mapping"]["id"]
        mapping_name = message["mapping"]["name"]

        for file in glob(jbrowse_assembly_path + f"/{mapping_name}*"):
            remove(file)

        with open(jbrowse_config_path, "r") as f:
            jbrowse_config = load(f)
            f.close()

        if "tracks" in jbrowse_config:
            tracks = [track for track in jbrowse_config["tracks"] if track["trackId"] != mapping_name]
            jbrowse_config["tracks"] = tracks

        if "aggregateTextSearchAdapters" in jbrowse_config:
            aggregateTextSearchAdapters = [
                adapter
                for adapter in jbrowse_config["aggregateTextSearchAdapters"]
                if adapter["textSearchAdapterId"] != f"text_search_adapter_mapping_{mapping_id}"
            ]
            jbrowse_config["aggregateTextSearchAdapters"] = aggregateTextSearchAdapters

        with open(jbrowse_config_path, "w") as f:
            f.write(dumps(jbrowse_config, indent=4))
            f.close()

        reindexAssemblyFiles(jbrowse_assembly_path, mapping_name)
        return True
    except Exception as err:
        print(f"JbrowseConfigUpdateError: {str(err)}")
        return False


def handle_new_annotation(message):
    try:
        storage_gff = "{}{}".format(STORAGE_ROOT, message["storage_path"])
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

        run(args=["tabix", "-p", "gff", storage_gff])
        run(
            args=[
                "jbrowse",
                "add-track",
                storage_gff,
                "--name",
                message["annotation"]["name"],
                "--trackId",
                message["annotation"]["name"],
                "--category",
                "annotation",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )

        reindexAssemblyFiles(jbrowse_assembly_path, message["annotation"]["name"])
        return True
    except Exception as err:
        print(f"JbrowseAddAnnotationError: {str(err)}")
        return False


def handle_delete_annotation(message):
    try:
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])
        jbrowse_config_path = jbrowse_assembly_path + f"/config.json"
        annotation_id = message["annotation"]["id"]
        annotation_name = message["annotation"]["name"]

        for file in glob(jbrowse_assembly_path + f"/{annotation_name}*"):
            remove(file)

        with open(jbrowse_config_path, "r") as f:
            jbrowse_config = load(f)
            f.close()

        if "tracks" in jbrowse_config:
            tracks = [track for track in jbrowse_config["tracks"] if track["trackId"] != annotation_name]
            jbrowse_config["tracks"] = tracks

        if "aggregateTextSearchAdapters" in jbrowse_config:
            aggregateTextSearchAdapters = [
                adapter
                for adapter in jbrowse_config["aggregateTextSearchAdapters"]
                if adapter["textSearchAdapterId"] != f"text_search_adapter_annotation_{annotation_id}"
            ]
            jbrowse_config["aggregateTextSearchAdapters"] = aggregateTextSearchAdapters

        with open(jbrowse_config_path, "w") as f:
            f.write(dumps(jbrowse_config, indent=4))
            f.close()

        reindexAssemblyFiles(jbrowse_assembly_path, annotation_name)
        return 1
    except Exception as err:
        print(f"JbrowseConfigUpdateError: {str(err)}")
        return False


def reindexAssemblyFiles(jbrowse_assembly_path, track_name, fallback=False):
    try:
        run(args=["rm", "-r", jbrowse_assembly_path + f"/trix"])
    except:
        pass

    try:
        with open(f"{jbrowse_assembly_path}/config.json") as configFile:
            config = load(configFile)
            configFile.close()
        if "tracks" in config:
            tracks = [x["trackId"] for x in config["tracks"]]
    except:
        tracks = []

    try:
        with open(f"{jbrowse_assembly_path}/exceptions.txt", "r") as exceptionFile:
            exceptions = [x.replace("\n", "") for x in exceptionFile.readlines()]
            exceptionFile.close()
    except:
        exceptions = []

    try:
        if len(tracks) and len(exceptions) > 0:
            tracks_without_exceptions = [x for x in tracks if x not in exceptions]
            track_index_string = ",".join(tracks_without_exceptions)
            output = run(
                args=["jbrowse", "text-index", "--out", ".", "--force", f"--tracks={track_index_string}"],
                cwd=jbrowse_assembly_path,
                stdout=PIPE,
                stderr=PIPE,
            )
        else:
            output = run(
                args=["jbrowse", "text-index", "--out", ".", "--force"],
                cwd=jbrowse_assembly_path,
                stdout=PIPE,
                stderr=PIPE,
            )

        if "error" in output.stderr.decode("UTF-8").lower():
            if not fallback:
                with open(f"{jbrowse_assembly_path}/exceptions.txt", "a+") as exceptionFile:
                    exceptionFile.write(track_name + "\n")
                    exceptionFile.close()
                print(f"IndexError2: Added {track_name} to exceptions!")
                reindexAssemblyFiles(jbrowse_assembly_path, track_name, True)
    except Exception as e:
        if not fallback:
            with open(f"{jbrowse_assembly_path}/exceptions.txt", "a+") as exceptionFile:
                exceptionFile.write(track_name + "\n")
                exceptionFile.close()
            reindexAssemblyFiles(jbrowse_assembly_path, track_name, True)


def callback(ch, method, properties, body):
    message = loads(body)

    try:
        task_action = message["action"]
        task_type = message["type"]

        print(f"Task received: {task_action}: {task_type}")

        handle_selector = {}
        if task_action == "Added":
            handle_selector = {
                "Assembly": handle_new_assembly,
                "Mapping": handle_new_mapping,
                "Annotation": handle_new_annotation,
            }
        elif task_action == "Removed":
            handle_selector = {
                "Assembly": handle_delete_assembly,
                "Mapping": handle_delete_mapping,
                "Annotation": handle_delete_annotation,
            }
        else:
            ch.basic_ack(delivery_tag=method.delivery_tag)

        if task_type in handle_selector:
            handler = handle_selector[task_type]
            handler(message)

        print(f"Task done: {task_action}: {task_type}")

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as err:
        print(str(err))
        ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    queue = "resource"

    connection = pika.BlockingConnection(pika.ConnectionParameters(host=environ.get("RABBIT_CONTAINER_NAME")))
    channel = connection.channel()

    channel.queue_declare(queue=queue, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue, on_message_callback=callback, auto_ack=False)

    channel.start_consuming()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            exit(0)
        except SystemExit:
            _exit(0)
