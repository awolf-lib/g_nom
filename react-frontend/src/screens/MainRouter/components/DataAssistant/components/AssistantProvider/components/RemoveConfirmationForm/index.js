import React from "react";
import {removeImageByTaxonID, removeAssemblyByAssemblyID} from "../../../../../../../../api";

import Button from "../../../../../../../../components/Button";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const RemoveConfirmationForm = (props) => {
  const {
    handleModeChange,
    selectedTaxon,
    setSelectedTaxon,
    object,
    confirmationType,
  } = props;

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleConfirm = () => {
    switch (confirmationType) {
      case "image":
        handleRemoveImage();
        break;
      case "assembly":
        handleRemoveAssembly();
        break;

      default:
        break;
    }
  };

  const handleRemoveImage = async () => {
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      handleNewNotification({
        label: "Error",
        message: "Missing user ID information",
        type: "error",
      });
    }
    const response = await removeImageByTaxonID(
      selectedTaxon.ncbiTaxonID,
      userID
    );

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
    }

    if (response && response.payload) {
      handleModeChange("");
      setSelectedTaxon({ ...selectedTaxon, imageStatus: 0 });
    }
  };

  const handleRemoveAssembly = async () => {
    const response = await removeAssemblyByAssemblyID(object.id);

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
    }

    if (response && response.payload) {
      handleModeChange("");
    }
  };

  const getConfirmationText = () => {
    switch (confirmationType) {
      case "image":
        return (
          "Do you really want to remove image of taxon with NCBI taxonomy ID " +
          selectedTaxon.ncbiTaxonID +
          "?"
        );
      case "assembly":
        return "Do you really want to remove assembly '" + object.name + "'?";

      default:
        break;
    }
  };

  return (
    <div className="animate-grow-y">
      <div className="flex justify-center font-semibold mb-4">
        {getConfirmationText()}
      </div>
      <div className="flex justify-center items-center">
        <div className="w-32 mr-16">
          <Button
            label="Confirm"
            color="confirm"
            onClick={() => {
              handleConfirm();
            }}
          />
        </div>
        <div className="w-32">
          <Button
            label="Cancel"
            color="cancel"
            onClick={() => handleModeChange("")}
          />
        </div>
      </div>
    </div>
  );
};

export default RemoveConfirmationForm;

RemoveConfirmationForm.defaultProps = {};

RemoveConfirmationForm.propTypes = {};
