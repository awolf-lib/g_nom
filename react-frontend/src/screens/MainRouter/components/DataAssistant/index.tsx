import { useState } from "react";
import { INcbiTaxon } from "../../../../api";
import { AssemblyInterface } from "../../../../tsInterfaces/tsInterfaces";
import AssemblyEditor from "./components/AssemblyEditor";
import TaxonEditor from "./components/TaxonEditor";
import TaxonPicker from "./components/TaxonPicker";

const DataAssistant: React.FC = () => {
  const [taxon, setTaxon] = useState<INcbiTaxon>();
  const [assembly, setAssembly] = useState<AssemblyInterface>();

  return (
    <div className="mb-16">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              <span>Data assistant</span>
              {taxon && taxon.id && (
                <span className="animate-fade-in">{" > " + taxon?.scientificName}</span>
              )}
              {taxon && taxon.id && assembly && assembly.id && (
                <span className="animate-fade-in">{" > " + assembly.name}</span>
              )}
            </h1>
          </div>
        </div>
      </header>

      <div className="p-2">
        <TaxonPicker getTaxon={setTaxon} />
      </div>

      {taxon && taxon.id && !assembly && (
        <div className="p-2">
          <TaxonEditor taxon={taxon} getAssembly={setAssembly} />
        </div>
      )}

      {taxon && taxon.id && assembly && assembly.id && (
        <div className="p-2">
          <AssemblyEditor taxon={taxon} assembly={assembly} />
        </div>
      )}
    </div>
  );
};

export default DataAssistant;
