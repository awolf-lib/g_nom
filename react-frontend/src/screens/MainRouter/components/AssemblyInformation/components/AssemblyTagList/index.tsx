import { AssemblyTagInterface } from "../../../../../../tsInterfaces/tsInterfaces";

const AssemblyTagList = ({ tags }: { tags: AssemblyTagInterface[] }) => {
  return (
    <div className="animate-fade-in flex flex-wrap items-center w-full h-full justify-around items-center bg-gray-600 px-4">
      {tags?.length > 0 &&
        tags.map((tag) => (
          <div className="rounded-full text-sm bg-white font-bold px-4 py-1 mx-2">{tag.tag}</div>
        ))}
    </div>
  );
};

export default AssemblyTagList;
