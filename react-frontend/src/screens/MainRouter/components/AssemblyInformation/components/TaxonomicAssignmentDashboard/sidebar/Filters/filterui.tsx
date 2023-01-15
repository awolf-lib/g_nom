import React from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

interface Props {
    sendValuesUp: any
    g_options: { label: string; value: string; }[]
}

interface State {
    e_value: number
    show_unassigned: boolean
    g_searched: string[]
}

// Filter Tab
class FilterUI extends React.Component<Props, State> {
    constructor(props: Props){
		super(props);
		this.state ={
            e_value: 1.0,
            show_unassigned: true,
            g_searched: []

        }
	}  

    /**
     * Calculate the e-value from slider input and send it's value up
     * @param slider_value Value of UI slider
     */
    setEValue(slider_value: any): void {
        console.log(this.state)
        const new_value = Math.E ** (-slider_value)
        this.setState({e_value: new_value})

        // pass values up
        const values = {'show_unassinged': this.state.show_unassigned, 'e_value': new_value, 'g_searched': this.state.g_searched}
        this.props.sendValuesUp(values)
    }

    /**
     * Pass searched IDs up
     * @param e Edit event of the dropdown selector
     */
    passSearch(e: any): void {
        const new_keys: string[] = []
        // extract IDs
        e.forEach((element: any) => {
          new_keys.push(element.value)
        });
        this.setState({g_searched: new_keys}, () => {
            const values = {'show_unassinged': this.state.show_unassigned, 'e_value': this.state.e_value, 'g_searched': this.state.g_searched}
            this.props.sendValuesUp(values)
        })
      }


    render() {
        return (
            <>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Search genes</Card.Title>
                    <Select 
                    options={this.props.g_options} 
                    components={animatedComponents} 
                    isMulti defaultValue={[]}
                    onChange={(e: any) => this.passSearch(e)}/>
                </Card.Body>
            </Card>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Filter</Card.Title>
                    <Form.Label>e-value {"<"} {this.state.e_value}</Form.Label>
                    <Form.Range 
                        min={0}
                        max={300}
                        step={1}
                        defaultValue={0}
                        onChange={(e :any) => this.setEValue(e.target.value)}/>
                    <Form.Label>Contig Filter</Form.Label>
                    <Form.Select>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                </Card.Body>
            </Card>
            </>
        );
    } 
}

export { FilterUI }