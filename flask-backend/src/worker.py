import pika
from os import environ, _exit
from json import loads
from sys import exit
from threading import Thread, get_ident
from functools import partial

from modules.taxa import updateTaxonTree
from modules.combined_imports import importDataset
from modules.tasks import updateTask


def handle_update_local_taxon_tree(connection, channel, delivery_tag, message):
    try:
        thread_id = get_ident()
        print("Thread id: {} Delivery tag: {}".format(thread_id, delivery_tag))

        updateTaxonTree()

        cb = partial(ack_message, channel, delivery_tag)
        connection.add_callback_threadsafe(cb)

    except Exception as err:
        print(f"UpdateTaxonTreeError: {str(err)}")
        cb = partial(ack_message, channel, delivery_tag)
        connection.add_callback_threadsafe(cb)


def handle_import_dataset(connection, channel, delivery_tag, message):

    thread_id = get_ident()
    print("Thread id: {} Delivery tag: {}".format(thread_id, delivery_tag))

    try:
        taskID = message["taskID"]
        taxon = message["data"]["taxon"]
        assembly = message["data"]["assembly"]
        userID = message["data"]["userID"]
        annotations = message["data"]["annotations"]
        mappings = message["data"]["mappings"]
        buscos = message["data"]["buscos"]
        fcats = message["data"]["fcats"]
        milts = message["data"]["milts"]
        repeatmaskers = message["data"]["repeatmaskers"]
        append_assembly_id = message["data"]["append_assembly_id"]
        importDataset(
            taxon,
            assembly,
            userID,
            annotations,
            mappings,
            buscos,
            fcats,
            milts,
            repeatmaskers,
            append_assembly_id,
            taskID,
        )
        updateTask(taskID, "done")

        cb = partial(ack_message, channel, delivery_tag)
        connection.add_callback_threadsafe(cb)
    except Exception as err:
        print(f"ImportDatasetError: {str(err)}")
        updateTask(taskID, "aborted")
        cb = partial(ack_message, channel, delivery_tag)
        connection.add_callback_threadsafe(cb)


def callback(cnx, ch, method, properties, body, threads):
    message = loads(body)

    try:
        task_action = message["action"]
        task_type = message["type"]

        print(f"Task received: {task_action}: {task_type}", flush=True)

        if task_action == "Update":
            handle_selector = {"LocalTaxonTree": handle_update_local_taxon_tree}
        elif task_action == "Import":
            handle_selector = {"Dataset": handle_import_dataset}

        if task_type in handle_selector:
            handler = handle_selector[task_type]
            thread = Thread(target=handler, args=(cnx, ch, method.delivery_tag, message))
            thread.start()
            threads.append(thread)
    except Exception as err:
        print(str(err), flush=True)


def ack_message(channel, delivery_tag):
    if channel.is_open:
        channel.basic_ack(delivery_tag)
    else:
        pass


def main():
    queue = "worker"

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=environ.get("RABBIT_CONTAINER_NAME"), heartbeat=5)
    )
    channel = connection.channel()

    channel.queue_declare(queue=queue, durable=True)
    channel.basic_qos(prefetch_count=1)

    threads = []
    channel.basic_consume(
        queue=queue,
        on_message_callback=lambda ch, method, properties, body: callback(
            connection, ch, method, properties, body, threads
        ),
        auto_ack=False,
    )

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
