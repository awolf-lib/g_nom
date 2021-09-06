import React from "react";

import UpdateImageForm from "./components/UpdateImageForm";
import RemoveConfirmationForm from "./components/RemoveConfirmationForm";
import UpdateGeneralInfosForm from "./components/UpdateGeneralInfosForm";
import CreateAssemblyForm from "./components/CreateAssemblyForm";
import RenameAssemblyForm from "./components/RenameAssemblyForm";
import AddAnnotationForm from "./components/AddAnnotationForm";
import AddMappingForm from "./components/AddMappingForm";
import AddAnalysisForm from "./components/AddAnalysisForm";
import EditAnalysisForm from "./components/EditAnalysisForm";
import CreateAssemblyBundleForm from "./components/CreateAssemblyBundleForm";

const AssistantProvider = (props) => {
  const { view } = props;
  const getIntroductions = () => {
    switch (props.mode) {
      case "Add image":
      case "Change image":
        return "3. Select image!";
      case "Remove image":
      case "Remove assembly":
        return "3. Confirm or cancel!";
      case "Add/update/remove info":
        return "3. Add, change or remove general infos!";
      case "Create new assembly":
        return "3. Enter assembly name and select .fasta!";
      case "Edit assembly - Rename":
        return "3. Enter new assembly name";
      case "Edit assembly - Add annotation":
        return "3. Enter annotation name and select .gff3!";
      case "Edit assembly - Add mapping":
        return "3. Enter mapping name and select .bam!";
      case "Edit assembly - Add analysis":
        return "3. Enter analysis name and select file!";
      case "Edit assembly - Edit annotation":
        return "3. Edit annotation name or remove!";
      case "Edit assembly - Edit mapping":
        return "3. Edit mapping name or remove!";
      case "Edit assembly - Edit analysis":
        return "3. Enter analysis name or remove!";

      default:
        break;
    }
  };

  const getAssistant = () => {
    switch (props.mode) {
      case "Add image":
      case "Change image":
        return <UpdateImageForm {...props} />;
      case "Remove image":
        return <RemoveConfirmationForm {...props} confirmationType="image" />;
      case "Add/update/remove info":
        return <UpdateGeneralInfosForm {...props} level="taxon" />;
      case "Create new assembly":
        return <CreateAssemblyForm {...props} />;
      case "Create bulk assemblies":
        return <CreateAssemblyBundleForm {...props} assemblies={[]} />;
      case "Remove assembly":
        return (
          <RemoveConfirmationForm {...props} confirmationType="assembly" />
        );
      case "Edit assembly - Rename":
        return <RenameAssemblyForm {...props} />;
      case "Edit assembly - Add annotation":
        return <AddAnnotationForm {...props} />;
      case "Edit assembly - Add mapping":
        return <AddMappingForm {...props} />;
      case "Edit assembly - Add analysis":
        return <AddAnalysisForm {...props} />;
      case "Edit assembly - Edit annotation":
        return <EditAnalysisForm {...props} type="annotation" />;
      case "Edit assembly - Edit mapping":
        return <EditAnalysisForm {...props} type="mapping" />;
      case "Edit assembly - Edit analysis":
        return <EditAnalysisForm {...props} type="analysis" />;

      default:
        break;
    }
  };
  return (
    <div>
      {props.mode && (
        <div className="mt-16 lg:mx-32 animate-grow-y shadow p-4 rounded-lg animate-grow-y">
          <div
            onClick={() => props.setView((prevState) => !prevState)}
            className="flex justify-between font-bold text-lg cursor-pointer select-none"
          >
            <div className="font-bold text-lg">{getIntroductions()}</div>
          </div>
          {view && (
            <div>
              <hr className="mt-4 mb-8 shadow" />
              {getAssistant()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantProvider;

AssistantProvider.defaultProps = {};

AssistantProvider.propTypes = {};
