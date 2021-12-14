import Plot from "react-plotly.js";
import propTypes from "prop-types";

const StaticAssemblyStatisticsViewer = ({ statistics }) => {
  const length_distribution = JSON.parse(statistics.lengthDistributionString);
  const sequence_length = length_distribution[0]["l"];
  const getData = () => {
    let cumulativeLengths = [];
    let x1 = [];
    let y1 = [];
    Object.keys(length_distribution).forEach((key) => {
      cumulativeLengths.push({
        y1: parseInt(length_distribution[key]["l"]),
        x1: parseInt(key),
      });
    });

    let cumulative = 0;
    cumulativeLengths = cumulativeLengths
      .sort((a, b) => {
        if (a["x1"] > b["x1"]) {
          return 1;
        }
        if (a["x1"] < b["x1"]) {
          return -1;
        }
        return 0;
      })
      .forEach((element) => {
        cumulative = sequence_length - element["y1"];
        x1.push(">" + (element["x1"] / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        y1.push(cumulative);
      });

    let numbersequences = [];
    let x2 = [];
    let y2 = [];
    Object.keys(length_distribution).forEach((key) => {
      numbersequences.push({
        y2: length_distribution[key]["n"],
        x2: parseInt(key),
      });
    });

    numbersequences
      .sort((a, b) => {
        return a["x2"] > b["x2"] ? 0 : -1;
      })
      .forEach((element) => {
        x2.push(">" + (element["x2"] / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        y2.push(element["y2"]);
      });

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
        name: "# of sequences",
        marker: { color: "orange" },
      },
    ];
  };

  const getLayout = () => {
    return {
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
      },
      yaxis: {
        title: {
          text: "Cumulative sequence length > x",
          standoff: 20,
        },
        side: "right",
        overlaying: "y2",
        color: "grey",
      },
      yaxis2: {
        title: {
          text: "# of sequences > x",
          standoff: 20,
        },
        side: "left",
      },
    };
  };

  const formatNumbers = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <div className="mx-8 animate-grow-y">
      <div className="lg:grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="shadow-lg rounded-lg overflow-hidden border-2 mb-4 lg:mb-0">
          <Plot
            data={getData()}
            layout={getLayout()}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="p-2 bg-gradient-to-b from-indigo-100 via-white to-indigo-100 rounded-lg shadow-lg">
          <table className="w-full bg-white table-fixed">
            <tbody>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold"># of sequences</td>
                <td className="text-center">{formatNumbers(statistics["numberOfSequences"])}</td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  Cumulative sequence length (kbp)
                </td>
                <td className="text-center">
                  {formatNumbers(statistics["cumulativeSequenceLength"])}
                </td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">
                  Largest sequence (bp)
                </td>
                <td className="text-center">{formatNumbers(statistics["largestSequence"])}</td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">N50 (bp)</td>
                <td className="text-center">{formatNumbers(statistics["n50"])}</td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">N90 (bp)</td>
                <td className="text-center">{formatNumbers(statistics["n90"])}</td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">Type</td>
                <td className="text-center">{statistics["sequenceType"].toUpperCase()}</td>
              </tr>
              <tr className="border hover:bg-gray-400 hover:text-white transition duration-300 hover:border-gray-400">
                <td className="px-4 py-3 text-sm lg:text-base font-semibold">GC (%)</td>
                <td className="text-center">{statistics["gcPercent"]}</td>
              </tr>
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
