import { newPlot, relayout } from "plotly.js";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";

const AnnotationStatisticsPlotViewer = ({ annotations }) => {
  const [data, setData] = useState({});
  const [layout, setLayout] = useState({});

  const plotlyDiv = document.getElementById("plotlyAnnotationFeatureTypes");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyAnnotationFeatureTypes", data, layout);
    }
  }, [plotlyDiv, data, layout]);

  useEffect(() => {
    if (annotations?.length) {
      getData();
      getLayout();
    }
  }, [annotations.length]);

  const getData = () => {
    const colors = [
      "rgb(56, 75, 126)",
      "rgb(18, 36, 37)",
      "rgb(34, 53, 101)",
      "rgb(36, 55, 57)",
      "rgb(6, 4, 4)",
    ];

    let traces = [];
    if (annotations && annotations.length > 0) {
      let x = [];
      let y = [];
      annotations.forEach((annotation, index) => {
        let features = JSON.parse(annotation.featureCount);

        Object.keys(features).forEach((type) => {
          y.push(type);
          x.push(features[type]);
        });

        traces.push({
          x: x,
          y: y,
          orientation: "h",
          name: annotation.label || annotation.name,
          type: "bar",
          marker: {
            color: colors[index],
          },
        });
      });
    }

    setData(traces);
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
        title: { text: "Number", standoff: 20 },
      },
      yaxis: {
        title: {
          type: "category",
          text: "Features",
          standoff: 20,
        },
        tickangle: 45,
        side: "left",
        overlaying: "y",
        color: "grey",
      },
    };
    setLayout(layout);
  };

  return (
    <div className="animate-grow-y w-full h-full flex items-center">
      <div id="plotlyAnnotationFeatureTypes" className="w-full" />
    </div>
  );
};

export default AnnotationStatisticsPlotViewer;
