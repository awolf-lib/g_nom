import { Previous } from "grommet-icons";
import { useState } from "react";
import { INcbiTaxon } from "../../../../api";
import { AssemblyInterface } from "../../../../tsInterfaces/tsInterfaces";
import AssemblyEditor from "./components/AssemblyEditor";
import TaxonEditor from "./components/TaxonEditor";
import TaxonPicker from "./components/TaxonPicker";

const DataAssistant: React.FC = () => {
  const [taxon, setTaxon] = useState<INcbiTaxon>();
  const [assembly, setAssembly] = useState<AssemblyInterface | undefined>();

  return (
    <div className="mb-16">
      <header className="bg-indigo-100 shadow sticky z-20 top-10">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-gray-900 mr-4">
              <span className="text-xl font-bold">Data assistant</span>
              {taxon && taxon.id && (
                <span className="animate-fade-in text-lg font-semibold">
                  {" > " + taxon?.scientificName}
                </span>
              )}
              {taxon && taxon.id && assembly && assembly.id && (
                <span className="animate-fade-in text-lg font-semibold">
                  {" > " + assembly.name}
                </span>
              )}
            </h1>
          </div>
        </div>
      </header>

      <div className="mt-2 px-2">
        <TaxonPicker getTaxon={setTaxon} />
      </div>

      <hr className="shadow my-4" />

      {taxon && taxon.id && !assembly && (
        <div className="px-2">
          <TaxonEditor taxon={taxon} getAssembly={setAssembly} />
        </div>
      )}

      {taxon && taxon.id && assembly && assembly.id && (
        <div className="px-2">
          <div
            className="max-w-max flex items-center bg-gray-500 text-white text-sm rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-400"
            onClick={() => setAssembly(undefined)}
          >
            <Previous className="stroke-current" color="blank" size="small" />
            <span className="px-4">Back to taxon level...</span>
          </div>
          <hr className="shadow my-4" />
          <AssemblyEditor taxon={taxon} assembly={assembly} />
        </div>
      )}
    </div>
  );
};

export default DataAssistant;
