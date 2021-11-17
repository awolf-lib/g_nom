import FileTree from "./components/FileTree/index";
import ImportForm from "./components/ImportForm";

const DataAssistant = () => {
  return (
    <div className="mb-8">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              Data assistant
            </h1>
          </div>
        </div>
      </header>

      <div className="lg:grid grid-cols-2 gap-4 shadow m-2 p-1 border">
        <div className="overflow-auto border-2 shadow h-75">
          <FileTree />
        </div>
        <div className="overflow-auto border-2 shadow h-75 mt-4 lg:mt-0">
          <ImportForm />
        </div>
      </div>
    </div>
  );
};

export default DataAssistant;
