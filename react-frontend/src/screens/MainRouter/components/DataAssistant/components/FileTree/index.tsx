import { Contract, Document, Expand, Folder, Refresh } from "grommet-icons";
import { useEffect, useState } from "react";
import { fetchImportDirectory } from "../../../../../../api";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";

const FileTree = () => {
  const [fileTree, setFileTree] = useState<any>({});
  const [expandTree, setExpandTree] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  useEffect(() => {
    loadFiles();
  }, [expandTree]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    const response = await fetchImportDirectory();
    if (response && response.payload) {
      setFileTree(addFileTreeAttributes(response.payload));
    } else {
      setFileTree({});
    }
    setLoadingFiles(false);
  };

  const addFileTreeAttributes = (node: any) => {
    if (node.children) {
      const children = node.children.map((child: any) => {
        return addFileTreeAttributes(child);
      });

      return { ...node, children: children, isOpen: expandTree };
    }

    return { ...node, isOpen: expandTree };
  };

  const toggleChildren = (node: any, id: any) => {
    if (node.children) {
      const children = node.children.map((child: any) => {
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

  const FileTreeConstructor = ({ data }: any) => (
    <div>
      {data &&
        data.map((item: any) => (
          <div key={item.id} className="py-px">
            <label
              className="flex items-center cursor-pointer hover:text-blue-500 w-full"
              onClick={() => setFileTree(toggleChildren(fileTree, item.id))}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text", JSON.stringify(item));
              }}
            >
              <div className="h-px w-4 bg-gray-400" />
              <div className="flex items-center justify-between w-full">
                <div>
                  {item.children ? (
                    <Folder
                      className="stroke-current mx-2"
                      color="blank"
                      size="small"
                    />
                  ) : (
                    <Document
                      className="stroke-current mx-2"
                      color="blank"
                      size="small"
                    />
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
    <div className="overflow-hidden m-4">
      <div className="flex justify-between mb-1">
        <h1 className="font-bold text-xl mx-4">Files</h1>
        <div className="flex justify-between w-16 items-center">
          <div
            className="bg-indigo-200 shadow text-white text-xs cursor-pointer px-1 py-1 flex justify-center items-center rounded-lg transition duration-200 hover:bg-indigo-300"
            onClick={() => setExpandTree((prevState: any) => !prevState)}
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
          {fileTree && fileTree.children && (
            <FileTreeConstructor data={fileTree.children} />
          )}
        </div>
      )}
    </div>
  );
};

export default FileTree;
