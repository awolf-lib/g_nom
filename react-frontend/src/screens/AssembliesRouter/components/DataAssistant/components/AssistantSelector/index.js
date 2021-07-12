import React from "react";

import { Gallery, Trash } from "grommet-icons";

import Button from "../../../../../../components/Button";

const AssistantSelector = (props) => {
  const { mode, view, setView, selectedTaxon, handleModeChange } = props;
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
              <div className="flex grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            selectedTaxon.imageStored
                              ? "Change image"
                              : "Add image"
                          }
                          size="sm"
                          onClick={() =>
                            handleModeChange(
                              selectedTaxon.imageStored
                                ? "Change image"
                                : "Add image"
                            )
                          }
                        >
                          <Gallery color="blank" className="stroke-current" />
                        </Button>
                      </div>
                      <div className="w-1/3 pl-4">
                        {selectedTaxon.imageStored === 1 && (
                          <Button
                            label="Remove image"
                            size="sm"
                            onClick={() => handleModeChange("Remove image")}
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
                          onClick={() =>
                            handleModeChange("Add/update/remove info")
                          }
                        >
                          <Gallery color="blank" className="stroke-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shadow rounded-lg p-4">
                  <div className="font-bold">Update assembly</div>
                  <hr className="shadow my-4" />
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
