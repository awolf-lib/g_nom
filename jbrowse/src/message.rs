use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub struct Assembly{
    pub name: String,
    pub id: i32
}

#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub enum Action{
    Added,
    Removed
}

/// Signals there is a new fasta-like file
#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub struct AssemblyMessage{
    pub assembly: Assembly,
    pub storage_path: String,
    pub action: Action,
}

/// Signals there is a new bam file
#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub struct MappingMessage{
    pub assembly: Assembly,
    pub mapping_name: String,
    pub storage_path: String,
    pub action: Action,
}

/// Sginals there is a new gff3 file
#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub struct AnnotationMessage{
    pub assembly: Assembly,
    pub annotation_name: String,
    pub storage_path: String,
    pub action: Action,
}

/// Represents a message recording a resource
#[derive(Deserialize, Serialize, Debug, PartialEq)]
#[serde(tag="type")]
pub enum ResourceMessage{
    Assembly(AssemblyMessage),
    Mapping(MappingMessage),
    Annotation(AnnotationMessage),
}


#[test]
fn test_message(){
    let json = r#"{
        "assembly": {
            "name": "TestName",
            "id": 15125
        },
        "storage_path": "path_to_file.fasta",
        "action": "Added",
        "type": "Assembly"
    }"#;
    let result = serde_json::from_str::<ResourceMessage>(json);
    assert_eq!(result.is_ok(), true);
    assert_eq!(result.unwrap(), ResourceMessage::Assembly(AssemblyMessage{
        assembly:Assembly{name:"TestName".into(),id:15125},
        storage_path: "Waaah".into(),
        action: Action::Added
    }));
}