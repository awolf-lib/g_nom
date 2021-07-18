import React from "react";

import UpdateImageForm from "./components/UpdateImageForm";
import RemoveConfirmationForm from "./components/RemoveConfirmationForm";
import UpdateGeneralInfosForm from "./components/UpdateGeneralInfosForm";
import CreateAssemblyForm from "./components/CreateAssemblyForm";

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
      case "Remove assembly":
        return (
          <RemoveConfirmationForm {...props} confirmationType="assembly" />
        );

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
