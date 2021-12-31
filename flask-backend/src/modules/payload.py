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


Action = Union[Literal["Added"], Literal["Removed"]]


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


@dataclass(frozen=True)
class FileserverPayload:
    action: Action
    type: Literal["All"] = "All"


@dataclass(frozen=True)
class UserPayload:
    user: User
    action: Action
    type: Union[Literal["Create"], Literal["Delete"]]


Payload = Union[AssemblyPayload, AnnotationPayload, MappingPayload]
