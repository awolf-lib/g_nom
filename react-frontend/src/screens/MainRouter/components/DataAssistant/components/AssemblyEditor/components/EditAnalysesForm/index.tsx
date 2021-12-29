import { INcbiTaxon } from "../../../../../../../../api";
import TabWorkspace from "../../../../../../../../components/TabWorkspace";
import { AssemblyInterface } from "../../../../../../../../tsInterfaces/tsInterfaces";
import EditBuscosForm from "./components/EditBuscosForm";
import EditFcatsForm from "./components/EditFcatsForm";
import EditMiltsForm from "./components/EditMiltsForm";
import EditRepeatmaskersForm from "./components/EditRepeatmaskersForm";

const EditAnalysesForm = ({
  taxon,
  assembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
}) => {
  return (
    <div className="animate-grow-y">
      <div className="flex border-t border-b text-center py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        <div className="px-4">Choose analyses type...</div>
      </div>
      <div className="min-h-1/4 max-h-1/2 mt-4">
        <TabWorkspace
          tabs={[
            { label: "Busco", content: <EditBuscosForm taxon={taxon} assembly={assembly} /> },
            { label: "fCat", content: <EditFcatsForm taxon={taxon} assembly={assembly} /> },
            { label: "Milts", content: <EditMiltsForm taxon={taxon} assembly={assembly} /> },
            {
              label: "Repeatmasker",
              content: <EditRepeatmaskersForm taxon={taxon} assembly={assembly} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default EditAnalysesForm;
