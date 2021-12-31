import pika
from os import environ, _exit
from json import loads
from subprocess import PIPE, run, check_output
from sys import exit


def handle_scan_filesystem(message):
    try:
        run(args=["runuser", "--user", "www-data", "--", "php", "occ", "files:scan", "--all"])
        return True
    except Exception as err:
        print(f"FileScanError: {str(err)}")
        return False


def handle_create_user(message):
    try:
        new_username = message["user"]["username"]
        new_password = message["user"]["password"]
        environ["OC_PASS"] = new_password
        run(
            args=["runuser", "--user", "www-data", "--", "php", "occ", "user:add", "--password-from-env", new_username],
            env=environ,
            stdout=PIPE,
        )
        return True
    except Exception as err:
        print(f"FileScanError: {str(err)}")
        return False


def handle_delete_user(message):
    try:
        username = message["user"]["username"]
        run(args=["runuser", "--user", "www-data", "--", "php", "occ", "users:delete", username])
        return True
    except Exception as err:
        print(f"FileScanError: {str(err)}")
        return False


def callback(ch, method, properties, body):
    message = loads(body)

    try:
        if message["action"] == "Scan":
            handle_selector = {"All": handle_scan_filesystem}
        elif message["action"] == "User":
            handle_selector = {"Create": handle_create_user, "Delete": handle_delete_user}

        handler = handle_selector[message["type"]]

        if handler(message):
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as err:
        print(str(err))
        ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    queue = "fileserver"

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
