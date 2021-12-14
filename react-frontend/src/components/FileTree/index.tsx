import { Contract, Document, Expand, Folder, Refresh } from "grommet-icons";
import { useEffect, useState } from "react";
import { fetchImportDirectory, IImportFileInformation } from "../../api";
import LoadingSpinner from "../LoadingSpinner";

const FileTree: React.FC = () => {
  const [fileTree, setFileTree] = useState<TreeNode>();
  const [expandTree, setExpandTree] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandTree]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");
    const response = await fetchImportDirectory(userID, token);
    if (response && response.payload) {
      setFileTree(addFileTreeAttributes(response.payload));
    } else {
      setFileTree(undefined);
    }
    setLoadingFiles(false);
  };

  interface TreeNode extends IImportFileInformation {
    isOpen?: boolean;
  }

  const addFileTreeAttributes = (node: TreeNode): TreeNode => {
    if (node.children) {
      const children = node.children.map((child: TreeNode) => {
        return addFileTreeAttributes(child);
      });

      return { ...node, children: children, isOpen: expandTree };
    }

    return { ...node, isOpen: expandTree };
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
                      item.type || item.dirType
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
    <div className="m-4">
      <div className="flex justify-between mb-1">
        <h1 className="font-bold text-xl mx-4">Files</h1>
        <div className="flex justify-between w-16 items-center">
          <div
            className="bg-indigo-200 shadow text-white text-xs cursor-pointer px-1 py-1 flex justify-center items-center rounded-lg transition duration-200 hover:bg-indigo-300"
            onClick={() => setExpandTree((prevState) => !prevState)}
          >
            {!expandTree ? (
              <Expand className="stroke-current" size="small" color="blank" />
            ) : (
              <Contract className="stroke-current" size="small" color="blank" />
            )}
          </div>
          <div
            className="bg-indigo-200 shadow text-white text-xs cursor-pointer px-1 py-1 flex justify-center items-center rounded-lg transition duration-200 hover:bg-indigo-300"
            onClick={() => loadFiles()}
          >
            <Refresh className="stroke-current" size="small" color="blank" />
          </div>
        </div>
      </div>
      {loadingFiles ? (
        <div className="ml-4">
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          {fileTree && fileTree.children && <FileTreeConstructor data={fileTree.children} />}
        </div>
      )}
    </div>
  );
};

export default FileTree;
