from genericpath import exists
from posixpath import basename
import pika
import os
import json
from subprocess import run
import sys

STORAGE_ROOT = ""
JBROWSE_PATH = "/usr/local/apache2/htdocs"


def handle_new_assembly(message):
    storage_fasta = "{}{}".format(STORAGE_ROOT, message["storage_path"])
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

    try:
        run(args=["samtools", "faidx", storage_fasta])
        run(args=["mkdir", "-p", jbrowse_assembly_path])
        run(
            args=["jbrowse", "add-assembly", storage_fasta, "--load", "symlink", "--name", message["assembly"]["name"]],
            cwd=jbrowse_assembly_path,
        )
        run(args=["jbrowse", "text-index", "--out", ".", "--force"], cwd=jbrowse_assembly_path)
        return True
    except Exception as err:
        return False


def handle_delete_assembly(message):
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

    try:
        run(args=["rm", "-r", jbrowse_assembly_path])
        return True
    except Exception as err:
        return False


def handle_new_mapping(message):
    storage_bam = "{}{}".format(STORAGE_ROOT, message["storage_path"])
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

    try:
        run(args=["samtools", "index", storage_bam])
        run(
            args=[
                "jbrowse",
                "add-track",
                storage_bam,
                "--name",
                message["mapping_name"],
                "--category",
                "mapping",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )
        run(
            args=["jbrowse", "text-index", "--out", ".", "--force"],
            cwd=jbrowse_assembly_path,
        )
        return True
    except Exception as err:
        return False


def handle_delete_mapping(message):
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

    try:
        return True
    except Exception as err:
        return False


def handle_new_annotation(message):
    storage_gff = "{}{}".format(STORAGE_ROOT, message["storage_path"])
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

    try:
        run(args=["tabix", "-p", "gff", storage_gff])
        run(
            args=[
                "jbrowse",
                "add-track",
                storage_gff,
                "--name",
                message["annotation_name"],
                "--category",
                "annotation",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )
        run(
            args=["jbrowse", "text-index", "--out", ".", "--force"],
            cwd=jbrowse_assembly_path,
        )
        return True
    except Exception as err:
        return False


def handle_delete_annotation(message):
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message["assembly"]["name"])

    try:
        return True
    except Exception as err:
        return False


def callback(ch, method, properties, body):
    message = json.loads(body)

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

    connection = pika.BlockingConnection(pika.ConnectionParameters(host=os.environ.get("RABBIT_CONTAINER_NAME")))
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
            sys.exit(0)
        except SystemExit:
            os._exit(0)
