import React, { useEffect, useState } from "react";

import {
  CircleInformation,
  Gallery,
  New,
  Trash,
  Edit,
  CaretDownFill,
  CaretUpFill,
} from "grommet-icons";

import Button from "../../../../../../components/Button";
import {fetchAssembliesByTaxonID} from "../../../../../../api";
import { useNotification } from "../../../../../../components/NotificationProvider";

const AssistantSelector = (props) => {
  const { mode, view, setView, selectedTaxon, handleModeChange } = props;

  const [assemblies, setAssemblies] = useState([]);
  const [showInfo, setShowInfo] = useState(undefined);
  const [showOptions, setShowOptions] = useState(undefined);

  useEffect(() => {
    loadAssemblies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  function loadAssemblies() {
    fetchAssembliesByTaxonID(selectedTaxon.id).subscribe(response => {
      if (response && response.payload) {
        setAssemblies(response.payload);
      }
  
      if (response && response.notification && response.notification.message) {
        handleNewNotification(response.notification);
      }
    });
  }

  return (
    <div>
      {selectedTaxon && selectedTaxon.id && (
        <div className="mt-16 lg:mx-32 animate-grow-y shadow p-4 rounded-lg">
          <div
            className="flex justify-between font-bold text-lg cursor-pointer select-none"
            onClick={() => setView((prevState) => !prevState)}
          >
            <div className="font-bold text-lg">
              2. What would you like to do?
            </div>
            <div className="animate-fade-in text-blue-500 flex items-center text-sm truncate">
              {mode}
            </div>
          </div>
          {view && (
            <div>
              <hr className="mt-4 mb-8 shadow" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 shadow rounded-lg">
                  <div className="font-bold">Update taxon</div>
                  <hr className="shadow my-4" />
                  <div className="">
                    {/** IMAGES */}
                    <div className="flex items-center h-12">
                      <div className="w-1/3 font-semibold">Image:</div>
                      <div className="w-1/3 pr-4">
                        <Button
                          label={
                            selectedTaxon.imageStatus
                              ? "Change image"
                              : "Add image"
                          }
                          size="sm"
                          onClick={() => {
                            handleModeChange(
                              selectedTaxon.imageStatus
                                ? "Change image"
                                : "Add image"
                            );
                            setView(false);
                          }}
                        >
                          <Gallery color="blank" className="stroke-current" />
                        </Button>
                      </div>
                      <div className="w-1/3 pl-4">
                        {selectedTaxon.imageStatus === 1 && (
                          <Button
                            label="Remove image"
                            size="sm"
                            onClick={() => {
                              handleModeChange("Remove image");
                              setView(false);
                            }}
                          >
                            <Trash color="blank" className="stroke-current" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <hr className="shadow my-4" />

                    {/** TAXON GENERAL INFOS */}
                    <div className="flex items-center h-12">
                      <div className="w-1/3 font-semibold">General infos:</div>
                      <div className="w-2/3">
                        <Button
                          label="Add/update/remove info"
                          size="sm"
                          onClick={() => {
                            handleModeChange("Add/update/remove info");
                            setView(false);
                          }}
                        >
                          <CircleInformation
                            color="blank"
                            className="stroke-current"
                          />
                        </Button>
                      </div>
                    </div>
                    <hr className="shadow my-4" />

                    {/** CREATE NEW ASSEMBLY */}
                    <div className="flex items-center h-12">
                      <div className="w-1/3 font-semibold">New Assembly:</div>
                      <div className="w-2/3">
                        <Button
                          label="Create new assembly"
                          size="sm"
                          onClick={() => {
                            handleModeChange("Create new assembly");
                            setView(false);
                          }}
                        >
                          <New color="blank" className="stroke-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shadow rounded-lg p-4">
                  {/** LIST ASSEMBLIES */}
                  <div className="font-bold">Update assembly</div>
                  <hr className="shadow my-4" />
                  {assemblies.length > 0 ? (
                    assemblies.map((assembly, index) => {
                      return (
                        <div
                          key={assembly.id}
                          className="grid grid-cols-3 gap-2 border px-4 py-2 rounded-lg shadow my-2 animate-grow-y"
                        >
                          <div className="text-sm font-semibold flex items-center col-span-2">
                            {assembly.name}
                          </div>
                          <div className="flex justify-around">
                            <div
                              onClick={() =>
                                setShowInfo((prevState) =>
                                  prevState === index ? undefined : index
                                )
                              }
                              className="select-none rounded-full flex justify-center items-center text-blue-700 hover:text-white hover:bg-blue-700 transition duration-300 p-2 cursor-pointer"
                            >
                              {showInfo === index ? (
                                <CaretDownFill
                                  size="small"
                                  color="blank"
                                  className="stroke-current mr-1"
                                />
                              ) : (
                                <CaretUpFill
                                  size="small"
                                  color="blank"
                                  className="stroke-current mr-1"
                                />
                              )}
                              <CircleInformation
                                size="small"
                                color="blank"
                                className="stroke-current"
                              />
                            </div>
                            <div
                              onClick={() => {
                                setShowOptions((prevState) =>
                                  prevState === index ? undefined : index
                                );
                              }}
                              className="rounded-full flex justify-center items-center text-gray-600 hover:text-white hover:bg-gray-600 transition duration-300 p-2 cursor-pointer"
                            >
                              <Edit
                                size="small"
                                color="blank"
                                className="stroke-current"
                              />
                            </div>
                            <div
                              onClick={() => {
                                handleModeChange("Remove assembly", assembly);
                                setView(false);
                              }}
                              className="rounded-full flex justify-center items-center text-red-600 hover:text-white hover:bg-red-600 transition duration-300 p-2 cursor-pointer"
                            >
                              <Trash
                                size="small"
                                color="blank"
                                className="stroke-current"
                              />
                            </div>
                          </div>

                          {showOptions === index && (
                            <div className="col-span-3 animate-grow-y">
                              <hr className="shadow mb-4" />
                              <div className="grid grid-cols-3 gap-4 mb-2 animate-grow-y">
                                {/* <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Rename",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Rename"
                                /> */}
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Add annotation",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Add annotation"
                                />
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Add mapping",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Add mapping"
                                />
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Add analysis",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Add analysis"
                                />
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Edit annotation",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Edit annotation"
                                />
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Edit mapping",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Edit mapping"
                                />
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={() => {
                                    handleModeChange(
                                      "Edit assembly - Edit analysis",
                                      assembly
                                    );
                                    setView(false);
                                  }}
                                  label="Edit analysis"
                                />
                              </div>
                            </div>
                          )}

                          {showInfo === index && (
                            <div className="col-span-3 animate-grow-y">
                              <hr className="shadow mb-4" />
                              <div className="grid grid-cols-3 gap-2 animate-grow-y mb-2">
                                <div className="text-sm font-semibold">
                                  <div className="text-xs">Added by:</div>
                                  <div className="text-sm font-semibold">
                                    {assembly.addedByUsername}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold col-span-2">
                                  <div className="text-xs">Added on:</div>
                                  <div className="text-sm font-semibold">
                                    {assembly.addedOn}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold">
                                  <div className="text-xs">
                                    Last updated by:
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {assembly.lastUpdatedByUsername}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold col-span-2">
                                  <div className="text-xs">
                                    Last updated on:
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {assembly.lastUpdatedOn}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex justify-center items-center">
                      No assemblies for selected ID!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantSelector;

AssistantSelector.defaultProps = {};

AssistantSelector.propTypes = {};
