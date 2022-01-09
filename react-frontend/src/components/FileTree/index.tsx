import { Contract, Document, Expand, Folder, Refresh } from "grommet-icons";
import { useEffect, useState } from "react";
import { IImportFileInformation, TreeNode } from "../../api";
import LoadingSpinner from "../LoadingSpinner";

const FileTree = ({
  label,
  files,
  reloadFiles,
  loadingFiles,
}: {
  label?: string;
  files: IImportFileInformation;
  reloadFiles?: any;
  loadingFiles?: boolean;
}) => {
  const [fileTree, setFileTree] = useState<TreeNode>();

  useEffect(() => {
    setFileTree(addFileTreeAttributes(files));
  }, [files]);

  useEffect(() => {
    reloadFiles && reloadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFileTreeAttributes = (node: TreeNode): TreeNode => {
    if (node.children) {
      const children = node.children.map((child: TreeNode) => {
        return addFileTreeAttributes(child);
      });

      return { ...node, children: children, isOpen: false };
    }

    return { ...node, isOpen: false };
  };

  const toggleChildren = (node: TreeNode, id: string): TreeNode => {
    if (node.children) {
      const children = node.children.map((child: TreeNode) => {
        return toggleChildren(child, id);
      });
      return {
        ...node,
        children: children,
        isOpen: id === node.id ? !node.isOpen : node.isOpen,
      };
    }
    return { ...node, isOpen: id === node.id ? !node.isOpen : node.isOpen };
  };

  const FileTreeConstructor = ({ data }: { data: TreeNode[] }) => (
    <div>
      {data &&
        data.map((item) => (
          <div key={item.id} className="py-px">
            <label
              className="flex items-center cursor-pointer hover:text-blue-500 w-full"
              onClick={() => fileTree && setFileTree(toggleChildren(fileTree, item.id))}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("fileInfos", JSON.stringify(item));
              }}
            >
              <div className="h-px w-4 bg-gray-400" />
              <div className="flex items-center justify-between w-full">
                <div>
                  {item.children ? (
                    <Folder className="stroke-current mx-2" color="blank" size="small" />
                  ) : (
                    <Document className="stroke-current mx-2" color="blank" size="small" />
                  )}
                  <span
                    className={
                      item.type || item.dirType || item.additionalFilesType
                        ? "px-2 font-bold truncate select-none text-xs"
                        : "px-2 truncate select-none text-xs"
                    }
                  >
                    {item.name && item.name}
                  </span>
                </div>
                {item.dirType && (
                  <span className="px-1 truncate select-none text-xs font-bold">
                    {item.dirType}
                  </span>
                )}
                {Object.keys(item).includes("size") && (
                  <span className="px-1 truncate select-none text-xs">
                    {item.size! > 0
                      ? "(" + item.size!.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " mb)"
                      : "(<1 mb)"}
                  </span>
                )}
              </div>
            </label>
            {item.children && item.isOpen && (
              <div className="ml-7 border-l border-gray-400">
                <FileTreeConstructor data={item.children} />
              </div>
            )}
          </div>
        ))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between mb-1">
        <div>{label && <h1 className="font-bold text-xl">{label}</h1>}</div>
        {reloadFiles && (
          <div
            className="bg-indigo-200 shadow text-white text-xs cursor-pointer px-1 py-1 flex justify-center items-center rounded-lg transition duration-200 hover:bg-indigo-300"
            onClick={() => reloadFiles && reloadFiles()}
          >
            <Refresh className="stroke-current" size="small" color="blank" />
          </div>
        )}
      </div>
      {loadingFiles ? (
        <div className="ml-4">
          <LoadingSpinner label="Loading..." />
        </div>
      ) : (
        <div>{fileTree && <FileTreeConstructor data={[fileTree]} />}</div>
      )}
    </div>
  );
};

export default FileTree;
