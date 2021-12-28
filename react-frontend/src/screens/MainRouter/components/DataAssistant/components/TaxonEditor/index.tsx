import { SetStateAction } from "react";
import { INcbiTaxon } from "../../../../../../api";
import TabWorkspace from "../../../../../../components/TabWorkspace";
import AssemblyPicker from "./components/AssemblyPicker";
import TaxonGeneralInformationEditor from "./components/TaxonGeneralInformationEditor";
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
            content: <TaxonGeneralInformationEditor taxon={taxon} />,
          },
        ]}
      />
    </div>
  );
};

export default TaxonEditor;
