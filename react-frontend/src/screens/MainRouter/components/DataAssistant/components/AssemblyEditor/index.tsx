import { useEffect, useRef } from "react";
import { INcbiTaxon } from "../../../../../../api";
import TabWorkspace from "../../../../../../components/TabWorkspace";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import NewDataImportForm from "../TaxonEditor/components/AssemblyPicker/components/NewDataImportForm";
import GeneralInformationEditor from "../TaxonEditor/components/GeneralInformationEditor";
import AddAssemblyTagForm from "./components/AddAssemblyTagForm";
import EditAnalysesForm from "./components/EditAnalysesForm";
import EditAnnotationsForm from "./components/EditAnnotationsForm";
import EditAssemblyLabelForm from "./components/EditAssemblyLabelForm";
import EditMappingsForm from "./components/EditMappingsForm";

const AssemblyEditor = ({
  taxon,
  assembly,
  reloadTaxon,
  reloadAssembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
  reloadTaxon: any;
  reloadAssembly: any;
}) => {
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusRef) {
      focusRef.current?.scrollIntoView();
    }
  }, [focusRef]);

  return (
    <div className="animate-grow-y">
      <TabWorkspace
        tabs={[
          {
            label: "Label",
            content: (
              <EditAssemblyLabelForm
                taxon={taxon}
                assembly={assembly}
                reloadAssembly={reloadAssembly}
              />
            ),
          },
          { label: "Tags", content: <AddAssemblyTagForm taxon={taxon} assembly={assembly} /> },
          {
            label: "General information (Assembly)",
            content: <GeneralInformationEditor target={assembly} level="assembly" />,
          },
          {
            label: "Annotations",
            content: <EditAnnotationsForm taxon={taxon} assembly={assembly} />,
          },
          { label: "Mappings", content: <EditMappingsForm taxon={taxon} assembly={assembly} /> },
          { label: "Analyses", content: <EditAnalysesForm taxon={taxon} assembly={assembly} /> },
          {
            label: "Add data",
            content: (
              <NewDataImportForm taxon={taxon} assembly={assembly} loadAssemblies={undefined} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default AssemblyEditor;
