import classNames from "classnames";
import { Down, Up } from "grommet-icons";
import { SetStateAction } from "react";
import { INcbiTaxon } from "../../../../../../api";
import TabWorkspace from "../../../../../../components/TabWorkspace";
import AssemblyPicker from "./components/AssemblyPicker";
import TaxonGeneralInformationEditor from "./components/TaxonGeneralInformationEditor";

const TaxonEditor = ({
  taxon,
  getAssembly,
}: {
  taxon: INcbiTaxon;
  getAssembly: SetStateAction<any>;
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
            label: "General information (Taxon)",
            content: <TaxonGeneralInformationEditor taxon={taxon} />,
          },
        ]}
      />
    </div>
  );
};

export default TaxonEditor;
