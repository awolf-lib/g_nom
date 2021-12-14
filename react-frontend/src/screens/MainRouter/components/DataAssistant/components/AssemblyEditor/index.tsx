import { useEffect, useRef } from "react";
import { INcbiTaxon } from "../../../../../../api";
import TabWorkspace from "../../../../../../components/TabWorkspace";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import AddAssemblyTagForm from "./components/AddAssemblyTagForm";

const AssemblyEditor = ({
  taxon,
  assembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
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
          { label: "Tags", content: <AddAssemblyTagForm taxon={taxon} assembly={assembly} /> },
          { label: "General information (Assembly)", content: <div></div> },
          { label: "Annotations", content: <div></div> },
          { label: "Mappings", content: <div></div> },
          { label: "Analyses", content: <div></div> },
        ]}
      />
    </div>
  );
};

export default AssemblyEditor;
