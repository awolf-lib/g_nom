from typing import Literal, Union
from dataclasses import dataclass

@dataclass(frozen=True)
class Assembly:
    name: str
    id: int

Action = Union[Literal['Added'], Literal['Removed']]

@dataclass(frozen=True)
class AssemblyPayload:
    assembly: Assembly
    storage_path: str
    action: Action
    type: Literal['Assembly'] = 'Assembly'

@dataclass(frozen=True)
class AnnotationPayload:
    annotation_name: str
    assembly: Assembly
    storage_path: str
    action: Action
    type: Literal['Annotation'] = 'Annotation'

@dataclass(frozen=True)
class MappingPayload:
    mapping_name: str
    assembly: Assembly
    storage_path: str
    action: Action
    type: Literal['Mapping'] = 'Mapping'

Payload = Union[AssemblyPayload, AnnotationPayload, MappingPayload]
