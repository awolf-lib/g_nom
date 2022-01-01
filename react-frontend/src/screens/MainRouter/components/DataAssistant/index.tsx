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
              {taxon && taxon.id && assembly && assembly.id && assembly.label && (
                <span className="animate-fade-in text-lg font-semibold">
                  {" (alias " + assembly.label + ")"}
                </span>
              )}
            </h1>
          </div>
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
