import { Component } from 'react';
import Plot from 'react-plotly.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { fetchTaxaminerScatterplot } from '../../../../../../../api';
import { trace } from 'console';

const colors = require("./colors.json")

interface Props {
	assembly_id: number
	dataset_id: number
	sendClick: any
	sendCameraData: any
	passScatterData: any
	e_value: any
	show_unassigned: boolean
	userID: number
	token: string
}

/**
 * Main Scatterplot Component
 */
class Scatter3D extends Component<Props, any> {
	constructor(props: any){
		super(props);
		this.state ={ 
			data: [] , // raw JSON data
			traces: [], // traces dicts for plotly
			selected_gene: "", // g_name
			aa_seq: "", // inherited
			ui_revision: "true", // bound to plot to preserve camera position
			auto_size: true, // automatically size dots in scatterplot
			auto_size_px: 5,
			marker_size: 0, // actual dot size in the plot
			manual_size: 5, // dot size selected by user
			color_palette: "rainbow", // currently selected color palette
			color_options: colors.options, // color palette options
			camera_ratios: {xy: 1.0, xz: 1.0, yz: 1.0},
			legendonly: [],
			last_click : "",
			figure: {data: [], layout: {}, frames: [], config: {}}
		}
        this.sendClick = this.sendClick.bind(this);
	}

	/**
	 * Call API on component mount to load plot data
	 */
	componentDidMount() {
		fetchTaxaminerScatterplot(this.props.assembly_id, this.props.dataset_id, this.props.userID, this.props.token)
		.then(data => {
			this.setState( {data: data} );
			this.set_auto_size(data);
			this.setState( { marker_size: this.state.auto_size_px}, () => {
				this.build_plot();
			})
		})
	}

	/**
	 * Reload plot if dataset has changed
	 * @param prev previous state
	 */
	componentDidUpdate(prev: any) {
		if (prev.dataset_id != this.props.dataset_id) {
			fetchTaxaminerScatterplot(this.props.assembly_id, this.props.dataset_id, this.props.userID, this.props.token)
			.then(data => {
			this.setState( {data: data} );
			this.set_auto_size(data);
			this.setState( { marker_size: this.state.auto_size_px}, () => {
				this.build_plot()
			})
		})}
		if (prev.dataset_id != this.props.dataset_id || prev.e_value != this.props.e_value || prev.show_unassigned != this.props.show_unassigned) {
			this.build_plot();
		}
	}

	/**
	 * Pass camera data to parent to update PCA Plot
	 * @param e event data
	 */
	passCameraData(e: any) {
		if(e['scene.camera'] == undefined) {
			return
		}
		if(e['scene.camera'].up){
			// coordinate ratios
			const my_camera = e['scene.camera'].eye
			const xy = Math.round(my_camera.x / my_camera.y * 100) / 100
			const xz = Math.round(my_camera.x / my_camera.z * 100) / 100
			const yz = Math.round(my_camera.y / my_camera.z * 100) / 100

			const new_ratios = {xy: xy, xz: xz, yz: yz}
			const old_ratios = this.state.camera_ratios

			// If ratios have changed
			if (new_ratios.xy !== old_ratios.xy || new_ratios.xz !== old_ratios.xz || new_ratios.yz !== old_ratios.yz) {
				this.props.sendCameraData(e['scene.camera'])
				this.setState({camera_ratios: new_ratios})
			}
		}
    }

	/**
	 * A dot in the plot was clicked => pass to parent
	 * @param e Plot OnClick() event
	 */
    sendClick(e: any){
		if (e.g_name != this.state.last_click) {
			console.log("Selection fired from scatterplot")
			this.setState({last_click: e.g_name})
			this.props.sendClick([e.g_name]);
		}
    }

	set_color_palette(key: string){
		this.setState({color_palette: key})
		this.props.passScatterData({ colors: key, legendonly: this.state.legendonly})
	}

	/**
	 * Fire if the size slider was changed
	 * @param size value of the slider
	 */
	set_manual_size(size: number) {
		if (this.state.auto_size === false) {
			this.setState( { marker_size: size }, () => {
				this.build_plot()
			} )
		}
		this.setState( { manual_size: size} )
	}

	/**
	 * Set automatic marker size
	 */
	set_auto_size(data: any){
		if (data == undefined) {
			data = this.state.data
		}
		let total_points = 0;
		// overall size of all trace arrays
		for (var trace of data) {
			total_points = total_points + trace.length
		}
		// this was chosen arbitrarily
		let new_size = 65 - Math.round(total_points / 10)
		// set a minimum size arbitrarily
		if (new_size < 3) {
			new_size = 3
		}
		this.setState( { auto_size_px: new_size } )
	}

