import React from "react";
import Card from 'react-bootstrap/Card';
import { Accordion } from "react-bootstrap";

import "./style.css";
import { fetchTaxaminerMetadata } from "../../../../../../../../api";

interface Props {
    dataset_id: number
    userID: number
    token: string
    assemblyID: number
    metadata: any
}

interface State {
    metadata: any
}

/**
 * Properly format text from \n newlines
 * @param text Unformatted string
 * @returns list of <p></p> to insert into html
 */
function NewlineText(text: string | void) {
    if (text) {
        return text.split('\n').map((str: any) => <p>{str}</p>);
    } else {
        return "No data"
    }
}

class DataSetMeta extends React.Component<Props, State> {
    constructor(props: any){
		super(props);
		this.state ={
            metadata: "Loading..."
        }
	}

    /**
     * Format the metadata
     */
    convertMetadata() {
        let data_string = ""
        data_string += "Added: " + this.props.metadata.addedOn + "\n"
        data_string += "ID: " + this.props.metadata.name + "\n"
        data_string += "Added by: " + this.props.metadata.username + "\n"
        this.setState({metadata: data_string})
    }

    /**
     * Init
     */
    componentDidMount() {
        this.convertMetadata()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.metadata != this.props.metadata) {
            this.convertMetadata()
        }
    }

    render() {
        return (
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Info</Card.Title>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Metadata</Accordion.Header>
                            <Accordion.Body>
                                <code>{this.state.metadata}</code>
                            </Accordion.Body>
                        </Accordion.Item> 
                    </Accordion>
                </Card.Body>
            </Card>
        );
    } 
}

export { DataSetMeta }