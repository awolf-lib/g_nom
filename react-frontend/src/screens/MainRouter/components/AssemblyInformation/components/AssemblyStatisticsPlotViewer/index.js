import { newPlot } from "plotly.js";
import { useEffect } from "react";

const AssemblyStatisticsPlotViewer = ({ assembly }) => {
  const plotlyDiv = document.getElementById("plotlyAssemblyStatistics");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyAssemblyStatistics", getData(), getLayout(), { responsive: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotlyDiv]);

  const getData = () => {
    const length_distribution = JSON.parse(assembly.lengthDistributionString);
    const sequence_length = length_distribution[0]["l"];

    let cumulativeLengths = [];
    let x1 = [];
    let y1 = [];
    Object.keys(length_distribution).forEach((key) => {
      cumulativeLengths.push({
        y: parseInt(length_distribution[key]["l"]),
        x: parseInt(key),
      });
    });

    cumulativeLengths = cumulativeLengths.sort((a, b) => {
      if (a.x > b.x) {
        return 1;
      }
      if (a.x < b.x) {
        return -1;
      }
      return 0;
    });

    while (
      cumulativeLengths[cumulativeLengths.length - 1].y == 0 ||
      isNaN(cumulativeLengths[cumulativeLengths.length - 1].y)
    ) {
      cumulativeLengths.pop();
    }

    console.log(cumulativeLengths);

    let cumulative = 0;
    cumulativeLengths.forEach((element) => {
      cumulative = sequence_length - element.y;
      x1.push(">" + (element.x / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      y1.push(cumulative);
    });

    let numbersequences = [];
    let x2 = [];
    let y2 = [];
    Object.keys(length_distribution).forEach((key) => {
      numbersequences.push({
        y: length_distribution[key]["n"],
        x: parseInt(key),
      });
    });

    numbersequences = numbersequences.sort((a, b) => {
      return a.x > b.x ? 0 : -1;
    });

    while (
      numbersequences[numbersequences.length - 1].y === 0 ||
      isNaN(numbersequences[numbersequences.length - 1].y)
    ) {
      numbersequences.pop();
    }

    numbersequences.forEach((element) => {
      x2.push(">" + (element.x / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      y2.push(element.y);
    });

    let data = [
      {
        x: x1,
        y: y1,
        mode: "markers",
        type: "bar",
        yaxis: "y",
        opacity: 0.5,
        name: "Cumulative sequence length",
        marker: { color: "grey" },
      },
      {
        x: x2,
        y: y2,
        type: "bar",
        yaxis: "y2",
        opacity: 1,
        name: "# of sequences",
        marker: { color: "orange" },
      },
    ];

    return data;
  };

  const getLayout = () => {
    let layout = {
      showlegend: true,
      legend: {
        x: 0.1,
        y: -0.7,
        xanchor: "center",
      },
      xaxis: {
        type: "category",
        title: { text: "Contig size (kb)", standoff: 10 },
        tickangle: 45,
        automargin: true,
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
      },
      yaxis: {
        title: {
          text: "Cumulative sequence length > x",
          standoff: 20,
        },
        side: "right",
        overlaying: "y2",
        color: "grey",
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
        automargin: true,
      },
      yaxis2: {
        title: {
          text: "# of sequences > x",
          standoff: 20,
        },
        side: "left",
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
        automargin: true,
      },
    };
    return layout;
  };

  return (
    <div className="animate-grow-y w-full h-full">
      <div id="plotlyAssemblyStatistics" className="w-full h-full" />
    </div>
  );
};

export default AssemblyStatisticsPlotViewer;
