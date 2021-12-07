import classNames from "classnames";
import { useState } from "react";
import { INcbiTaxon } from "../../../../../../api";
import AssemblyPicker from "./components/AssemblyPicker";
import TaxonGeneralInformationEditor from "./components/TaxonGeneralInformationEditor";

const TaxonEditor = ({ taxon }: { taxon: INcbiTaxon }) => {
  const [activeTab, setActiveTab] = useState<"assemblies" | "generalInformation">("assemblies");
  const activeTabClass = (tab: "assemblies" | "generalInformation") =>
    classNames(
      "px-8 py-1 text-xs rounded-t-lg mx-3 transition duration-300 text-white select-none shadow z-10",
      {
        "bg-gray-400 hover:bg-gray-500 cursor-pointer": activeTab !== tab,
        "transform scale-110 bg-gray-500 -translate-y-px": activeTab === tab,
      }
    );
  return (
    <div className="animate-grow-y">
      <div className="">
        <div className="flex">
          <div onClick={() => setActiveTab("assemblies")} className={activeTabClass("assemblies")}>
            Assemblies
          </div>
          <div
            onClick={() => setActiveTab("generalInformation")}
            className={activeTabClass("generalInformation")}
          >
            General information
          </div>
        </div>
        <div className="border-t-2 border-gray-500">
          {activeTab === "assemblies" && (
            <div className="animate-grow-y">
              <AssemblyPicker taxon={taxon} />
            </div>
          )}
          {activeTab === "generalInformation" && (
            <div className="animate-grow-y">
              <TaxonGeneralInformationEditor taxon={taxon} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxonEditor;
