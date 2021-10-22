use amiquip::{Connection, ConsumerMessage, ConsumerOptions, QueueDeclareOptions, Result};
use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Deserialize, Serialize, Debug)]
struct Assembly{
    name: String,
    id: String
}

#[derive(Deserialize, Serialize, Debug)]
struct NewAssemblyMessage{
    assembly: Assembly,
    storage_path: String
}

const STORAGE_ROOT: &str = "/";
const JBROWSE_PATH: &str = "/usr/local/apache2/htdocs";

fn handle_new_assembly(message: &NewAssemblyMessage){
    let storage_fasta = format!("{}{}", STORAGE_ROOT, &message.storage_path);

    Command::new("samtools")
        .arg("faidx")
        .arg(&storage_fasta)
        .status().expect("Couldn't execute samtools on {}");

    Command::new("jbrowse")
        .arg("add-assembly")
        .arg(&storage_fasta)
        .arg("--load")
        .arg("symlink")
        .arg("--name")
        .arg(&message.assembly.name)
        .arg("--target")
        .arg(&JBROWSE_PATH)
        .status()
        .expect("Couldn't add-assembly");
}

fn main() -> Result<()> {
    let mut connection = Connection::insecure_open("amqp://guest:guest@127.0.0.1:5672").expect("RabbitMQ Connection not established");
    let channel = connection.open_channel(None).expect("RabbitMQ cannot access channel");
    let queue = channel.queue_declare("assembly", QueueDeclareOptions{
        durable: true,
        ..Default::default()
    }).expect("Cannot declare \"assembly\" queue.");
    let consumer = queue.consume(ConsumerOptions::default()).expect("Cannot consume queue...");
    println!("Listening to NewAssembly Messages... interrupt with Ctrl + C");
    for message in consumer.receiver().iter() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                if let Ok(message) = serde_json::from_slice::<NewAssemblyMessage>(&delivery.body) {
                    println!("{:?}", message);

                    handle_new_assembly(&message);

                    consumer.ack(delivery).expect("Couldn't acknowledge.");
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