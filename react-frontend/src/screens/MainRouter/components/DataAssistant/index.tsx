import { useEffect, useState } from "react";
import { fetchImportDirectory } from "../../../../api";
import FileTree from "./components/FileTree/index";

const DataAssistant = () => {
  const [files, setFiles] = useState<any>({});

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const response = await fetchImportDirectory();
    setFiles(response.payload);
  };

  return (
    <div className="mb-64">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              Data assistant
            </h1>
          </div>
        </div>
      </header>
      <div className="grid grid-rows-3 grid-cols-2 gap-8">
        <div className="max-h-75 overflow-auto row-span-3">
          {files && <FileTree data={files} />}
        </div>
        <div
          className="bg-black text-white"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Test
        </div>
        <div>Test2</div>
      </div>
    </div>
  );
};

export default DataAssistant;
