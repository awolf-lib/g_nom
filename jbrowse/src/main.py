import pika
import os
import json
import subprocess
import sys

STORAGE_ROOT = ""
JBROWSE_PATH = "/usr/local/apache2/htdocs"


def handle_new_assembly(message):
    storage_fasta = "{}{}".format(STORAGE_ROOT, message.storage_path)
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message.assembly.name)

    try:
        subprocess.check_output(args=["samtools", "faidx", storage_fasta])
        subprocess.check_output(args=["mkdir", "-p", jbrowse_assembly_path])
        subprocess.check_output(
            args=["jbrowse", "add-assembly", storage_fasta, "--load", "symlink", "--name", message.assembly.name],
            cwd=jbrowse_assembly_path,
        )
        return True
    except subprocess.CalledProcessError:
        return False


def handle_new_mapping(message):
    storage_bam = "{}{}".format(STORAGE_ROOT, message.storage_path)
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message.assembly.name)

    try:
        subprocess.check_output(args=["samtools", "index", storage_bam])
        subprocess.check_output(
            args=[
                "jbrowse",
                "add-track",
                storage_bam,
                "--name",
                message.mapping_name,
                "--category",
                "mapping",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )
        return True
    except subprocess.CalledProcessError:
        return False


def handle_new_annotation(message):
    storage_gff = "{}{}".format(STORAGE_ROOT, message.storage_path)
    jbrowse_assembly_path = "{}/assemblies/{}".format(JBROWSE_PATH, message.assembly.name)

    try:
        subprocess.check_output(args=["bgzip", storage_gff])
        subprocess.check_output(args=["tabix", "-p", "gff", "{}.gz".format(storage_gff)])
        subprocess.check_output(
            args=[
                "jbrowse",
                "add-track",
                "{}.gz".format(storage_gff),
                "--name",
                message.annotation_name,
                "--category",
                "annotation",
                "--load",
                "symlink",
            ],
            cwd=jbrowse_assembly_path,
        )
        return True
    except subprocess.CalledProcessError:
        return False


def callback(ch, method, properties, body):
    message = json.load(body)

    handle_selector = {
        "Assembly": handle_new_assembly,
        "Mapping": handle_new_mapping,
        "Annotation": handle_new_annotation,
    }
    handler = handle_selector(message.type)

    if handler(message):
        ch.basic_ack()
    else:
        ch.basic_reject()


def main():
    queue = "resource"

    connection = pika.BlockingConnection(pika.ConnectionParameters(host=os.environ.get("RABBIT_CONTAINER_NAME")))
    channel = connection.channel()

    channel.queue_declare(queue, durable=True)

    channel.basic_consume(queue, on_message_callback=callback, auto_ack=False)

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
