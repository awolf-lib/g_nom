import { newPlot } from "plotly.js";
import { useEffect } from "react";

const AssemblyAlphabetPlotViewer = ({ assembly }) => {
  const plotlyDiv = document.getElementById("plotlyAssemblyAlphabet");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyAssemblyAlphabet", getData(), getLayout(), { responsive: true });
    }
  }, [plotlyDiv]);

  const getData = () => {
    const charCount = JSON.parse(assembly.charCountString);

    let values = [];
    let labels = [];
    Object.keys(charCount).forEach((char) => {
      labels.push(char);
      values.push(charCount[char]);
    });

    return [
      {
        values: values,
        labels: labels,
        type: "pie",
        textinfo: "label+percent",
        hoverinfo: "label+value",
        marker: {
          colors: [
            "rgb(56, 75, 126)",
            "rgb(18, 36, 37)",
            "rgb(34, 53, 101)",
            "rgb(36, 55, 57)",
            "rgb(6, 4, 4)",
          ],
        },
      },
    ];
  };

  const getLayout = () => {
    let layout = {
      showlegend: true,
      title: "Alphabet",
      legend: {
        x: 1,
        y: 0.5,
        xanchor: "center",
        orientation: "v",
      },
    };
    return layout;
  };

  return (
    <div className="animate-grow-y w-full h-full">
      <div id="plotlyAssemblyAlphabet" className="w-full h-full" />
    </div>
  );
};

export default AssemblyAlphabetPlotViewer;
