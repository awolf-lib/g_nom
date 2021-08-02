import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import propTypes from "prop-types";
import Button from "../../../../../../components/Button";
import { Download } from "grommet-icons";

const MaskingsViewer = ({ repeatmasker, assemblyName }) => {
  const [elementsData, setElementsData] = useState([]);
  const [elementsLayout, setElementsLayout] = useState([]);
  const [repetitivenessData, setRepetitivenessData] = useState([]);
  const [repetitivenessLayout, setRepetitivenessLayout] = useState([]);

  useEffect(() => {
    getElementsData();
    getElementsLayout();
    getRepetitivenessData();
    getRepetitivenessLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getElementsData = () => {
    let tracks = [];
    let retroelements_lengths = [];
    let retroelements_numbers = [];
    let dna_transposons_lengths = [];
    let dna_transposons_numbers = [];
    let rolling_circles_lengths = [];
    let rolling_circles_numbers = [];
    let unclassified_lengths = [];
    let unclassified_numbers = [];
    let small_rna_lengths = [];
    let small_rna_numbers = [];
    let satellites_lengths = [];
    let satellites_numbers = [];
    let simple_repeats_lengths = [];
    let simple_repeats_numbers = [];
    let low_complexity_lengths = [];
    let low_complexity_numbers = [];
    let names = [];
    repeatmasker.length > 0 &&
      repeatmasker.forEach((analysis) => {
        names.push(analysis.name);
        retroelements_lengths.push(analysis["retroelements_length"]);
        retroelements_numbers.push(
          analysis["retroelements"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        dna_transposons_lengths.push(analysis["dna_transposons_length"]);
        dna_transposons_numbers.push(
          analysis["dna_transposons"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        rolling_circles_lengths.push(analysis["rolling_circles_length"]);
        rolling_circles_numbers.push(
          analysis["rolling_circles"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        unclassified_lengths.push(analysis["unclassified_length"]);
        unclassified_numbers.push(
          analysis["unclassified"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        small_rna_lengths.push(analysis["small_rna_length"]);
        small_rna_numbers.push(
          analysis["small_rna"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        satellites_lengths.push(analysis["satellites_length"]);
        satellites_numbers.push(
          analysis["satellites"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        simple_repeats_lengths.push(analysis["simple_repeats_length"]);
        simple_repeats_numbers.push(
          analysis["simple_repeats"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        low_complexity_lengths.push(analysis["low_complexity_length"]);
        low_complexity_numbers.push(
          analysis["low_complexity"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
      });

    tracks.push({
      x: retroelements_lengths,
      y: names,
      name: "Retroelements",
      text: retroelements_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: retroelements_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#2F5D62",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: dna_transposons_lengths,
      y: names,
      name: "DNA Transposons",
      text: dna_transposons_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: dna_transposons_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#5E8B7E",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: rolling_circles_lengths,
      y: names,
      name: "Rolling-circles",
      text: rolling_circles_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: rolling_circles_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#A7C4BC",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: unclassified_lengths,
      y: names,
      name: "Unclassified",
      text: unclassified_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: unclassified_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#DFEEEA",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: small_rna_lengths,
      y: names,
      name: "Small RNA",
      text: small_rna_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: small_rna_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#E1701A",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: satellites_lengths,
      y: names,
      name: "Satellites",
      text: satellites_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: satellites_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#F7A440",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: simple_repeats_lengths,
      y: names,
      name: "Simple repeats",
      text: simple_repeats_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: simple_repeats_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#476072",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: low_complexity_lengths,
      y: names,
      name: "Low complexity",
      text: low_complexity_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: low_complexity_numbers,
      hovertemplate: "%{label}: <br> Elements: %{customdata} </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#AAAAAA",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });

    setElementsData(tracks);
  };

  const getElementsLayout = () => {
    setElementsLayout({
      title: "Repeats",
      barmode: "stack",
      margin: { pad: 6 },
      dragmode: false,
      separator: true,
      yaxis: {
        tickangle: 45,
        automargin: true,
        title: { text: "Masking", standoff: 10 },
        type: "category",
      },
      xaxis: {
        automargin: true,
        title: { text: "Bases masked", standoff: 10 },
      },
      legend: {
        orientation: "h",
        traceorder: "normal",
        xanchor: "left",
        y: -0.3,
        font: {
          size: 10,
        },
      },
    });
  };

  const getRepetitivenessData = () => {
    let tracks = [];
    let total_repetitive_length = [];
    let total_repetitive_length_absolute = [];
    let total_non_repetitive_length = [];
    let total_non_repetitive_length_absolute = [];
    let names = [];
    repeatmasker.length > 0 &&
      repeatmasker.forEach((analysis) => {
        let total =
          analysis.total_repetitive_length +
          analysis.total_non_repetitive_length;
        names.push(analysis.name);
        total_repetitive_length.push(
          (analysis["total_repetitive_length"] * 100) / total
        );
        total_repetitive_length_absolute.push(
          analysis["total_repetitive_length"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        total_non_repetitive_length.push(
          (analysis["total_non_repetitive_length"] * 100) / total
        );
        total_non_repetitive_length_absolute.push(
          analysis["total_non_repetitive_length"]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
      });

    tracks.push({
      x: total_repetitive_length,
      y: names,
      name: "Repetitive length",
      text: total_repetitive_length.map((val) => {
        return Number(val).toFixed(2) + "%";
      }),
      customdata: total_repetitive_length_absolute,
      hovertemplate: "%{label}: <br> %{customdata} bp </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#787A91",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });
    tracks.push({
      x: total_non_repetitive_length,
      y: names,
      name: "Non-repetitive length",
      text: total_non_repetitive_length.map((val) => {
        return Number(val).toFixed(2) + "%";
      }),
      customdata: total_non_repetitive_length_absolute,
      hovertemplate: "%{label}: <br> %{customdata} bp </br> %{text}",
      orientation: "h",
      type: "bar",
      marker: {
        color: "#5D8233",
        line: { width: 1, color: "#515E63" },
      },
      opacity: 0.7,
      width: 0.5,
    });

    setRepetitivenessData(tracks);
  };

  const getRepetitivenessLayout = () => {
    setRepetitivenessLayout({
      title: "Repetitiveness",
      barmode: "stack",
      margin: { pad: 6 },
      dragmode: false,
      separator: true,
      yaxis: {
        tickangle: 45,
        automargin: true,
        title: { text: "Masking", standoff: 10 },
        type: "category",
      },
      xaxis: {
        automargin: true,
        title: { text: "% of assembly", standoff: 10 },
        range: [0, 100],
        tick0: 0,
        dtick: 10,
      },
      legend: {
        orientation: "h",
        traceorder: "normal",
        xanchor: "left",
        y: -0.5,
      },
    });
  };

  return (
    <div className="mx-8 animate-grow-y">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="shadow-lg rounded-lg p-2 bg-white">
          <Plot
            data={elementsData}
            layout={elementsLayout}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="shadow-lg rounded-lg p-2 bg-white relative">
          <Plot
            data={repetitivenessData}
            layout={repetitivenessLayout}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute bottom-0 right-0 z-10 opacity-50 flex items-center mx-4 my-1">
            <a
              href={
                "http://localhost:5003/g-nom/portal/fs/download/assemblies/" +
                assemblyName +
                "/repeatmasker/"
              }
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

export default MaskingsViewer;

MaskingsViewer.defaultProps = { repeatmasker: [] };

MaskingsViewer.propTypes = {
  repeatmasker: propTypes.array,
};
