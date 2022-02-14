from dataclasses import asdict
import pika
from os import getenv
from json import dumps
from subprocess import run
from modules.payload import (
    Annotation,
    AnnotationPayload,
    Assembly,
    AssemblyPayload,
    FileserverPayload,
    Mapping,
    MappingPayload,
    Payload,
    User,
    UserPayload,
    WorkerPayload,
)
from .notifications import createNotification
from .tasks import updateTask


RABBIT_MQ_QUEUE_RESOURCE = "resource"
RABBIT_MQ_QUEUE_FILESERVER = "fileserver"
RABBIT_MQ_QUEUE_WORKER = "worker"


def __notify(payload: Payload, route: str = RABBIT_MQ_QUEUE_RESOURCE, taskID=""):
    pika_connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=getenv("RABBIT_CONTAINER_NAME"), port=5672, heartbeat=30)
    )

    pika_channel = pika_connection.channel()
    if pika_channel.is_closed:
        print(f"{route} queue channel closed!")
        if taskID:
            updateTask(taskID, "aborted")
        return 0, createNotification(message=f"{route} queue channel closed!")

    pika_channel.queue_declare(queue=route, durable=True)
    status_check, notification = __check_consumer_count(pika_channel, route)
    if not status_check and taskID:
        updateTask(taskID, "aborted")
        return 0, notification

    pika_channel.basic_publish(exchange="", routing_key=route, body=dumps(asdict(payload)))
    pika_connection.close()

    return 1, []


def notify_assembly(assemblyId: int, name: str, path: str, action: str):
    payload = AssemblyPayload(Assembly(name, assemblyId), path, action)
    __notify(payload)


def notify_annotation(
    assemblyId: int,
    assemblyName: str,
    annotationId: int,
    annotationName: str,
    path: str,
    action: str,
):
    payload = AnnotationPayload(
        Annotation(annotationName, annotationId),
        Assembly(assemblyName, assemblyId),
        path,
        action,
    )
    __notify(payload)


def notify_mapping(
    assemblyId: int,
    assemblyName: str,
    mappingId: int,
    mappingName: str,
    path: str,
    action: str,
):
    payload = MappingPayload(
        Mapping(mappingName, mappingId),
        Assembly(assemblyName, assemblyId),
        path,
        action,
    )
    __notify(payload)


def notify_fileserver(action: str, type: str = "All"):
    payload = FileserverPayload(action, type)
    __notify(payload, RABBIT_MQ_QUEUE_FILESERVER)


def notify_fileserver_user(username: str, password: str, action: str, type: str):
    payload = UserPayload(User(username, password), action, type)
    __notify(payload, RABBIT_MQ_QUEUE_FILESERVER)


def notify_worker(action: str, type: str, data: dict = {}, taskID: str = ""):
    payload = WorkerPayload(action, type, data, taskID)
    __notify(payload, RABBIT_MQ_QUEUE_WORKER, taskID)


def __check_consumer_count(channel, route):
    try:
        queue_state = channel.queue_declare(queue=route, durable=True, passive=True)
        updated_queue_state = None
        if queue_state:
            if queue_state.method:
                if int(queue_state.method.consumer_count) or int(queue_state.method.consumer_count) == 0:
                    consumer_count = int(queue_state.method.consumer_count)
                    if route == "worker":
                        if consumer_count < int(getenv("RABBIT_WORKER_COUNT")):
                            while consumer_count < int(getenv("RABBIT_WORKER_COUNT")):
                                run(
                                    "python3 worker.py &",
                                    shell=True,
                                    cwd="/flask-backend/src",
                                )
                                consumer_count += 1
                        elif consumer_count == int(getenv("RABBIT_WORKER_COUNT")):
                            return 1, []
                    else:
                        if consumer_count == 0:
                            return 0, createNotification(
                                message=f"No consumers for route {route}. Restart docker containers and check for errors!"
                            )

                    updated_queue_state = channel.queue_declare(queue=route, durable=True, passive=True)

        if updated_queue_state:
            if updated_queue_state.method:
                if int(updated_queue_state.method.consumer_count):
                    return 1, []

        return 0, createNotification(
            message=f"No consumers for route {route}. Restart docker containers and check for errors!"
        )

    except Exception as err:
        return 0, createNotification(message=f"CheckConsumersError: {str(err)}")
