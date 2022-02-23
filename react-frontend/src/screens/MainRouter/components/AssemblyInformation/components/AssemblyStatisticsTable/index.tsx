import propTypes from "prop-types";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";

const AssemblyStatisticsTable = ({ assembly }: { assembly: AssemblyInterface }) => {
  const formatNumbers = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <div className="animate-grow-y flex items-center w-full h-full">
      <table className="w-full bg-white table-fixed">
        <tbody>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              DB name
            </td>
            <td className="px-4 truncate">{assembly.name}</td>
          </tr>
          {assembly.label && (
            <tr className="border border-gray-400">
              <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
                Label
              </td>
              <td className="px-4 truncate">{assembly.label}</td>
            </tr>
          )}
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              # of sequences
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.numberOfSequences)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Cumulative sequence length (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.cumulativeSequenceLength)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Largest sequence (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.largestSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Shortest sequence (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.shortestSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Mean sequenve length (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.meanSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Median sequence length (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.medianSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              N50 (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.n50)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              N90 (bp)
            </td>
            <td className="px-4 truncate">{formatNumbers(assembly.n90)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Type
            </td>
            <td className="px-4 truncate">{assembly.sequenceType.toUpperCase()}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              GC (%)
            </td>
            <td className="px-4 truncate">{assembly.gcPercent}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Added by
            </td>
            <td className="px-4 truncate">{assembly.username}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 font-semibold text-right border-r border-gray-400 truncate hover:whitespace-normal hover:text-ellipsis hover:overflow-visible">
              Added on
            </td>
            <td className="px-4 truncate">{assembly.addedOn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AssemblyStatisticsTable;

AssemblyStatisticsTable.defaultProps = { statistics: {} };

AssemblyStatisticsTable.propTypes = {
  statistics: propTypes.object.isRequired,
};
