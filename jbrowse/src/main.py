from posixpath import basename
import pika
from os import remove, environ, _exit
from json import load, dumps, loads
from subprocess import run
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
        run(args=["rm", "-r", jbrowse_assembly_path + f"/trix"])
        run(args=["jbrowse", "text-index", "--out", ".", "--force"], cwd=jbrowse_assembly_path)
        return True
    except Exception as err:
        return False


def handle_delete_assembly(message):
    try:
        jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

        run(args=["rm", "-r", jbrowse_assembly_path])
        return True
    except Exception as err:
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
                "--category",
                "mapping",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )
        run(args=["rm", "-r", jbrowse_assembly_path + f"/trix"])
        run(
            args=["jbrowse", "text-index", "--out", ".", "---force"],
            cwd=jbrowse_assembly_path,
        )
        return True
    except Exception as err:
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
            tracks = [track for track in jbrowse_config["tracks"] if track["trackId"] != f"track_mapping_{mapping_id}"]
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

        run(args=["rm", "-r", jbrowse_assembly_path + f"/trix"])
        run(
            args=["jbrowse", "text-index", "--out", ".", "---force"],
            cwd=jbrowse_assembly_path,
        )

        return 1
    except Exception as err:
        print(f"JbrowseConfigUpdateError: {str(err)}")

    try:
        return True
    except Exception as err:
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
                "--category",
                "annotation",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )
        run(args=["rm", "-r", jbrowse_assembly_path + f"/trix"])
        run(
            args=["jbrowse", "text-index", "--out", ".", "---force"],
            cwd=jbrowse_assembly_path,
        )
        return True
    except Exception as err:
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
            tracks = [
                track for track in jbrowse_config["tracks"] if track["trackId"] != f"track_annotation_{annotation_id}"
            ]
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

        run(args=["rm", "-r", jbrowse_assembly_path + f"/trix"])
        run(
            args=["jbrowse", "text-index", "--out", ".", "--force"],
            cwd=jbrowse_assembly_path,
        )

        return 1
    except Exception as err:
        print(f"JbrowseConfigUpdateError: {str(err)}")

    try:
        return True
    except Exception as err:
        return False


def callback(ch, method, properties, body):
    message = loads(body)

    if message["action"] == "Added":
        handle_selector = {
            "Assembly": handle_new_assembly,
            "Mapping": handle_new_mapping,
            "Annotation": handle_new_annotation,
        }
    else:
        handle_selector = {
            "Assembly": handle_delete_assembly,
            "Mapping": handle_delete_mapping,
            "Annotation": handle_delete_annotation,
        }

    handler = handle_selector[message["type"]]

    if handler(message):
        ch.basic_ack(delivery_tag=method.delivery_tag)
    else:
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=True)


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
