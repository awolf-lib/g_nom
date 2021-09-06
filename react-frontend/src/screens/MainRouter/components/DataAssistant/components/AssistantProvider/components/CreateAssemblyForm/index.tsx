import { useState, useEffect, ChangeEvent } from "react";
import API from "../../../../../../../../api";
import classNames from "classnames";

import PropTypes, { InferProps } from "prop-types";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import Button from "../../../../../../../../components/Button";

import { useNotification } from "../../../../../../../../components/NotificationProvider";

export function CreateAssemblyForm(props: InferProps<typeof CreateAssemblyForm.propTypes>){
  const { selectedTaxon, handleModeChange } = props;

  const [possibleImports, setPossibleImports] = useState<{fasta: {[key: string]: string[][]}}>();
  const [fetchingAll, setFetchingAll] = useState(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [newAssemblyName, setNewAssemblyName] = useState("");
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadFiles(["fasta"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api = new API();

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: {label: string, message: string, type: string}) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadFiles = async (types: string[] | undefined = undefined) => {
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

  const handleSubmitImport = async () =>  {
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
    if (!newAssemblyName) {
      handleNewNotification({
        label: "Error",
        message: "Missing new assembly name!",
        type: "error",
      });
      return;
    }
    if (!selectedPath.length) {
      handleNewNotification({
        label: "Error",
        message: "Missing path to fasta!",
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
    const response = await api.addNewAssembly(
      selectedTaxon.id,
      newAssemblyName.replace(/ /g, "_"),
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

  const handleChangeSelectedPath = (inputPathArray: string[]) => {
    setShowConfirmationForm(true);
    setSelectedPath(inputPathArray);
    setAdditionalFiles([]);
  };

  const handleAdditionalFiles = (
    inputPathArray: string[],
    inputPathArrayAddtionalFiles: string[]
  ) => {
    setShowConfirmationForm(true);
    setSelectedPath(inputPathArray);
    if (inputPathArrayAddtionalFiles.length < inputPathArray.length) {
      setAdditionalFiles(inputPathArrayAddtionalFiles);
    } else {
      setAdditionalFiles([]);
    }
  };

  const getDirectoryClass = (index: number, pathArray: string[]) =>
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
        <div className="w-64 font-semibold">New assembly name:</div>
        <Input
          placeholder="max. 400 characters"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAssemblyName(e.target.value)}
        />
      </div>
      <hr className="shadow my-8" />
      <div className="grid grid-cols-1 gap-8">
        {possibleImports &&
        possibleImports.fasta &&
        Object.keys(possibleImports.fasta) ? (
          Object.keys(possibleImports.fasta).map((extension) => {
            return (
              <div key={extension}>
                <div className="font-semibold">{extension}</div>
                <hr className="shadow my-2" />
                <ul>
                  {possibleImports.fasta[extension].map((pathArray, index) => {
                    if (index < 10) {
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
                    } else {
                      return <span />;
                    }
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

export default CreateAssemblyForm;

CreateAssemblyForm.defaultProps = {};

CreateAssemblyForm.propTypes = {
  selectedTaxon: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired,
  handleModeChange: PropTypes.func.isRequired
};
