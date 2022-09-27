import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/esm/Container';
import { Tabs, Tab } from "react-bootstrap";
import { DataSetSelector } from './sidebar/DataSet/dataset_selector';
import SelectionView from './sidebar/selection/selection';
import { DataSetMeta } from './sidebar/DataSet/dataset_metadata';
import Scatter3D from './scatterplot3d/scatter3d';
import PCAPlot from './sidebar/PCAPlot/PCAPlot';
import { FilterUI } from './sidebar/Filters/filterui';
import Table from './sidebar/DiamondTable/diamondtable';
import { TableView } from './tableview/TableView';
import ScatterMatrix from './sidebar/ScatterMatrix/ScatterMatrix';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchTaxaminerMain, fetchTaxaminerSeq } from '../../../../../../api';

  
interface State {
    dataset_id: number
    selected_row: any
    aa_seq: string
    camera: any
    select_mode: string
    selected_data: Set<string>
    data: any
    e_value: any
    filters: any
    scatter_data: any
    legend_only: string[]
    userID: number
    token: string
    fields: string[]
}

interface Props {
    assembly_id: number
}

class TaxaminerDashboard extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);

        //fetch session
        const userID = JSON.parse(sessionStorage.getItem("userID") || "");
        const token = JSON.parse(sessionStorage.getItem("token") || "");

		this.state ={
            dataset_id: 1,
            selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
            select_mode: 'neutral',
            selected_data: new Set(),
            data: undefined,
            scatter_data: { colors: "rainbow", legendonly: []},
            e_value: 1.0,
            filters: {e_value: 1.0, show_unassinged: true},
            legend_only: [],
            userID: userID,
            token: token,
            fields: []
        }

        // Bind functions passing data from child objects to local context
        this.setDataset = this.setDataset.bind(this);
        this.handleDataClick = this.handleDataClick.bind(this);
	}

    /**
     * Update dataset ID and reload data
     * @param id dataset ID
     */
    setDataset(id: number) {
        this.setState( {dataset_id: id} );
        fetchTaxaminerMain(this.props.assembly_id, 0, this.state.userID, this.state.token)
        .then((data: any) =>{
            this.setState( {data: data})
            const proto_row = data[Object.keys(data)[0]]
            this.setState( { fields: Object.keys(proto_row) }) 
        })
    }

    /**
	 * Call API on component mount to main table data
	 */
	componentDidMount() {
		fetchTaxaminerMain(this.props.assembly_id, 1, this.state.userID, this.state.token)
        .then((data: any) =>{
            this.setState( {data: data})
            const proto_row = data[Object.keys(data)[0]]
            console.log(proto_row)
            this.setState( { fields: Object.keys(proto_row) })
        })
	}

    /**
     * Call this everytime a click event referring to a datapoint's key in the primary table occurs
     * @param newRow new data row
     * @param new_seq 
     */
    handleDataClick(keys: string[]) {
        this.setState({selected_row: this.state.data[keys[0]]});

        if(this.state.select_mode === 'add') {
            keys.forEach(key => this.state.selected_data.add(key))
            // this.state.selected_data.concat(key)
        } else if(this.state.select_mode === 'remove') {
            keys.forEach(key => this.state.selected_data.delete(key))
            //this.state.selected_data.delete(key)
        }

        fetchTaxaminerSeq(1, 1, keys[0], this.state.userID, this.state.token)
        .then((data) => {
            this.setState({aa_seq: data as unknown as string})
        })
    }  

    /**
     * Pass the camera position from the main scatterplot
     * @param childData camera data (Plotly)
     */
    callbackFunction = (childData: any) => {
        this.setState({camera: childData})
    }
    
    /**
     * Set the current selection mode globally
     * @param new_mode 'add','remove' odr 'neutral'
     */
    setSelectMode = (new_mode: string) =>  {
        this.setState({select_mode: new_mode})
    }

    /**
     * Set filter values
     * @param values values passed from FilterUI components
     */
    setFilters = (values: any) => {
        this.setState({filters: values})
    }

    /**
     * Uses the scatter data from the main plot to slave the scatter matrix
     * @param values 
     */
    shareScatterData = (values: any) => {
        this.setState({scatter_data: values})
    }

    render() {
        return (
            <Container fluid>
                <Row>
                <Col xs={7}>
                    <Scatter3D
                    dataset_id={this.state.dataset_id}
                    assembly_id={this.props.assembly_id}
                    sendClick={this.handleDataClick}
                    sendCameraData={this.callbackFunction}
                    e_value={this.state.filters.e_value}
                    show_unassigned={this.state.filters.show_unassinged}
                    passScatterData={this.shareScatterData}
                    userID={this.state.userID}
                    token={this.state.token}/>
                </Col>
                <Col>
                     <Tabs>
                        <Tab eventKey="Overview" title="Overview">
                            <DataSetMeta dataset_id={this.state.dataset_id}/>
                            <SelectionView 
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}
                            fields={this.state.fields}/>
                        </Tab>
                        <Tab eventKey="Filter" title="Filters">
                            <FilterUI
                            sendValuesUp={this.setFilters}/>
                        </Tab>
                        <Tab eventKey="diamond" title="Diamond Output">
                            <Row>
                                <Col>
                                <Table
                                dataset_id={this.state.dataset_id}
                                row={this.state.selected_row}
                                userID={this.state.userID}
                                token={this.state.token}
                                />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="scatter_matrix" title="Scatter Matrix">
                            <ScatterMatrix
                                sendClick={this.handleDataClick}
                                e_value={this.state.filters.e_value}
                                show_unassigned={this.state.filters.show_unassinged}
                                scatter_data = {this.state.scatter_data}
                                userID={this.state.userID}
                                token={this.state.token}
                                />
                        </Tab>
                        <Tab eventKey="PCA" title="PCA">
                            <Row>
                                <Col>
                                <PCAPlot
                                    camera = {this.state.camera}
                                    dataset_id = {this.state.dataset_id}
                                    userID={this.state.userID}
                                    token={this.state.token}/>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Col>
                </Row>
                <TableView
                data={this.state.data}
                keys={this.state.selected_data}
                setSelectMode={this.setSelectMode}
                passClick={this.handleDataClick}
                dataset_id={this.state.dataset_id}
                userID={this.state.userID}
                token={this.state.token}
                assemblyID={this.props.assembly_id}
                />
        </Container>
        );
    } 
}

export { TaxaminerDashboard }