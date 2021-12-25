import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import propTypes from "prop-types";
import Button from "../../../../../../components/Button";
import { Download } from "grommet-icons";

const AnnotationCompletenessViewer = ({ busco, fcat, assemblyName }) => {
  const [buscoData, setBuscoData] = useState([]);
  const [buscoLayout, setBuscoLayout] = useState({});
  const [fcatData, setFcatData] = useState([]);
  const [fcatLayout, setFcatLayout] = useState({});
  const [fcatMode, setFcatMode] = useState(1);

  useEffect(() => {
    getBuscoData();
    getBuscoLayout();
    getFcatData();
    getFcatLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBuscoData = () => {
    let tracks = [];
    let complete = [];
    let complete_absolute = [];
    let duplicated = [];
    let duplicated_absolute = [];
    let fragmented = [];
    let fragmented_absolute = [];
    let missing = [];
    let missing_absolute = [];
    let names = [];
    busco.length > 0 &&
      busco.forEach((analysis) => {
        let total =
          analysis.completeSingle +
          analysis.completeDuplicated +
          analysis.fragmented +
          analysis.missing;
        names.push(analysis.name);
        complete.push((analysis.completeSingle * 100) / total);
        complete_absolute.push(analysis.completeSingle + "/" + total);
        duplicated.push((analysis.completeDuplicated * 100) / total);
        duplicated_absolute.push(analysis.completeDuplicated + "/" + total);
        fragmented.push((analysis.fragmented * 100) / total);
        fragmented_absolute.push(analysis.fragmented + "/" + total);
        missing.push((analysis.missing * 100) / total);
        missing_absolute.push(analysis.missing + "/" + total);
      });

    tracks.push({
      x: complete,
      y: names,
      name: "complete (S)",
      text: complete.map((val) => {
        return "C (S): " + Number(val).toFixed(2);
      }),
      customdata: complete_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#5D8233",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: duplicated,
      y: names,
      name: "complete (D)",
      text: duplicated.map((val) => {
        return "C (D): " + Number(val).toFixed(2);
      }),
      customdata: duplicated_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#BECA5C",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: fragmented,
      y: names,
      name: "fragmented",
      text: fragmented.map((val) => {
        return "F: " + Number(val).toFixed(2);
      }),
      customdata: fragmented,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#ECD662",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: missing,
      y: names,
      name: "missing",
      text: missing.map((val) => {
        return "M: " + Number(val).toFixed(2);
      }),
      customdata: missing_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#284E78",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });

    setBuscoData(tracks);
  };

  const getBuscoLayout = () => {
    setBuscoLayout({
      title: "Busco completeness",
      barmode: "stack",
      margin: { pad: 6 },
      yaxis: {
        tickangle: 45,
        automargin: true,
        type: "category",
        title: { text: "Analysis", standoff: 10 },
      },
      xaxis: {
        automargin: true,
        title: { text: "% of sequences", standoff: 10 },
        range: [0, 100],
        tick0: 0,
        dtick: 10,
      },
      dragmode: false,
      separator: true,
      legend: {
        orientation: "h",
        traceorder: "normal",
        xanchor: "left",
        y: -0.3,
      },
    });
  };

  const getFcatData = (mode = "") => {
    let activeMode = mode || fcatMode;
    let tracks = [];
    let similar = [];
    let similar_absolute = [];
    let duplicated = [];
    let duplicated_absolute = [];
    let dissimilar = [];
    let dissimilar_absolute = [];
    let missing = [];
    let missing_absolute = [];
    let ignored = [];
    let ignored_absolute = [];
    let names = [];
    fcat.length > 0 &&
      fcat.forEach((analysis) => {
        let total =
          analysis["m" + activeMode + "_similar"] +
          analysis["m" + activeMode + "_duplicated"] +
          analysis["m" + activeMode + "_dissimilar"] +
          analysis["m" + activeMode + "_missing"] +
          analysis["m" + activeMode + "_ignored"];
        names.push(analysis.name);
        similar.push((analysis["m" + activeMode + "_similar"] * 100) / total);
        similar_absolute.push(analysis["m" + activeMode + "_similar"] + "/" + total);
        duplicated.push((analysis["m" + activeMode + "_duplicated"] * 100) / total);
        duplicated_absolute.push(analysis["m" + activeMode + "_duplicated"] + "/" + total);
        dissimilar.push((analysis["m" + activeMode + "_dissimilar"] * 100) / total);
        dissimilar_absolute.push(analysis["m" + activeMode + "_dissimilar"] + "/" + total);
        missing.push((analysis["m" + activeMode + "_missing"] * 100) / total);
        missing_absolute.push(analysis["m" + activeMode + "_missing"] + "/" + total);
        ignored.push((analysis["m" + activeMode + "_ignored"] * 100) / total);
        ignored_absolute.push(analysis["m" + activeMode + "_ignored"] + "/" + total);
      });
    tracks.push({
      x: similar,
      y: names,
      name: "similar",
      text: similar.map((val) => {
        return "S: " + Number(val).toFixed(2);
      }),
      customdata: similar_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#5D8233",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: duplicated,
      y: names,
      name: "duplicated",
      text: duplicated.map((val) => {
        return "Du: " + Number(val).toFixed(2);
      }),
      customdata: duplicated_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#BECA5C",
        line: { width: 1, color: "#515E63" },
      },
      width: 0.5,
    });
    tracks.push({
      x: dissimilar,
      y: names,
      name: "dissimilar",
      text: dissimilar.map((val) => {
        return "Di: " + Number(val).toFixed(2);
      }),
      customdata: dissimilar_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#ECD662",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: missing,
      y: names,
      name: "missing",
      text: missing.map((val) => {
        return "M: " + Number(val).toFixed(2);
      }),
      customdata: missing_absolute,
      hovertemplate: "%{label}: <br> %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#284E78",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: ignored,
      y: names,
      name: "ignored",
      text: ignored.map((val) => {
        return "I: " + Number(val).toFixed(2);
      }),
      orientation: "h",
      type: "bar",
      marker: {
        color: "grey",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });

    setFcatData(tracks);
  };

  const getFcatLayout = () => {
    setFcatLayout({
      title: "fCat completeness",
      barmode: "stack",
      margin: { pad: 6 },
      transition: {
        duration: 300,
      },
      dragmode: false,
      separator: true,
      yaxis: {
        tickangle: 45,
        automargin: true,
        title: { text: "Analysis", standoff: 10 },
      },
      xaxis: {
        automargin: true,
        title: { text: "% of sequences", standoff: 10 },
        range: [0, 100],
        tick0: 0,
        dtick: 10,
      },
      legend: {
        orientation: "h",
        traceorder: "normal",
        xanchor: "left",
        y: -0.3,
      },
    });
  };

  const handleModeChange = (mode) => {
    getFcatData(mode);
    getFcatLayout();
    setFcatMode(mode);
  };

  return (
    <div className="mx-8 animate-grow-y">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="rounded-lg overflow-hidden shadow-lg bg-white relative">
          <div className="animate-fade-in p-4">
            {buscoData.length > 0 ? (
              <Plot
                data={buscoData}
                layout={buscoLayout}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div className="flex items-center justify-center text-center">Not yet imported!</div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 z-10 opacity-50 flex items-center mx-4 my-1">
            <a
              href={process.env.REACT_APP_FILE_SERVER_ADRESS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center"
            >
              <Button color="link">
                <Download className="stroke-current" color="blank" />
              </Button>
            </a>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white relative">
          <div className="absolute top-0 right-0 mx-4 my-2 z-10">
            <select
              value={fcatMode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="rounded-lg px-4 py-1 shadow border text-xs focus:outline-none focus:ring-2 ring-offset-1 transition duration-300"
            >
              <option value={1}>Mode 1</option>
              <option value={2}>Mode 2</option>
              <option value={3}>Mode 3</option>
              <option value={4}>Mode 4</option>
            </select>
          </div>
          <div className="animate-fade-in p-4">
            {fcatData.length > 0 ? (
              <Plot
                data={fcatData}
                layout={fcatLayout}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div className="flex items-center justify-center text-center">Not yet imported!</div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 mx-4 my-1 z-10 opacity-50 flex items-center">
            <a
              href={process.env.REACT_APP_FILE_SERVER_ADRESS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center"
            >
              <Button color="link">
                <Download className="stroke-current" color="blank" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationCompletenessViewer;

AnnotationCompletenessViewer.defaultProps = { busco: [], fcat: [] };

AnnotationCompletenessViewer.propTypes = {
  busco: propTypes.array,
  fcat: propTypes.array,
};
