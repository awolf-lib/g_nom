import React from "react";
import API from "../../../../../../../../api";

import Button from "../../../../../../../../components/Button";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const RemoveImageForm = (props) => {
  const { handleModeChange, selectedTaxon, setSelectedTaxon } = props;

  const api = new API();

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleRemoveImage = async () => {
    const response = await api.removeImageByTaxonID(selectedTaxon.ncbiTaxonID);

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }

    if (response && response.payload) {
      handleModeChange("");
      setSelectedTaxon({ ...selectedTaxon, imageStored: 0 });
    }
  };

  return (
    <div>
      <div className="flex justify-center font-semibold mb-4">
        {"Do you really want to remove the image of taxon with NCBI taxonomy ID " +
          selectedTaxon.ncbiTaxonID +
          "?"}
      </div>
      <div className="flex justify-center items-center">
        <div className="w-32 mr-16">
          <Button
            label="Confirm"
            color="confirm"
            onClick={() => {
              handleRemoveImage();
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

export default RemoveImageForm;

RemoveImageForm.defaultProps = {};

RemoveImageForm.propTypes = {};
