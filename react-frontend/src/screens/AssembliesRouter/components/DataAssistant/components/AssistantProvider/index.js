import React from "react";

import UpdateImageForm from "./components/UpdateImageForm";
import RemoveImageForm from "./components/RemoveImageForm";
import UpdateGeneralInfosForm from "./components/UpdateGeneralInfosForm";

const AssistantProvider = (props) => {
  const { view } = props;
  const getIntroductions = () => {
    switch (props.mode) {
      case "Add image":
      case "Change image":
        return "3. Select image!";
      case "Remove image":
        return "3. Confirm or Cancel!";
      case "Add/update/remove info":
        return "3. Add, change or remove general infos!";

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
        return <RemoveImageForm {...props} />;
      case "Add/update/remove info":
        return <UpdateGeneralInfosForm {...props} level="taxon" />;

      default:
        break;
    }
  };
  return (
    <div>
      {props.mode && (
        <div className="mt-16 lg:mx-32 animate-grow-y shadow p-4 rounded-lg">
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