	/**
	 * Toggle automatic sizing of plot markers
	 */
	toggle_auto_size(e: any){
		// toggle
		const now = e.nativeEvent.originalTarget.checked
		// update markers if automatic sizing was enabled
		if (now === true) {
			this.setState( { marker_size: this.state.auto_size_px, auto_size: now}, () => {
				console.log(this.state.marker_size)
				this.build_plot()
			})
		} else {
			this.setState( { marker_size: this.state.manual_size, auto_size: now}, () => {
				console.log(this.state.marker_size)
				this.build_plot()
			} )
		}
	}

	/**
	 * Track grouped de-/selection using the scatterplot legend
	 * This is tied to onRestyle to avoid desync with onClick() events
	 * @param e restyle event
	 */
	updateLegendSelection(e: any, ) {
		let visible: string[] = []

		var plot: any = document.getElementById('scatterplot')
		const legendonly = plot.data.filter((trace: any) => trace.visible === "legendonly")
		if (legendonly != this.state.legend_only) {
			this.setState({legendonly: legendonly})
			this.props.passScatterData({ colors: this.state.color_palette, legendonly: legendonly})
		}
		this.setState({ ui_revision: "false"})
	}

	/**
	 * Convert API data into plotly traces
	 * @param data API data
	 * @returns list of traces
	 */
	transformData (data: any[]) {

		// Avoid NoneType Exceptions
		if (data == null) {
			return []
		}

        const traces: any[] = []
        data.map(each => {
		    const x : string[] = [];
		    const y : string[] = [];
            const z : string[] = [];
            let label = "";
            const gene_names : string[] = [];
            let chunk = each;

			// push 3D coordinates in arrays accordingly
		    chunk.map((each: { [x: string]: string; }) => {

				// filter by e-value
				if(parseFloat(each['bh_evalue']) < this.props.e_value) {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					gene_names.push(each['g_name'])
				} 
				// Include unassigned data points (which usually don't have a e-value)
				else if(this.props.show_unassigned === true && each['plot_label'] === 'Unassigned') {
					x.push(each['Dim.1'])
					y.push(each['Dim.2'])
					z.push(each['Dim.3'])
					label = each['plot_label']
					gene_names.push(each['g_name'])
				} else {
					//console.log(each['g_name'])
				}
		    })

			// Setup the plot trace
            const trace = {
                type: 'scatter3d',
                mode: 'markers',
                x: x,
                y: y,
                z: z,
                name: label,
                text: label,
				marker: {
					size: this.state.marker_size
				},
				visible: true
            }
            traces.push(trace)
        })
		return traces
	}

	/**
	 * Build the 3D scatterplot
	 * @returns Plotly Plot as React component
	 */
	build_plot() {
		console.log("Rebuilding Scatterplot")

		// store figure components
		this.state.figure.data = this.transformData(this.state.data)
		this.state.figure.layout = {autosize: true, showlegend: true, uirevision: 1,
			// @ts-ignore
			// overrides are incomplete here, ignore for now
			legend: {itemsizing: 'constant'},
			colorway : colors.palettes[this.state.color_palette]
			}
		this.state.figure.config = {scrollZoom: true}
		this.state.figure.revision = this.state.figure.revision + 1
		console.log("finished")
	}

	/**
	 * Render react component
	 * @returns render react component
	 */
	render() {
		return (
			<div>
				<Plot
				data={this.state.figure.data}
				layout={this.state.figure.layout}
				config={this.state.figure.layout}
				onClick={(e: any) => this.sendClick(this.state.data[e.points[0].curveNumber][e.points[0].pointNumber])}
				onRelayout={(e: any) => this.passCameraData(e)}
				useResizeHandler = {true}
    			style = {{width: "100%", height: 800}}
				onRestyle={(e: any) => this.updateLegendSelection(e)}
				revision={1}
				onUpdate={(figure: any) => this.setState({figure: figure})}
				/>
				<Row>
                    <Col xs={1}>
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="custom-switch"
                                label="Auto-size"
								defaultChecked={true}
								onChange={(e: any) => this.toggle_auto_size(e)}
                            />
                        </Form>
                    </Col>
                    <Col xs={5}>
						<InputGroup>
							<Form.Label>Dot size</Form.Label>
							<Form.Range 
								min={1} 
								max={10}
								step={1}
								defaultValue={5}
								onChange={(e :any) => this.set_manual_size(e.target.value)}
								className="m-2"
							/>
						</InputGroup>
                    </Col>
					<Col>
						<Form.Label>Color Palette</Form.Label>
						<Select
						defaultInputValue='Rainbow'
						defaultValue={"rainbow"}
						options={this.state.color_options}
						onChange={(e: any) => this.set_color_palette(e.value)}
						/>
					</Col>
                </Row>
			</div>
		)
	}
}

export default Scatter3D;