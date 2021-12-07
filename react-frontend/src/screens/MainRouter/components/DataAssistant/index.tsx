import { useState } from "react";
import { INcbiTaxon } from "../../../../api";
import TaxonEditor from "./components/TaxonEditor";
import TaxonPicker from "./components/TaxonPicker";

const DataAssistant = () => {
  const [taxon, setTaxon] = useState<INcbiTaxon | undefined>();

  return (
    <div className="mb-16">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">Data assistant</h1>
          </div>
        </div>
      </header>

      <div className="p-2">
        <TaxonPicker getTaxon={setTaxon} />
      </div>

      {taxon && taxon.id && (
        <div className="p-2">
          <TaxonEditor taxon={taxon} />
        </div>
      )}
    </div>
  );
};

export default DataAssistant;
