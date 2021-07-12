import React, { useEffect, useState } from "react";
import classNames from "classnames";

import Input from "../../../../../../../../components/Input";
import API from "../../../../../../../../api";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import Button from "../../../../../../../../components/Button";

const UpdateImageForm = (props) => {
  const { selectedTaxon, setSelectedTaxon, handleModeChange } = props;

  const [possibleImports, setPossibleImports] = useState([]);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [selectedPath, setSelectedPath] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]);

  useEffect(() => {
    loadFiles(["image"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const loadFiles = async (types = undefined) => {
    setFetchingAll(true);
    const response = await api.fetchPossibleImports(types);
    if (response && response.payload) {
      setPossibleImports(response.payload);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setFetchingAll(false);
  };

  const handleSubmitImport = async () => {
    const response = await api.updateImageByTaxonID(
      selectedTaxon.ncbiTaxonID,
      selectedPath.join("/")
    );

    if (response && response.payload) {
      setSelectedTaxon({ ...selectedTaxon, imageStored: 1 });
      handleModeChange("");
      setShowConfirmationForm(false);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
  };

  const handleChangeSelectedPath = (inputPathArray) => {
    setShowConfirmationForm(true);
    setSelectedPath(inputPathArray);
    setAdditionalFiles([]);
  };

  const handleAdditionalFiles = (
    inputPathArray,
    inputPathArrayAddtionalFiles
  ) => {
    setShowConfirmationForm(true);
    setSelectedPath(inputPathArray);
    if (inputPathArrayAddtionalFiles.length !== selectedPath.length) {
      setAdditionalFiles(inputPathArrayAddtionalFiles);
    } else {
      setAdditionalFiles([]);
    }
  };

  const getDirectoryClass = (index, pathArray) =>
    classNames("hover:text-blue-600 cursor-pointer", {
      "text-blue-600 font-bold":
        index === pathArray.length - 1 && pathArray === selectedPath,
      "text-green-600 font-semibold":
        index < pathArray.length - 1 &&
        pathArray === selectedPath &&
        index >= additionalFiles.length - 1 &&
        additionalFiles.length > 0,
    });
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {possibleImports &&
        possibleImports.image &&
        Object.keys(possibleImports.image).length > 0 ? (
          Object.keys(possibleImports.image).map((extension) => {
            return (
              <div>
                <div>{extension}</div>
                <hr className="shadow my-2" />
                <ul>
                  {possibleImports.image[extension].map((pathArray) => {
                    return (
                      <li className="flex items-center ml-4">
                        <Input
                          type="radio"
                          value={pathArray}
                          size="sm"
                          onChange={() => handleChangeSelectedPath(pathArray)}
                          checked={pathArray === selectedPath}
                        />
                        <div className="ml-4">
                          {pathArray.map((dir, dirIndex) => {
                            return (
                              <span
                                onClick={() =>
                                  handleAdditionalFiles(
                                    pathArray,
                                    pathArray.slice(0, dirIndex + 1)
                                  )
                                }
                                className={getDirectoryClass(
                                  dirIndex,
                                  pathArray
                                )}
                              >
                                {"/" + dir}
                              </span>
                            );
                          })}
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="shadow rounded-lg p-4">
                    <div className="flex justify-between">
                      <span>Main import:</span>
                      <span className="font-semibold">
                        {selectedPath[selectedPath.length - 1]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional files:</span>
                      {additionalFiles.length ? (
                        <span>{"./" + additionalFiles.join("/") + "/*"}</span>
                      ) : (
                        <span>None</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center items-center shadow rounded-lg p-4">
                    <div className="w-32 mr-16">
                      <Button
                        label="Submit"
                        color="confirm"
                        onClick={() => handleSubmitImport()}
                      />
                    </div>
                    <div className="w-32">
                      <Button
                        label="Cancel"
                        color="cancel"
                        onClick={() => {}}
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
