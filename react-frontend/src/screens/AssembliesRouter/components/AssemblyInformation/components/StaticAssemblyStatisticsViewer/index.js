import React from "react";
import Plot from "react-plotly.js";

const StaticAssemblyStatisticsViewer = ({ statistics }) => {
  const getData = () => {
    let cumulativeLengths = [];
    let x1 = [];
    let y1 = [];
    Object.keys(statistics).forEach((key) => {
      if (key.includes("cumulativeSequenceLengthSequencesLarger")) {
        cumulativeLengths.push({
          y1: statistics[key],
          x1: parseInt(
            key.replace("cumulativeSequenceLengthSequencesLarger", "")
          ),
        });
      }
    });

    let cumulative = 0;
    cumulativeLengths
      .sort((a, b) => {
        return a["x1"] > b["x1"] ? 0 : -1;
      })
      .forEach((element) => {
        cumulative = cumulative + element["y1"];
        x1.push(element["x1"]);
        y1.push(cumulative);
      });

    let numberContigs = [];
    let x2 = [];
    let y2 = [];
    Object.keys(statistics).forEach((key) => {
      if (key.includes("sequencesLarger")) {
        numberContigs.push({
          y2: statistics[key],
          x2: parseInt(key.replace("sequencesLarger", "")),
        });
      }
    });

    numberContigs
      .sort((a, b) => {
        return a["x2"] > b["x2"] ? 0 : -1;
      })
      .forEach((element) => {
        x2.push(element["x2"]);
        y2.push(element["y2"]);
      });

    return [
      {
        x: x1,
        y: y1,
        type: "bar",
        yaxis: "y",
        name: "Cumulative sequence length",
        marker: { color: "grey" },
        gridcolor: "orange",
      },
      {
        x: x2,
        y: y2,
        type: "bar",
        yaxis: "y2",
        name: "# Contigs",
        marker: { color: "orange" },
      },
    ];
  };
  return (
    <div className="mx-8 animate-grow-y">
      <div className="lg:grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="shadow-lg rounded-lg overflow-hidden border-2 mb-4 lg:mb-0">
          <Plot
            data={getData()}
            layout={{
              showlegend: true,
              legend: {
                x: 0.1,
                y: -0.7,
                xanchor: "center",
              },
              xaxis: {
                type: "category",
                title: { text: "CONTIG SIZE", standoff: 10 },
                tickangle: 45,
                automargin: true,
              },
              yaxis: {
                title: {
                  text: "CUMULATIVE SEQUENCE LENGTH > x",
                  standoff: 20,
                },
                side: "right",
                overlaying: "y2",
                color: "grey",
              },
              yaxis2: {
                title: {
                  text: "# CONTIGS > x",
                  standoff: 20,
                },
                side: "left",
              },
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="p-2 bg-indigo-200 rounded-lg shadow-lg">
          <table className="w-full bg-white table-fixed">
            <tbody>
              {Object.keys(statistics).map((key) => {
                if (
                  !key.includes("cumulativeSequenceLengthSequencesLarger") &&
                  !key.includes("sequencesLarger") &&
                  key !== "id" &&
                  key !== "assemblyID"
                )
                  return (
                    <tr
                      key={key}
                      className="border hover:bg-indigo-200 hover:text-white transition duration-300"
                    >
                      <td className="px-4 py-2">{key}</td>
                      <td className="text-center">{statistics[key]}</td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaticAssemblyStatisticsViewer;

StaticAssemblyStatisticsViewer.defaultProps = {};

StaticAssemblyStatisticsViewer.propTypes = {};
