const FileTree = ({ data }: { data: any }) => {
  const FileTreeConstructor = ({ data }: any) => (
    <ul>
      {data &&
        data.map((item: any) => (
          <li className="py-px">
            <label
              className="flex items-center max-w-max cursor-pointer"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text", JSON.stringify(item));
              }}
            >
              <div className="h-px w-16 bg-gray-400" />
              <span
                className={
                  item.type
                    ? "py-1 px-2 font-bold truncate select-none hover:text-blue-500"
                    : "py-1 px-2 truncate select-none hover:text-blue-500"
                }
              >
                {item.name && item.name}
              </span>
            </label>
            {item.children && (
              <div className="ml-4 border-l border-gray-400">
                <FileTreeConstructor data={item.children} />
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  return (
    <div className="overflow-hidden">
      {data && data.children && <FileTreeConstructor data={data.children} />}
    </div>
  );
};

export default FileTree;
