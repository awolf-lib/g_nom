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
import { fetchTaxaminerMain, fetchTaxaminerScatterplot, fetchTaxaminerSeq } from '../../../../../../api';

  
interface State {
    analysis: any
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
    g_options: { label: string; value: string; }[]
    scatter_points: any
    is_loading: boolean
}

interface Props {
    assembly_id: number
    analyses: any[]
}

class TaxaminerDashboard extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);

        //fetch session
        const userID = JSON.parse(sessionStorage.getItem("userID") || "");
        const token = JSON.parse(sessionStorage.getItem("token") || "");

		this.state ={
            analysis: {},
            dataset_id: 1,
            selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
            select_mode: 'neutral',
            selected_data: new Set(),
            data: {},
            scatter_data: { colors: "rainbow", legendonly: []},
            e_value: 1.0,
            filters: {e_value: 1.0, show_unassinged: true, g_searched: []},
            legend_only: [],
            userID: userID,
            token: token,
            fields: [],
            g_options: [],
            scatter_points: [],
            is_loading: false
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
        this.setState({is_loading: true})
        this.setState({dataset_id: id}, () => {
            fetchTaxaminerScatterplot(this.props.assembly_id, id, this.state.userID, this.state.token)
		    .then(data => {
                const main_data = {}
			    this.setState( {scatter_points: data}, () => {
                    for (const chunk of this.state.scatter_points) {
                        for (const row of chunk) {
                            const key = row.g_name as string
                            // @ts-ignore
                            main_data[key] = row
                        }
                    }
                    this.setState({data: main_data})

                    // Infer fields from first row
                    if (main_data) {
                        // @ts-ignore
                        const proto_row = main_data[Object.keys(main_data)[0]]
                        this.setState( { fields: Object.keys(proto_row) })
                    }

                    const gene_options: { label: string; value: string; }[] = []
                    Object.keys(main_data).map((item: string) => (
                        gene_options.push( { "label": item, "value": item } )
                    ))
                    this.setState({g_options: gene_options})
                });
		    })
            .finally(() => {
                console.log("Finished loading")
                this.setState({is_loading: false})
            })
        })
    }

    /**
	 * Call API on component mount to main table data
	 */
	componentDidMount() {
        // this.setState({analysis: this.props.analyses[0]})
        // const my_id = this.props.analyses[0].analysisID
        // this.setDataset(my_id)
	}

    /**
     * Call this everytime a click event referring to a datapoint's key in the primary table occurs
     * @param newRow new data row
     * @param new_seq 
     */
    handleDataClick(keys: string[]) {
        // Only update if a new selection occured
        if (keys.length != 0) {
            const next_row = this.state.data[keys[0]]
            if (next_row != undefined) {
                this.setState({selected_row: this.state.data[keys[0]]});
            } else {
                return
            }
            
            // manage selection
            if(this.state.select_mode === 'add') {
                keys.forEach(key => this.state.selected_data.add(key))
            } else if(this.state.select_mode === 'remove') {
                keys.forEach(key => this.state.selected_data.delete(key))
            }

            fetchTaxaminerSeq(this.props.assembly_id, this.state.dataset_id, keys[0], this.state.userID, this.state.token)
            .then((data) => {
                this.setState({aa_seq: data as unknown as string})
            })
        }
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
                    token={this.state.token}
                    g_searched={this.state.filters.g_searched}
                    scatter_data={this.state.scatter_points}/>
                </Col>
                <Col>
                     <Tabs>
                        <Tab eventKey="Overview" title="Overview">
                            <DataSetSelector
                            dataset_changed={this.setDataset}
                            analyses={this.props.analyses}
                            />
                            <DataSetMeta
                            assemblyID={this.props.assembly_id}
                            dataset_id={this.state.dataset_id}
                            userID={this.state.userID}
                            token={this.state.token}
                            metadata={this.state.analysis}/>
                            <SelectionView
                            is_loading={this.state.is_loading}
                            row={this.state.selected_row}
                            aa_seq={this.state.aa_seq}
                            fields={this.state.fields}
                            assemblyID={this.props.assembly_id}
                            analysisID={this.state.dataset_id}
                            userID={this.state.userID}
                            token={this.state.token}/>
                        </Tab>
                        <Tab eventKey="Filter" title="Filters">
                            <FilterUI
                            g_options={this.state.g_options}
                            sendValuesUp={this.setFilters}/>
                        </Tab>
                        <Tab eventKey="diamond" title="Diamond Output">
                            <Row>
                                <Col>
                                <Table
                                dataset_id={this.state.dataset_id}
                                assembly_id={this.props.assembly_id}
                                row={this.state.selected_row}
                                userID={this.state.userID}
                                token={this.state.token}
                                />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="scatter_matrix" title="Scatter Matrix">
                            <ScatterMatrix
                                assemblyID={this.props.assembly_id}
                                datasetID={this.state.dataset_id}
                                sendClick={this.handleDataClick}
                                e_value={this.state.filters.e_value}
                                show_unassigned={this.state.filters.show_unassinged}
                                scatter_data = {this.state.scatter_data}
                                userID={this.state.userID}
                                token={this.state.token}
                                scatter_points={this.state.scatter_points}
                                />
                        </Tab>
                        <Tab eventKey="PCA" title="PCA">
                            <Row>
                                <Col>
                                <PCAPlot
                                    camera = {this.state.camera}
                                    dataset_id = {this.state.dataset_id}
                                    assemblyID={this.props.assembly_id}
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
                row={this.state.selected_row}
                />
        <br/>
        <br/>
        </Container>
        );
    } 
}

export { TaxaminerDashboard }