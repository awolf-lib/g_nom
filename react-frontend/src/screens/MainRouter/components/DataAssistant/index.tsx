import { Previous } from "grommet-icons";
import { useState } from "react";
import { fetchAssemblyByAssemblyID, fetchTaxonByTaxonID, INcbiTaxon } from "../../../../api";
import { AssemblyInterface } from "../../../../tsInterfaces/tsInterfaces";
import AssemblyEditor from "./components/AssemblyEditor";
import TaxonEditor from "./components/TaxonEditor";
import TaxonPicker from "./components/TaxonPicker";
import { useSearchParams } from "react-router-dom";

const DataAssistant: React.FC = () => {
  const [taxon, setTaxon] = useState<INcbiTaxon>();
  const [assembly, setAssembly] = useState<AssemblyInterface | undefined>();

  let [searchParams, setSearchParams] = useSearchParams();

  const handleBackToTaxonLevel = () => {
    setAssembly(undefined);
    let newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("assemblyID", JSON.stringify(undefined));
    setSearchParams(newSearchParams);
  };

  const reloadTaxon = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token) {
      if (taxon) {
        await fetchTaxonByTaxonID(taxon.id, userID, token).then((response) => {
          if (response?.payload) {
            setTaxon(response.payload);
          }
        });
      }
    }
  };

  const reloadAssembly = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token) {
      if (assembly) {
        await fetchAssemblyByAssemblyID(assembly.id, userID, token).then((response) => {
          if (response?.payload) {
            setAssembly(response.payload);
          }
        });
      }
    }
  };

  return (
    <div className="mb-16">
      <div className="h-1 bg-gradient-to-t from-gray-900 via-gray-500 to-gray-200" />
      <header className="z-20 flex justify-between items-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 text-white sticky top-16 py-6 px-4 text-xl font-bold shadow-lg border-b border-gray-500">
        <div className="flex justify-between items-center">
          <h1 className="mr-4 flex items-center">
            <div className="text-xl font-bold">Data assistant</div>
            {taxon?.scientificName && (
              <div className="flex justify-between items-center">
                <div className="px-2">{">"}</div>
                <div className="px-2 animate-fade-in">{taxon.scientificName}</div>
                {assembly?.label && assembly?.name && (
                  <div className="flex items-center animate-fade-in">
                    <div className="px-2">{">"}</div>
                    <div className="px-2">{assembly.label}</div>
                    <div className="px-2 font-normal">{"(" + assembly.name + ")"}</div>
                  </div>
                )}
                {!assembly?.label && assembly?.name && (
                  <div className="px-2 animate-fade-in">{"> " + assembly.name}</div>
                )}
              </div>
            )}
          </h1>
        </div>
      </header>

      <div className="mt-2 px-2">
        <TaxonPicker getTaxon={setTaxon} parentTaxon={taxon} />
      </div>

      <hr className="shadow my-4" />

      {taxon && taxon.id && !assembly && (
        <div className="px-2">
          <TaxonEditor taxon={taxon} getAssembly={setAssembly} setTaxon={setTaxon} />
        </div>
      )}

      {taxon && taxon.id && assembly && assembly.id && (
        <div className="px-2">
          <div
            className="max-w-max flex items-center bg-gray-500 text-white text-sm rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-400"
            onClick={() => handleBackToTaxonLevel()}
          >
            <Previous className="stroke-current" color="blank" size="small" />
            <span className="px-4">Back to taxon level...</span>
          </div>
          <hr className="shadow my-4" />
          <AssemblyEditor
            taxon={taxon}
            assembly={assembly}
            reloadTaxon={reloadTaxon}
            reloadAssembly={reloadAssembly}
          />
        </div>
      )}
    </div>
  );
};

export default DataAssistant;
