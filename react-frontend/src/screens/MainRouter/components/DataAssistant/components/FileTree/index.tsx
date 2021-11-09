import { Document, Folder, Refresh } from "grommet-icons";
import { useEffect, useState } from "react";
import { fetchImportDirectory } from "../../../../../../api";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";

const FileTree = () => {
  const [fileTree, setFileTree] = useState<any>({});
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  useEffect(() => {
    loadFiles();
  }, []);

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

      return { ...node, children: children, isOpen: false };
    }

    return { ...node, isOpen: false };
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
          <div key={item.id} className="py-1">
            <label
              className="flex items-center cursor-pointer hover:text-blue-500 w-full"
              onClick={() => setFileTree(toggleChildren(fileTree, item.id))}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text", JSON.stringify(item));
              }}
            >
              <div className="h-px w-4 bg-gray-400" />
              <div className="flex items-center py-px justify-between w-full">
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
                      item.type
                        ? "px-2 font-bold truncate select-none text-sm"
                        : "px-2 truncate select-none text-sm"
                    }
                  >
                    {item.name && item.name}
                  </span>
                </div>
                {item.children && (
                  <span
                    className={
                      item.type
                        ? "px-1 font-bold truncate select-none text-xs"
                        : "px-1 truncate select-none text-xs"
                    }
                  >
                    {"(" + item.children.length + ")"}
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
    <div className="overflow-hidden">
      <div className="flex items-center col-span-2">
        <h1 className="font-bold text-xl mx-4">Files</h1>
        <div
          className="bg-indigo-200 shadow-lg text-white text-xs cursor-pointer px-1 py-1 flex justify-center items-center rounded-lg transition duration-200"
          onClick={() => loadFiles()}
        >
          <Refresh className="stroke-current" size="small" color="blank" />
        </div>
      </div>
      {loadingFiles ? (
        <LoadingSpinner />
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
