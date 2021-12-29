import { SetStateAction } from "react";
import { INcbiTaxon } from "../../../../../../api";
import TabWorkspace from "../../../../../../components/TabWorkspace";
import AssemblyPicker from "./components/AssemblyPicker";
import GeneralInformationEditor from "./components/GeneralInformationEditor";
import TaxonImageEditor from "./components/TaxonImageEditor";

const TaxonEditor = ({
  taxon,
  getAssembly,
  setTaxon,
}: {
  taxon: INcbiTaxon;
  getAssembly: SetStateAction<any>;
  setTaxon: SetStateAction<any>;
}) => {
  return (
    <div className="animate-grow-y">
      <TabWorkspace
        tabs={[
          {
            label: "Assemblies",
            content: <AssemblyPicker taxon={taxon} getAssembly={getAssembly} />,
          },
          {
            label: "Image",
            content: <TaxonImageEditor taxon={taxon} setTaxon={setTaxon} />,
          },
          {
            label: "General information (Taxon)",
            content: <GeneralInformationEditor target={taxon} level="taxon" />,
          },
        ]}
      />
    </div>
  );
};

export default TaxonEditor;
