import { INcbiTaxon, updateAssemblyLabel } from "../../../../../../../../api";
import { AssemblyInterface } from "../../../../../../../../tsInterfaces/tsInterfaces";
import EditLabelForm from "./components/EditLabelForm";

const EditAssemblyLabelForm = ({
  taxon,
  assembly,
  reloadAssembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
  reloadAssembly: any;
}) => {
  return (
    <div className="animate-grow-y">
      <div className="flex border-t border-b text-center px-4 py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        Edit assembly label...
      </div>
      <EditLabelForm
        target={assembly}
        reloadTarget={reloadAssembly}
        updateLabel={updateAssemblyLabel}
      />
    </div>
  );
};

export default EditAssemblyLabelForm;
