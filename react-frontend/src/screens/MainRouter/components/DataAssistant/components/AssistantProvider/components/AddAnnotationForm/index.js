import React, { useState, useEffect } from "react";
import classNames from "classnames";

import {addNewAnnotation, fetchPossibleImports} from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const AddAnnotationForm = (props) => {
  const { selectedTaxon, handleModeChange } = props;

  const [possibleImports, setPossibleImports] = useState([]);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [newAnalysisName, setNewAnalysisName] = useState("");
  const [selectedPath, setSelectedPath] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadFiles(["gff"]);
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
    if (response && response.payload) {
      setPossibleImports(response.payload);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setFetchingAll(false);
  };

  const handleSubmitImport = async () => {
    if (importing) {
      handleNewNotification({
        label: "Info",
        message: "Import is still running. Please wait...!",
        type: "info",
      });
      return;
    }
    if (!selectedTaxon.id) {
      handleNewNotification({
        label: "Error",
        message: "Missing internal taxon ID!",
        type: "error",
      });
      return;
    }
    if (!newAnalysisName) {
      handleNewNotification({
        label: "Error",
        message: "Missing new annotation name!",
        type: "error",
      });
      return;
    }
    if (!selectedPath.length) {
      handleNewNotification({
        label: "Error",
        message: "Missing path to gff!",
        type: "error",
      });
      return;
    }
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      handleNewNotification({
        label: "Error",
        message: "Missing user ID information!",
        type: "error",
      });
      return;
    }
    setImporting(true);
    const response = await addNewAnnotation(
      props.object.id,
      newAnalysisName.replace(/ /g, "_"),
      selectedPath.join("/"),
      userID,
      additionalFiles.join("/")
    );
    if (response && response.payload) {
      setShowConfirmationForm(false);
    }
    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setImporting(false);
    handleModeChange("");
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
    if (inputPathArrayAddtionalFiles.length < inputPathArray.length) {
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
    <div className="animate-grow-y">
      <div className="flex items-center">
        <div className="w-64 font-semibold">New annotation name:</div>
        <Input
          placeholder="max. 400 characters"
          onChange={(e) => setNewAnalysisName(e.target.value)}
        />
      </div>
      <hr className="shadow my-8" />
      <div className="grid grid-cols-1 gap-8">
        {possibleImports &&
        possibleImports.gff &&
        Object.keys(possibleImports.gff).length > 0 ? (
          Object.keys(possibleImports.gff).map((extension) => {
            return (
              <div key={extension}>
                <div className="font-semibold">{extension}</div>
                <hr className="shadow my-2" />
                <ul>
                  {possibleImports.gff[extension].map((pathArray, index) => {
                    return (
                      <li
                        key={extension + index}
                        className="flex items-center ml-4"
                      >
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
                                key={extension + dir + dirIndex}
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
              "No supported files detected!"
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
                    <div
                      className={
                        importing ? "w-32 mr-16 animate-pulse" : "w-32 mr-16"
                      }
                    >
                      <Button
                        label={importing ? "Processing..." : "Submit"}
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

export default AddAnnotationForm;

AddAnnotationForm.defaultProps = {};

AddAnnotationForm.propTypes = {};
