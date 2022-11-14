import React from "react";
import { Button, InputGroup } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

interface State {
    analyses: any
    new_id: number
    show_import_modal: boolean
    show_remove: boolean
}

interface Props {
    dataset_changed: Function
    analyses: any[]
}

const default_analysis = [{id: -1, name: "Select a dataset to get started"}]

// Allows the user to select a dataset
class DataSetSelector extends React.Component<Props, State> {
    constructor(props: any){
        super(props)
        this.state = {  
            analyses: [{id: -1, name: "Select a dataset to get started"}],
            new_id: -1,
            show_import_modal: false,
            show_remove: false
        }
    }

    /**
     * Load Inital datasets
     */
    componentDidMount() {
        const extended = default_analysis.concat(this.props.analyses)
        this.setState({analyses: extended})
    }

    render() {
        return (
            <>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Dataset Selection</Card.Title>
                    <InputGroup>
                        <Form.Select 
                        onChange={(e: any) => this.setState({new_id: parseInt(e.target.value)})}
                        defaultValue={undefined}>
                        {this.state.analyses && this.state.analyses.map((e: any) => {
                            return <option key={e.id} value={e.id}>{e.name}</option>;
                        })}
                        </Form.Select>
                        <Button 
                        type="submit" 
                        onClick={(e:any) => this.props.dataset_changed(this.state.new_id)}
                        disabled={(this.state.new_id === -1)}
                        ><span className='bi bi-arrow-right-circle m-2'/>Load</Button>
                    </InputGroup>
                </Card.Body>
            </Card>
        </>
        );
    } 
}

export { DataSetSelector }