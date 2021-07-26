import React, { useState } from "react";
import Plot from "react-plotly.js";
import propTypes from "prop-types";

const StaticAssemblyStatisticsViewer = ({ statistics }) => {
  const [showNumsequences, setShowNumSequences] = useState(true);
  const [showCumulativeLength, setShowCumulativeLength] = useState(true);
  const [selectPlot, setSelectPlot] = useState("both");
  const getData = () => {
    let cumulativeLengths = [];
    let x1 = [];
    let y1 = [];
    if (showCumulativeLength) {
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
          x1.push(">" + element["x1"]);
          y1.push(cumulative);
        });
    }

    let numbersequences = [];
    let x2 = [];
    let y2 = [];
    if (showNumsequences) {
      Object.keys(statistics).forEach((key) => {
        if (key.includes("sequencesLarger")) {
          numbersequences.push({
            y2: statistics[key],
            x2: parseInt(key.replace("sequencesLarger", "")),
          });
        }
      });

      numbersequences
        .sort((a, b) => {
          return a["x2"] > b["x2"] ? 0 : -1;
        })
        .forEach((element) => {
          x2.push(">" + element["x2"]);
          y2.push(element["y2"]);
        });
    }

    if (showNumsequences && showCumulativeLength) {
      return [
        {
          x: x1,
          y: y1,
          type: "bar",
          yaxis: "y",
          opacity: 0.5,
          name: "Cumulative sequence length",
          marker: { color: "grey" },
          gridcolor: "orange",
        },
        {
          x: x2,
          y: y2,
          type: "bar",
          yaxis: "y2",
          opacity: 1,
          name: "# sequences",
          marker: { color: "orange" },
        },
      ];
    }

    if (showNumsequences) {
      return [
        {
          x: x2,
          y: y2,
          type: "bar",
          opacity: 0.7,
          name: "# sequences",
          marker: { color: "orange" },
        },
      ];
    }

    if (showCumulativeLength) {
      return [
        {
          x: x1,
          y: y1,
          type: "bar",
          opacity: 0.7,
          name: "Cumulative sequence length",
          marker: { color: "grey" },
          gridcolor: "orange",
        },
      ];
    }
  };

  const getLayout = () => {
    if (showNumsequences && showCumulativeLength) {
      return {
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
            text: "# sequences > x",
            standoff: 20,
          },
          side: "left",
        },
      };
    }

    if (showNumsequences) {
      return {
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
            text: "# sequences > x",
            standoff: 20,
          },
          side: "left",
        },
      };
    }

    if (showCumulativeLength) {
      return {
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
            text: "CUMULATIVE LENGTH OF SEQUENCES > x",
            standoff: 20,
          },
          side: "right",
          color: "grey",
        },
      };
    }
  };

  const handleChangePlot = (key) => {
    switch (key) {
      case "sequences":
        setShowNumSequences(true);
        setShowCumulativeLength(false);
        setSelectPlot("sequences");
        break;

      case "length":
        setShowNumSequences(false);
        setShowCumulativeLength(true);
        setSelectPlot("length");
        break;

      case "both":
        setShowNumSequences(true);
        setShowCumulativeLength(true);
        setSelectPlot("both");
        break;

      default:
        break;
    }
  };

  const formatNumbers = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <div className="mx-8 animate-grow-y">
      <div className="lg:grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="relative shadow-lg rounded-lg overflow-hidden border-2 mb-4 lg:mb-0">
          <Plot
            data={getData()}
            layout={getLayout()}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="absolute top-0 right-0 m-2">
            <select
              className="border p-1 text-sm focus:outline-none rounded-lg shadow transition transform duration-300 hover:ring-2 ring-offset-1"
              onChange={(e) => handleChangePlot(e.target.value)}
              value={selectPlot}
            >
              <option value="sequences">{"# sequences > x"}</option>
              <option value="length">
                {"cumulative length of sequences > x"}
              </option>
              <option value="both">both</option>
            </select>
          </div>
        </div>
        <div className="p-2 bg-gradient-to-b from-indigo-100 via-white to-indigo-100 rounded-lg shadow-lg">
          <table className="w-full bg-white table-fixed">
            <tbody>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  # Sequences
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["numberOfSequences"])}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  Cumulative sequence length (BP)
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["cumulativeSequenceLength"])}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  Largest sequence (BP)
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["largestSequence"])}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  N50 (BP)
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["n50"])}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  N90 (BP)
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["n90"])}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  Type
                </td>
                <td className="text-center">
                  {statistics["types"].toUpperCase()}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  GC (%)
                </td>
                <td className="text-center">{statistics["gcPercent"]}</td>
              </tr>
              {statistics["gcPercentMasked"] !== statistics["gcPercent"] && (
                <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                  <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                    GC (%; unmasked)
                  </td>
                  <td className="text-center">
                    {formatNumbers(statistics["n90"])}
                  </td>
                </tr>
              )}
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  Masking
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["maskings"].toUpperCase())}
                </td>
              </tr>
              {statistics["hardmaskedBases"] > 0 && (
                <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                  <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                    Masked (N)
                  </td>
                  <td className="text-center">
                    {formatNumbers(statistics["hardmaskedBases"])}
                  </td>
                </tr>
              )}
              {statistics["softmaskedBases"] > 0 && (
                <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                  <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                    Masked (N)
                  </td>
                  <td className="text-center">
                    {formatNumbers(statistics["softmaskedBases"])}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaticAssemblyStatisticsViewer;

StaticAssemblyStatisticsViewer.defaultProps = { statistics: {} };

StaticAssemblyStatisticsViewer.propTypes = {
  statistics: propTypes.object.isRequired,
};
