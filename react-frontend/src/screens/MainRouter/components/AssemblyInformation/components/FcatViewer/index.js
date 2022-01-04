import { useEffect, useState } from "react";
import propTypes from "prop-types";
import Button from "../../../../../../components/Button";
import { Download } from "grommet-icons";
import { newPlot } from "plotly.js";

const FcatViewer = ({ taxon, assembly, fcat }) => {
  const [mode, setMode] = useState(1);

  const plotlyDiv = document.getElementById("plotlyFcat");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyFcat", getFcatData(), getFcatLayout(), {
        responsive: true,
        useResizeHandler: true,
      });
    }
  }, [plotlyDiv, mode]);

  const getFcatData = () => {
    let activeMode = mode;
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

    return tracks;
  };

  const getFcatLayout = () => {
    return {
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
    };
  };

  return (
    <div className="animate-grow-y relative">
      <div id="plotlyFcat" className="w-full h-full" />
      <div className="absolute top-0 right-0 mx-4 my-2 z-10">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="rounded-lg px-4 py-1 shadow border text-xs focus:outline-none focus:ring-2 ring-offset-1 transition duration-300"
        >
          <option value={1}>Mode 1</option>
          <option value={2}>Mode 2</option>
          <option value={3}>Mode 3</option>
          <option value={4}>Mode 4</option>
        </select>
      </div>
      <a
        href={
          process.env.REACT_APP_FILE_SERVER_ADRESS +
          "/apps/files/?dir=/GnomData/taxa/" +
          taxon.scientificName.replace(/[^a-zA-Z0-9\S]/gi, "_") +
          "/" +
          assembly.name +
          "/analyses/fcat"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 right-0 m-4 opacity-50 hover:opacity-100 flex justify-center items-center"
      >
        <Button color="link">
          <Download className="stroke-current" color="blank" />
        </Button>
      </a>
    </div>
  );
};

export default FcatViewer;

FcatViewer.defaultProps = { busco: [], fcat: [] };

FcatViewer.propTypes = {
  busco: propTypes.array,
  fcat: propTypes.array,
};
