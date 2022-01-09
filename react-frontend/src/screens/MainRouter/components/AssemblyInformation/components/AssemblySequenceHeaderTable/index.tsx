import { LinkDown, LinkTop, LinkUp } from "grommet-icons";
import { IAssemblySequenceHeader } from "../../../../../../api";
import { Dispatch, SetStateAction } from "react";
import Input from "../../../../../../components/Input";

const AssemblySequenceHeaderTable = ({
  sequenceHeaders,
  setSequenceHeaderSearch,
  setLocation,
  setOffset,
}: {
  sequenceHeaders: IAssemblySequenceHeader[];
  setSequenceHeaderSearch: Dispatch<SetStateAction<string>>;
  setLocation: Dispatch<SetStateAction<string>>;
  setOffset: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex bg-gray-500 text-white font-semibold py-1 border-b">
        <div className="w-1/2 truncate px-4 flex">SeqID</div>
        <div className="w-1/4 truncate px-4 text-center">Length (bp)</div>
        <div className="w-1/4 truncate px-4 text-center">GC local</div>
      </div>
      <div style={{ minHeight: "25rem" }}>
        {sequenceHeaders?.length > 0 ? (
          sequenceHeaders.map((header) => (
            <div
              key={header.id}
              onClick={() => setLocation(header.header)}
              className="flex items-center hover:text-blue-600 cursor-pointer hover:bg-blue-100 h-10 border-b w-full animate-grow-y"
            >
              <div className="w-1/2 truncate px-4">{header.header}</div>
              <div className="w-1/4 truncate px-4 text-center">{header.sequenceLength}</div>
              <div className="w-1/4 truncate px-4 text-center">{header.gcPercentLocal}</div>
            </div>
          ))
        ) : (
          <div className="flex py-1 border-b w-full">No headers!</div>
        )}
      </div>
      <div className="flex justify-around items-center w-full py-2 bg-gray-500 text-white select-none">
        <div className="flex items-center hover:bg-gray-400 cursor-pointer rounded-lg p-1 w-80">
          <Input
            placeholder="Search..."
            onChange={(e) => setSequenceHeaderSearch(e.target.value)}
          />
        </div>
        <div className="flex justify-around items-center">
          <div
            className="flex items-center hover:bg-gray-400 cursor-pointer rounded-lg py-2 transition px-4"
            onClick={() => setOffset((prevState) => (prevState - 10 < 0 ? 0 : prevState - 10))}
          >
            <LinkUp className="stroke-current" color="blank" />
          </div>
          <div
            className="flex items-center hover:bg-gray-400 cursor-pointer rounded-lg py-2 transition px-4"
            onClick={() =>
              setOffset((prevState) => (sequenceHeaders.length < 10 ? prevState : prevState + 10))
            }
          >
            <LinkDown className="stroke-current" color="blank" />
          </div>
          <div
            className="flex items-center hover:bg-gray-400 cursor-pointer rounded-lg py-2 transition px-4"
            onClick={() => setOffset(0)}
          >
            <LinkTop className="stroke-current" color="blank" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssemblySequenceHeaderTable;
