import propTypes from "prop-types";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";

const AssemblyStatisticsTable = ({ assembly }: { assembly: AssemblyInterface }) => {
  const length_distribution = JSON.parse(assembly.lengthDistributionString);

  const formatNumbers = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <div className="animate-grow-y flex items-center w-full h-full">
      <table className="w-full bg-white table-fixed">
        <tbody>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              DB name
            </td>
            <td className="px-4">{assembly.name}</td>
          </tr>
          {assembly.label && (
            <tr className="border border-gray-400">
              <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
                Label
              </td>
              <td className="px-4">{assembly.label}</td>
            </tr>
          )}
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              # of sequences
            </td>
            <td className="px-4">{formatNumbers(assembly.numberOfSequences)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Cumulative sequence length (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.cumulativeSequenceLength)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Largest sequence (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.largestSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Shortest sequence (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.shortestSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Mean sequenve length (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.meanSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Median sequence length (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.medianSequence)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              N50 (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.n50)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              N90 (bp)
            </td>
            <td className="px-4">{formatNumbers(assembly.n90)}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Type
            </td>
            <td className="px-4">{assembly.sequenceType.toUpperCase()}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              GC (%)
            </td>
            <td className="px-4">{assembly.gcPercent}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Added by
            </td>
            <td className="px-4">{assembly.username}</td>
          </tr>
          <tr className="border border-gray-400">
            <td className="px-4 py-3 text-sm lg:text-base font-semibold text-right border-r border-gray-400">
              Added on
            </td>
            <td className="px-4">{assembly.addedOn}</td>
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
