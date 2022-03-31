import { newPlot } from "plotly.js";
import { useEffect, useState } from "react";

const AnnotationStatisticsPlotViewer = ({ annotations }) => {
  const [data, setData] = useState({});
  const [layout, setLayout] = useState({});
  const [bars, setBars] = useState(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations.length]);

  const getData = () => {
    const colors = ["#E69F00", "#56B4E9", "#009E73", "#0072B2", "#D55E00"];

    let traces = [];
    if (annotations && annotations.length > 0) {
      annotations.forEach((annotation, index) => {
        let x = [];
        let y = [];
        let types = [];
        let features = JSON.parse(annotation.featureCount);

        types.push("TOTAL");
        y.push("");
        x.push(features.total);

        let bars = 0;
        Object.keys(features).forEach((type) => {
          if (type !== "total" && features[type]) {
            types.push(type.toUpperCase());
            y.push("");
            x.push(features[type]);
            bars += 1;
          }
        });

        setBars(bars);

        traces.push({
          name: annotation.label || annotation.name,
          x: x,
          y: [types, y],
          orientation: "h",
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
      title: "Feature types",
      showlegend: true,
      legend: {
        x: -0.37,
        y: -0.25,
      },
      barmode: "bar",
      xaxis: {
        title: { text: "Number", standoff: 20 },
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
        tickson: 2,
        automargin: true,
      },
      yaxis: {
        title: {
          type: "category",
          text: "Features",
          standoff: 20,
        },
        showgrid: true,
        side: "left",
        color: "grey",
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        autotick: true,
        automargin: true,
      },
    };
    setLayout(layout);
  };

  return (
    <div className="animate-grow-y w-full" style={{ height: bars * 150 + "px" }}>
      <div id="plotlyAnnotationFeatureTypes" className="w-full h-full" />
    </div>
  );
};

export default AnnotationStatisticsPlotViewer;
