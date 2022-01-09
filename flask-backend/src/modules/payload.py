from typing import Literal, Union
from dataclasses import dataclass


@dataclass(frozen=True)
class Assembly:
    name: str
    id: int


@dataclass(frozen=True)
class Annotation:
    name: str
    id: int


@dataclass(frozen=True)
class Mapping:
    name: str
    id: int


@dataclass(frozen=True)
class User:
    username: str
    password: str


@dataclass(frozen=True)
class Data:
    taxon: dict
    assembly: dict
    userID: int
    annotations: list
    mappings: list
    buscos: list
    fcats: list
    milts: list
    repeatmaskers: list
    append_assembly_id: int


Action = Union[Literal["Added"], Literal["Removed"]]

# JBROWSE PAYLOADS


@dataclass(frozen=True)
class AssemblyPayload:
    assembly: Assembly
    storage_path: str
    action: Action
    type: Literal["Assembly"] = "Assembly"


@dataclass(frozen=True)
class AnnotationPayload:
    annotation: Annotation
    assembly: Assembly
    storage_path: str
    action: Action
    type: Literal["Annotation"] = "Annotation"


@dataclass(frozen=True)
class MappingPayload:
    mapping: Mapping
    assembly: Assembly
    storage_path: str
    action: Action
    type: Literal["Mapping"] = "Mapping"


Payload = Union[AssemblyPayload, AnnotationPayload, MappingPayload]

# FILESERVER PAYLOADS


@dataclass(frozen=True)
class FileserverPayload:
    action: Action
    type: Literal["All"] = "All"


@dataclass(frozen=True)
class UserPayload:
    user: User
    action: Action
    type: Union[Literal["Create"], Literal["Delete"]]


# WORKER PAYLOADS


@dataclass(frozen=True)
class WorkerPayload:
    action: Literal["Update"]
    type: Literal["LocalTaxonTree"]
    data: Data
    taskID: str
