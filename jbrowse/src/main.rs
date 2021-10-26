use amiquip::{Connection, ConsumerMessage, ConsumerOptions, QueueDeclareOptions, Result};
use std::process::{Command, ExitStatus};

mod message;

const STORAGE_ROOT: &str = "/";
const JBROWSE_PATH: &str = "/usr/local/apache2/htdocs";

fn handle_new_assembly(message: &message::AssemblyMessage) -> Result<ExitStatus, std::io::Error>{
    let storage_fasta = format!("{}{}", STORAGE_ROOT, &message.storage_path);
    let jbrowse_assembly_path = format!("{}/assemblies/{}", &JBROWSE_PATH, &message.assembly.name);

    let samtolls = Command::new("samtools")
        .arg("faidx")
        .arg(&storage_fasta)
        .status();

    let mkdir = Command::new("mkdir")
        .arg("-p")
        .arg(&jbrowse_assembly_path).status();

    let jbrowse = Command::new("jbrowse")
        .current_dir(&jbrowse_assembly_path)
        .arg("add-assembly")
        .arg(&storage_fasta)
        .arg("--load")
        .arg("symlink")
        .arg("--name")
        .arg(&message.assembly.name)
        .arg("--target")
        .arg(format!("{}/assemblies/{}", &JBROWSE_PATH, &message.assembly.name))
        .status();

    samtolls.and(mkdir).and(jbrowse)
}

fn main() -> Result<()> {
    let rabbit_host = "amqp://guest:guest@gnom_rabbit:5672";
    let mut connection = Connection::insecure_open(&rabbit_host).expect("RabbitMQ Connection not established");
    let channel = connection.open_channel(None).expect("RabbitMQ cannot access channel");
    let queue = channel.queue_declare("resource", QueueDeclareOptions{
        durable: true,
        ..Default::default()
    }).expect("Cannot declare \"assembly\" queue.");
    let consumer = queue.consume(ConsumerOptions::default()).expect("Cannot consume queue...");
    println!("Listening to NewAssembly Messages... interrupt with Ctrl + C");
    for message in consumer.receiver().iter() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                if let Ok(message) = serde_json::from_slice::<message::ResourceMessage>(&delivery.body) {
                    println!("{:?}", message);
                    let output = match &message {
                        message::ResourceMessage::Assembly(a) => handle_new_assembly(a),
                        message::ResourceMessage::Mapping(_m) => Err(std::io::Error::new(std::io::ErrorKind::Other, "Mapping not handled yet...")),
                        message::ResourceMessage::Annotation(_a) => Err(std::io::Error::new(std::io::ErrorKind::Other, "Annotation not handled yet...")),
                    };
                    match output {
                        Ok(_) => {
                            consumer.ack(delivery).expect("Couldn't acknowledge.");
                        },
                        Err(error) => {
                            println!("Rejected: {:?}", error);
                            consumer.reject(delivery, false).expect("Couldn't reject.");    
                        },
                    }
                } else {
                    println!("Received none-NewAssembly message");
                    consumer.reject(delivery, false).expect("Couldn't reject.");
                }
            },
            other => {
                println!("{:?}", other);
                break;
            }
        }
    }

    connection.close()
}