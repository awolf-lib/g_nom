import React, { useEffect, useState } from "react";

import Input from "../../../../../../../../components/Input";
import {fetchPossibleImports, updateImageByTaxonID} from "../../../../../../../../api";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import Button from "../../../../../../../../components/Button";

const UpdateImageForm = (props) => {
  const { selectedTaxon, setSelectedTaxon, handleModeChange } = props;

  const [mounted, setMounted] = useState(true);
  const [possibleImports, setPossibleImports] = useState([]);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [selectedPath, setSelectedPath] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadFiles(["image"]);

    return setMounted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadFiles = async (types = undefined) => {
    setFetchingAll(true);
    const response = await fetchPossibleImports(types);
    if (response && response.payload && mounted) {
      setPossibleImports(response.payload);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setFetchingAll(false);
  };

  const handleSubmitImport = async () => {
    setProcessing(true);
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      handleNewNotification({
        label: "Error",
        message: "Missing user ID information",
        type: "error",
      });
    }
    const response = await updateImageByTaxonID(
      selectedTaxon.ncbiTaxonID,
      selectedPath.join("/"),
      userID
    );

    if (response && response.payload) {
      setSelectedTaxon({ ...selectedTaxon, imageStatus: 1 });
      handleModeChange("");
      setShowConfirmationForm(false);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setProcessing(false);
  };

  const handleChangeSelectedPath = (inputPathArray) => {
    setShowConfirmationForm(true);
    setSelectedPath(inputPathArray);
  };

  return (
    <div className="animate-grow-y">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-grow-y">
        {possibleImports &&
        possibleImports.image &&
        Object.keys(possibleImports.image).length > 0 ? (
          Object.keys(possibleImports.image).map((extension) => {
            return (
              <div key={extension}>
                <div>{extension}</div>
                <hr className="shadow my-2" />
                <ul>
                  {possibleImports.image[extension].map((pathArray, index) => {
                    return (
                      <li
                        className="flex items-center ml-4"
                        key={extension + index}
                        onClick={() => handleChangeSelectedPath(pathArray)}
                      >
                        <Input
                          type="radio"
                          value={pathArray}
                          size="sm"
                          checked={pathArray === selectedPath}
                          onChange={() => handleChangeSelectedPath(pathArray)}
                        />
                        <div className="ml-4">{pathArray.join("/")}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 text-center">
            {!fetchingAll ? (
              "No supported images detected!"
            ) : (
              <div className="flex justify-center">
                <LoadingSpinner label="Fetching..." />
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmationForm && (
        <div className="mt-16">
          <hr className="shadow my-4" />
          {selectedPath && selectedPath.length > 0 && (
            <div className="animate-grow-y">
              <div>
                <hr className="mt-4 mb-8 shadow" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="shadow rounded-lg p-4 h-full">
                    <div className="flex justify-between items-center h-full">
                      <span>Main import:</span>
                      <span className="font-semibold">
                        {selectedPath[selectedPath.length - 1]}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center shadow rounded-lg p-4">
                    <div className="w-32 mr-16">
                      <Button
                        label={processing ? "Processing..." : "Submit"}
                        color="confirm"
                        onClick={() => handleSubmitImport()}
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateImageForm;

UpdateImageForm.defaultProps = {};

UpdateImageForm.propTypes = {};
