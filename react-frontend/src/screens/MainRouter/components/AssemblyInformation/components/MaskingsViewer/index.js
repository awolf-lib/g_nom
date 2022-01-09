import { useEffect, useState } from "react";
import Button from "../../../../../../components/Button";
import { Download } from "grommet-icons";
import { newPlot } from "plotly.js";

const MaskingsViewer = ({ taxon, assembly, repeatmasker }) => {
  const [data1, setData1] = useState({});
  const [layout1, setLayout1] = useState({});
  const [data2, setData2] = useState({});
  const [layout2, setLayout2] = useState({});

  const plotlyDivElements = document.getElementById("plotlyRepeatElements");
  useEffect(() => {
    if (plotlyDivElements) {
      newPlot("plotlyRepeatElements", data1, layout1, {
        responsive: true,
        useResizeHandler: true,
      });
    }
  }, [plotlyDivElements]);

  const plotlyDivRepet = document.getElementById("plotlyRepetitiveness");
  useEffect(() => {
    if (plotlyDivRepet) {
      newPlot("plotlyRepetitiveness", data2, layout2, {
        responsive: true,
        useResizeHandler: true,
      });
    }
  }, [plotlyDivRepet]);

  useEffect(() => {
    getElementsData();
    getElementsLayout();
    getRepetitivenessData();
    getRepetitivenessLayout();
  }, [assembly?.id]);

  const getElementsData = () => {
    let tracks = [];
    let sines_lengths = [];
    let sines_numbers = [];
    let lines_lengths = [];
    let lines_numbers = [];
    let ltr_elements_lengths = [];
    let ltr_elements_numbers = [];
    let dna_elements_lengths = [];
    let dna_elements_numbers = [];
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
        sines_lengths.push(analysis["sines_length"]);
        sines_numbers.push(analysis["sines"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        lines_lengths.push(analysis["lines_length"]);
        lines_numbers.push(analysis["lines"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        ltr_elements_lengths.push(analysis["ltr_elements_length"]);
        ltr_elements_numbers.push(
          analysis["ltr_elements"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        dna_elements_lengths.push(analysis["dna_elements_length"]);
        dna_elements_numbers.push(
          analysis["dna_elements"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        rolling_circles_lengths.push(analysis["rolling_circles_length"]);
        rolling_circles_numbers.push(
          analysis["rolling_circles"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        unclassified_lengths.push(analysis["unclassified_length"]);
        unclassified_numbers.push(
          analysis["unclassified"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        small_rna_lengths.push(analysis["small_rna_length"]);
        small_rna_numbers.push(
          analysis["small_rna"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        satellites_lengths.push(analysis["satellites_length"]);
        satellites_numbers.push(
          analysis["satellites"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        simple_repeats_lengths.push(analysis["simple_repeats_length"]);
        simple_repeats_numbers.push(
          analysis["simple_repeats"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        low_complexity_lengths.push(analysis["low_complexity_length"]);
        low_complexity_numbers.push(
          analysis["low_complexity"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
      });

    tracks.push({
      x: sines_lengths,
      y: names,
      name: "SINEs",
      text: sines_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: sines_numbers,
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
      x: lines_lengths,
      y: names,
      name: "LINEs",
      text: lines_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: lines_numbers,
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
      x: ltr_elements_lengths,
      y: names,
      name: "LTR Elements",
      text: ltr_elements_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: ltr_elements_numbers,
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
      x: dna_elements_lengths,
      y: names,
      name: "DNA Elements",
      text: dna_elements_lengths.map((val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bp";
      }),
      customdata: dna_elements_numbers,
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

    setData1(tracks);
  };

  const getElementsLayout = () => {
    setLayout1({
      title: "Repeats",
      barmode: "stack",
      margin: { pad: 6 },
      separator: true,
      yaxis: {
        tickangle: 45,
        automargin: true,
        title: { text: "Masking", standoff: 10 },
        type: "category",
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
      },
      xaxis: {
        automargin: true,
        title: { text: "Bases masked", standoff: 10 },
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
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
        let total = analysis.total_repetitive_length + analysis.total_non_repetitive_length;
        names.push(analysis.name);
        total_repetitive_length.push((analysis["total_repetitive_length"] * 100) / total);
        total_repetitive_length_absolute.push(
          analysis["total_repetitive_length"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        total_non_repetitive_length.push((analysis["total_non_repetitive_length"] * 100) / total);
        total_non_repetitive_length_absolute.push(
          analysis["total_non_repetitive_length"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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

    setData2(tracks);
  };

  const getRepetitivenessLayout = () => {
    setLayout2({
      title: "Repetitiveness",
      barmode: "stack",
      margin: { pad: 6 },
      separator: true,
      yaxis: {
        tickangle: 45,
        automargin: true,
        title: { text: "Masking", standoff: 10 },
        type: "category",
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
      },
      xaxis: {
        automargin: true,
        title: { text: "% of assembly", standoff: 10 },
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
      legend: {
        orientation: "h",
        traceorder: "normal",
        xanchor: "left",
        y: -0.5,
      },
    });
  };

  return (
    <div className="animate-grow-y relative">
      <div className="flex">
        <div id="plotlyRepeatElements" className="w-full h-full" />
        <div id="plotlyRepetitiveness" className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 right-0 z-10 opacity-50 flex items-center mx-4 my-1">
        <a
          href={
            process.env.REACT_APP_FILE_SERVER_ADRESS +
            "/apps/files/?dir=/GnomData/taxa/" +
            taxon.scientificName.replace(/[^a-zA-Z0-9\S]/gi, "_") +
            "/" +
            assembly.name +
            "/analyses/repeatmasker"
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

export default MaskingsViewer;
