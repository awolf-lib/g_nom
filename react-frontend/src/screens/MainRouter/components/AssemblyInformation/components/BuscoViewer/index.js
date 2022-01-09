import { useEffect, useState } from "react";
import Button from "../../../../../../components/Button";
import { Download } from "grommet-icons";
import { newPlot } from "plotly.js";

const BuscoViewer = ({ assembly, taxon, busco }) => {
  const [data, setData] = useState({});
  const [layout, setLayout] = useState({});

  const plotlyDiv = document.getElementById("plotlyBusco");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyBusco", data, layout, {
        responsive: true,
        useResizeHandler: true,
      });
    }
  }, [plotlyDiv, data, layout]);

  useEffect(() => {
    getBuscoData();
    getBuscoLayout();
  }, [assembly?.id]);

  const getBuscoData = () => {
    const colors = [
      "rgb(56, 75, 126)",
      "rgb(18, 36, 37)",
      "rgb(34, 53, 101)",
      "rgb(36, 55, 57)",
      "rgb(6, 4, 4)",
    ];

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
        names.push(analysis.dataset || analysis.label || analysis.name);
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
        color: colors[0],
        line: { width: 1, color: "#515E63" },
      },
      width: 0.4,
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
        color: colors[1],
        line: { width: 1, color: "#515E63" },
      },
      width: 0.4,
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
        color: colors[2],
        line: { width: 1, color: "#515E63" },
      },
      width: 0.4,
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
        color: colors[3],
        line: { width: 1, color: "#515E63" },
      },
      width: 0.4,
    });

    setData(tracks);
  };

  const getBuscoLayout = () => {
    setLayout({
      title: "Busco completeness",
      barmode: "stack",
      margin: { pad: 6 },
      yaxis: {
        tickangle: 45,
        automargin: true,
        type: "category",
        title: { text: "Analysis", standoff: 10 },
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
      },
      xaxis: {
        automargin: true,
        title: { text: "% of sequences", standoff: 10 },
        range: [0, 100],
        tick0: 0,
        dtick: 10,
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
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

  return (
    <div className="animate-grow-y relative">
      <div id="plotlyBusco" className="w-full h-full" />
      <div className="absolute bottom-0 right-0 z-10 opacity-50 flex items-center mx-4 my-1">
        <a
          href={
            process.env.REACT_APP_FILE_SERVER_ADRESS +
            "/apps/files/?dir=/GnomData/taxa/" +
            taxon.scientificName.replace(/[^a-zA-Z0-9\S]/gi, "_") +
            "/" +
            assembly.name +
            "/analyses/busco"
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
    </div>
  );
};

export default BuscoViewer;
