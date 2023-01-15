import React, { createContext } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/esm/Container';

// Stylesheet
import 'bootstrap/dist/css/bootstrap.min.css';
import SelectionModeSelector from './Components/SelectionModeSelector';
import SelectionTable from './Components/SelectionTable';
import ColumnSelector from './Components/ColumnSelector'
import { fetchTaxaminerMain } from '../../../../../../../api';

import fields_glossary from "./Components/field_options.json"


interface Props {
    data: []
    keys: Set<string>
    setSelectMode: any
    passClick: any
    dataset_id: number
    userID: number
    token: string
    assemblyID: number
    row: any
    customFields: any[]
}
  
interface State {
    aa_seq: string
    camera: any
    select_mode: string
    selected_data: Set<string>
    data: any
    col_keys: any[]
    options: any[]
}
  

class TableView extends React.Component<Props, State> {
    // Set up states for loading data
	constructor(props: any){
		super(props);
		this.state ={ 
            // selected_row: {g_name: "Pick a gene", taxonomic_assignment: "Pick a gene", plot_label: "Pick a gene", best_hit: "Pick a gene", c_name: "Pick a gene", bh_evalue: 0, best_hitID: "None"}, 
            aa_seq: "Pick a gene",
            camera: null,
            select_mode: 'neutral',
            selected_data: new Set(),
            data: undefined,
            col_keys: [{ label: "ID", value: "g_name"}, { label: "Plot label", value: "plot_label" }, { label: "e-value", value: "bh_evalue" }],
            options: [{ label: "ID", value: "g_name"}, { label: "Plot label", value: "plot_label" }, { label: "e-value", value: "bh_evalue" }]
        }
	}

    /**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		fetchTaxaminerMain(1, 1, this.props.userID, this.props.token)
        .then((data) => {
            this.setState( {data: data})
        })
	}

    /**
     * Component did update
     * @param prevProps previous Props
     * @param prevState previous State
     * @param snapshot previous snapshot
     */
     componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.row != this.props.row) {
            this.convertFieldsOptions()
        }
    }

     /**
     * Update table columns
     * @param cols array of col names (keys)
     */
      setTableCols = (cols: any[]) => {
        for (const col of cols) {
            if (col.value == "g_name") {
                return this.setState({col_keys: cols})
            }
        }
        // always preserve g_name as it is the main identifier
        cols.unshift({ label: "ID", value: "g_name"})
        return this.setState({col_keys: cols})
    }

    /**
     * Convert available fields into table colmunns
     */
     convertFieldsOptions() {
        let options: { label: string; value: string; }[] = []
        // available row features
        const row_keys = Object.keys(this.props.row)
        options = row_keys.map((each: string) => {
            // match against glossary
            for (const field of fields_glossary) {
                // exact match
                if (each === field.value) {
                    return { label: (field.label), value: each }
                } else {
                    // match with suffix (c_cov_...)
                    const re = new RegExp(field.value + ".*");
                    if (re.test(each)) {
                        return { label: (field.label + " (" + each + ")"), value: each }
                    }
                }
            }
            return { label: each, value: each }
        })
        this.setState({options: options})
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col xs={7}>
                        <SelectionTable
                        master_data={this.props.data}
                        keys={this.props.keys}
                        // pass table click events up
                        passClick={this.props.passClick}
                        col_keys = {this.state.col_keys}
                        />
                    </Col>
                    <Col>
                        <Row>
                            
                        </Row>
                        <Row>
                            <SelectionModeSelector
                            passMode={this.props.setSelectMode}
                            selection={this.props.keys}
                            analysisID={this.props.dataset_id}
                            assemblyID={this.props.assemblyID}
                            userID={this.props.userID}
                            token={this.props.token}
                            />
                        </Row>
                        <Row>
                            <ColumnSelector
                            passCols = {this.setTableCols}
                            options={this.state.options}
                            customFields={this.props.customFields}
                            />
                        </Row>
                    </Col>
                </Row>
        </Container>
        );
    } 
}

export { TableView }