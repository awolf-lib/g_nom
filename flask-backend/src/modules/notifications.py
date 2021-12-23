from dataclasses import asdict
import pika
from os import getenv
from json import dumps
from .payload import Annotation, AnnotationPayload, Assembly, AssemblyPayload, MappingPayload, Payload

RABBIT_MQ_QUEUE_RESOURCE = "resource"


def createNotification(label="Error", message="Something went wrong", type="error"):
    """
    Creates a new notifications. Types: 'error', 'warning', 'info'
    """
    return (
        {
            "label": str(label),
            "message": str(message),
            "type": str(type),
        },
    )


def __notify(payload: Payload, route: str = RABBIT_MQ_QUEUE_RESOURCE):
    pika_connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=getenv("RABBIT_CONTAINER_NAME"), port=5672)
    )
    pika_channel = pika_connection.channel()
    pika_channel.queue_declare(queue=route, durable=True)
    pika_channel.basic_publish(exchange="", routing_key=route, body=dumps(asdict(payload)))
    pika_connection.close()


def notify_assembly(assemblyId: int, name: str, path: str, action: str):
    payload = AssemblyPayload(Assembly(name, assemblyId), path, action)
    __notify(payload)


def notify_annotation(
    assemblyId: int, assemblyName: str, annotationId: int, annotationName: str, path: str, action: str
):
    payload = AnnotationPayload(
        Annotation(annotationName, annotationId), Assembly(assemblyName, assemblyId), path, action
    )
    __notify(payload)
