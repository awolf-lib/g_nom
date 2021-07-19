import React, { useState } from "react";
import API from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const RenameAssemblyForm = ({ object, handleModeChange }) => {
  const [newAssemblyName, setNewAssemblyName] = useState("");

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

  const handleSubmit = async () => {
    if (object && object.id && newAssemblyName) {
      const response = await api.renameAssembly(
        object.id,
        newAssemblyName.replace(/ /g, "_")
      );

      if (response && response.notification && response.notification.message) {
        handleNewNotification(response.notification);
      }

      if (response && response.payload) {
        handleModeChange("");
      }
    }
  };
  return (
    <div className="lg:flex justify-around items-center">
      <div>
        <div className="flex justify-between items-center my-4">
          <div className="w-64 font-semibold" htmlFor="newAssemblyName">
            Current name:
          </div>
          <div
            className="w-64 text-center font-semibold"
            htmlFor="newAssemblyName"
          >
            {object.name}
          </div>
        </div>
        <div className="flex justify-between items-center my-4">
          <label className="w-64 font-semibold" htmlFor="newAssemblyName">
            New name:
          </label>
          <div className="w-64">
            <Input
              id="newAssemblyName"
              onChange={(e) => setNewAssemblyName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-around mt-8 lg:my-0 lg:w-96">
        <div className="w-32">
          <Button
            onClick={() => {
              handleSubmit();
              handleModeChange("");
            }}
            label="Submit"
            color="confirm"
          />
        </div>
        <div className="w-32">
          <Button
            onClick={() => {
              handleModeChange("");
            }}
            label="Cancel"
            color="cancel"
          />
        </div>
      </div>
    </div>
  );
};

export default RenameAssemblyForm;

RenameAssemblyForm.defaultProps = {};

RenameAssemblyForm.propTypes = {};
