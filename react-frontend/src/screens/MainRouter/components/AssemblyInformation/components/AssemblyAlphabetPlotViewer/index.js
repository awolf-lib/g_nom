import { newPlot } from "plotly.js";
import { useEffect, useState } from "react";

const AssemblyAlphabetPlotViewer = ({ assembly }) => {
  const [data, setData] = useState({});
  const [layout, setLayout] = useState({});

  const plotlyDiv = document.getElementById("plotlyAssemblyAlphabet");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyAssemblyAlphabet", data, layout, { responsive: true, useResizeHandler: true });
    }
  }, [plotlyDiv, data, layout]);

  useEffect(() => {
    getData();
    getLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly?.id]);

  const getData = () => {
    const charCount = JSON.parse(assembly.charCountString);

    let values = [];
    let labels = [];
    Object.keys(charCount).forEach((char) => {
      labels.push(char);
      values.push(charCount[char]);
    });

    setData([
      {
        values: values,
        labels: labels,
        type: "pie",
        textinfo: "label+percent",
        hoverinfo: "label+value",
        marker: {
          colors: ["#E69F00", "#56B4E9", "#009E73", "#0072B2", "#D55E00"],
        },
      },
    ]);
  };

  const getLayout = () => {
    setLayout({
      showlegend: true,
      automargin: true,
      autosize: true,
      title: "Alphabet",
      legend: {
        x: 1,
        y: 1,
        xanchor: "center",
        orientation: "v",
      },
    });
  };

  return (
    <div className="animate-grow-y w-full h-full" style={{ minHeight: "25rem" }}>
      <div id="plotlyAssemblyAlphabet" className="w-full h-full" />
    </div>
  );
};

export default AssemblyAlphabetPlotViewer;
