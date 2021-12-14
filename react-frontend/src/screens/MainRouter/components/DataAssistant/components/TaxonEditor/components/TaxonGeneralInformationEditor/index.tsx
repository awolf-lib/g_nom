import { Next, Previous, Trash } from "grommet-icons";
import { useEffect, useRef, useState } from "react";
import {
  INcbiTaxon,
  fetchTaxonGeneralInformationByTaxonID,
  addTaxonGeneralInformation,
  deleteTaxonGeneralInformationByID,
  updateTaxonGeneralInformationByID,
  IGeneralInformation,
} from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const TaxonGeneralInformationEditor = ({ taxon }: { taxon: INcbiTaxon }) => {
  const [generalInfos, setGeneralInfos] = useState<Array<any>>([]);
  const [editing, setEditing] = useState<number>(-1);
  const [listOffset, setListOffset] = useState<number>(0);
  const [newGeneralInformationLabel, setNewGeneralInformationLabel] = useState<string>("");
  const [newGeneralInformationDescription, setNewGeneralInformationDescription] =
    useState<string>("");
  const [updatedGeneralInformationLabel, setUpdatedGeneralInformationLabel] = useState<string>("");
  const [updatedGeneralInformationDescription, setUpdatedGeneralInformationDescription] =
    useState<string>("");

  const [fetchingGeneralInformation, setFetchingGeneralInformation] = useState<boolean>(false);
  const [fetchingUpdateGeneralInformation, setFetchingUpdateGeneralInformation] =
    useState<boolean>(false);
  const [fetchingNewGeneralInformation, setFetchingNewGeneralInformation] =
    useState<boolean>(false);
  const [fetchingDeleteGeneralInformation, setFetchingDeleteGeneralInformation] =
    useState<boolean>(false);

  useEffect(() => {
    loadGeneralInformation(taxon.id);
    topRef.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [listOffset, editing]);

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadGeneralInformation = async (id: number) => {
    setFetchingGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");

    if (userID && token) {
      const response = await fetchTaxonGeneralInformationByTaxonID(id, parseInt(userID), token);
      if (response && response.payload) {
        setGeneralInfos(response.payload);
        if (response.notification && response.notification.length) {
          response.notification.map((not: any) => {
            handleNewNotification(not);
          });
        }
      }
    }
    setFetchingGeneralInformation(false);
  };

  const handleSetEditing = (generalInformation: IGeneralInformation | -1) => {
    if (generalInformation !== -1) {
      setUpdatedGeneralInformationLabel(generalInformation.generalInfoLabel);
      setUpdatedGeneralInformationDescription(generalInformation.generalInfoDescription);
      setEditing(generalInformation.id);
    } else {
      setUpdatedGeneralInformationLabel("");
      setUpdatedGeneralInformationDescription("");
      setEditing(-1);
    }
  };

  const handleChangeUpdatedGeneralInformationLabel = (newLabel: string) => {
    if (newLabel.length <= 50) {
      setUpdatedGeneralInformationLabel(newLabel);
    }
  };

  const handleChangeUpdatedGeneralInformationDescription = (newDescription: string) => {
    if (newDescription.length <= 2000) {
      setUpdatedGeneralInformationDescription(newDescription);
    }
  };

  const handleChangeNewGeneralInformationLabel = (newLabel: string) => {
    if (newLabel.length <= 50) {
      setNewGeneralInformationLabel(newLabel);
    }
  };

  const handleChangeNewGeneralInformationDescription = (newDescription: string) => {
    if (newDescription.length <= 2000) {
      setNewGeneralInformationDescription(newDescription);
    }
  };

  const updateGeneralInformation = async (id: any) => {
    setFetchingUpdateGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");

    if (userID && token) {
      if (updatedGeneralInformationLabel && updatedGeneralInformationDescription) {
        const regex = /^([\w ]+)$/g;
        if (
          !newGeneralInformationLabel.match(regex) ||
          !newGeneralInformationDescription.match(regex)
        ) {
          handleNewNotification({
            label: "Error",
            message: "Invalid input. No special characters allowed!",
            type: "error",
          });
        } else {
          if (
            updatedGeneralInformationLabel.length <= 50 ||
            updatedGeneralInformationDescription.length <= 2000
          ) {
            const response = await updateTaxonGeneralInformationByID(
              id,
              updatedGeneralInformationLabel,
              updatedGeneralInformationDescription,
              parseInt(userID),
              token
            );

            if (response && response.notification && response.notification.length) {
              response.notification.map((element: any) => {
                handleNewNotification(element);
              });
            }
          } else {
            handleNewNotification({
              label: "Error",
              message: "Input too long!",
              type: "error",
            });
          }
        }
      } else {
        handleNewNotification({
          label: "Error",
          message: "Missing input!",
          type: "error",
        });
      }
    }

    setUpdatedGeneralInformationLabel("");
    setUpdatedGeneralInformationDescription("");
    loadGeneralInformation(taxon.id);
    setEditing(-1);
    setFetchingUpdateGeneralInformation(false);
  };

  const cancelUpdateGeneralInformation = () => {
    setUpdatedGeneralInformationLabel("");
    setUpdatedGeneralInformationDescription("");
    setEditing(-1);
  };

  const handleSubmitNewGeneralInformation = async () => {
    setFetchingNewGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");

    if (userID && token) {
      if (newGeneralInformationLabel && newGeneralInformationDescription) {
        const regex = /^([,.A-Za-z0-9_ ]+)$/g;
        if (
          !newGeneralInformationLabel.match(regex) ||
          !newGeneralInformationDescription.match(regex)
        ) {
          handleNewNotification({
            label: "Error",
            message: "Invalid input. No special characters allowed!",
            type: "error",
          });
        } else {
          if (
            newGeneralInformationLabel.length <= 50 &&
            newGeneralInformationDescription.length <= 2000
          ) {
            const response = await addTaxonGeneralInformation(
              taxon.id,
              newGeneralInformationLabel,
              newGeneralInformationDescription,
              parseInt(userID),
              token
            );

            if (response && response.notification && response.notification.length) {
              response.notification.map((element: any) => {
                handleNewNotification(element);
              });
            }
          } else {
            handleNewNotification({
              label: "Error",
              message: "Input too long!",
              type: "error",
            });
          }
        }
      } else {
        handleNewNotification({
          label: "Error",
          message: "Missing input!",
          type: "error",
        });
      }
    }

    setNewGeneralInformationLabel("");
    setNewGeneralInformationDescription("");
    setEditing(-1);
    loadGeneralInformation(taxon.id);
    setFetchingNewGeneralInformation(false);
  };

  const handleResetNewGeneralInformationForm = () => {
    setNewGeneralInformationLabel("");
    setNewGeneralInformationDescription("");
  };

  const handleDeleteGeneralInformation = async (id: number) => {
    setFetchingDeleteGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");

    if (userID && token) {
      const response = await deleteTaxonGeneralInformationByID(id, parseInt(userID), token);
      if (response && response.notification && response.notification.length) {
        response.notification.map((element: any) => {
          handleNewNotification(element);
        });
      }

      loadGeneralInformation(taxon.id);
      setEditing(-1);
      setFetchingDeleteGeneralInformation(false);
    }
  };

  return (
    <div className="animate-grow-y">
      {/* Create new GIs */}
      <div className="bg-indigo-100">
        <div className="px-4 py-2 font-semibold text-sm text-white bg-gray-500 border-b border-t border-white">
          <div>Add new general information...</div>
        </div>
        <div className="flex px-2">
          <div className="w-1/5 text-sm py-4 px-4 font-semibold">Label</div>
          <div className="w-4/5 text-sm py-4 px-4 font-semibold">Description</div>
        </div>
        <div className="bg-gray-100 py-4 px-2">
          <div className="flex">
            <div className="w-1/5 mx-1">
              <Input
                type="textarea"
                placeholder="Max. 50 characters..."
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  handleChangeNewGeneralInformationLabel(e.currentTarget.value)
                }
                value={newGeneralInformationLabel}
              />
              <div className="flex justify-around py-2">
                <div className="w-24" onClick={() => handleSubmitNewGeneralInformation()}>
                  <Button
                    label={!fetchingNewGeneralInformation ? "Create" : "Creating..."}
                    color="confirm"
                  />
                </div>
                <div className="w-24">
                  <Button
                    label="Reset"
                    color="cancel"
                    onClick={() => handleResetNewGeneralInformationForm()}
                  />
                </div>
              </div>
            </div>
            <div className="w-4/5 mx-1">
              <Input
                type="textarea"
                placeholder="Max. 2000 characters..."
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  handleChangeNewGeneralInformationDescription(e.currentTarget.value)
                }
                value={newGeneralInformationDescription}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Update existing GIs */}
      <div>
        <div className="px-4 py-2 font-semibold text-sm text-white bg-gray-500 border-b border-t border-white">
          <div>Edit existing general information...</div>
          {fetchingGeneralInformation && (
            <div>
              <LoadingSpinner />
            </div>
          )}
        </div>
        <div className="flex bg-indigo-100 px-2">
          <div className="w-1/5 py-4 px-4 text-sm font-semibold">Label</div>
          <div className="w-4/5 py-4 px-4 text-sm font-semibold">Description</div>
        </div>
        <div className="animate-grow-y">
          {generalInfos && generalInfos.length > 0 ? (
            generalInfos.slice(listOffset, listOffset + 5).map((gi) => (
              <div
                key={gi.id}
                className="hover:text-blue-600 cursor-pointer odd:bg-gray-100 even:bg-white border-t py-2 px-2"
              >
                {gi.id !== editing ? (
                  <div className="flex" onClick={() => handleSetEditing(gi)}>
                    <div className="w-1/5 py-2 px-4">{gi.generalInfoLabel}</div>
                    <div className="w-4/5 py-2 px-4">{gi.generalInfoDescription}</div>
                  </div>
                ) : (
                  <div className="animate-grow-y">
                    <div className="flex py-4">
                      <div className="w-1/5 mx-2">
                        <Input
                          type="textarea"
                          placeholder="Max. 50 characters..."
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            handleChangeUpdatedGeneralInformationLabel(e.currentTarget.value)
                          }
                          value={updatedGeneralInformationLabel}
                        />
                        <div className="flex justify-around mt-2">
                          <div className="w-24" onClick={() => updateGeneralInformation(gi.id)}>
                            <Button
                              label={!fetchingUpdateGeneralInformation ? "Submit" : "Updating..."}
                              color="confirm"
                            />
                          </div>
                          <div className="w-24" onClick={() => handleSetEditing(-1)}>
                            <Button
                              label="Cancel"
                              color="cancel"
                              onClick={() => cancelUpdateGeneralInformation()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-4/5">
                        <Input
                          type="textarea"
                          placeholder="Max. 2000 characters..."
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            handleChangeUpdatedGeneralInformationDescription(e.currentTarget.value)
                          }
                          value={updatedGeneralInformationDescription}
                        />
                        <div className="flex justify-end items-center mt-2 mx-4">
                          <div
                            onClick={() => handleDeleteGeneralInformation(gi.id)}
                            className="bg-red-500 text-white flex justify-center items-center p-2 rounded-lg cursor-pointer hover:bg-red-400"
                          >
                            {!fetchingDeleteGeneralInformation ? (
                              <Trash className="stroke-current" color="blank" />
                            ) : (
                              <Trash className="stroke-current animate-wiggle" color="blank" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-4 border-b border-t">No items!</div>
          )}
        </div>
        {/* Pagination */}
        {generalInfos && generalInfos.length > 5 && (
          <div>
            <div className="flex justify-center py-2">
              <div className="flex justify-around items-center w-1/2">
                <div
                  onClick={() => {
                    setEditing(-1);
                    setListOffset((prevState) => (prevState - 5 >= 0 ? prevState - 5 : prevState));
                  }}
                >
                  <Button color="nav">
                    <Previous className="stroke-current" color="blank" />
                  </Button>
                </div>
                <div className="text-center text-sm font-semibold">
                  <div>
                    {listOffset +
                      1 +
                      " - " +
                      (listOffset + 5 <= generalInfos.length
                        ? listOffset + 5
                        : generalInfos.length)}
                  </div>
                  <div ref={bottomRef}> {"(Total: " + generalInfos.length + ")"}</div>
                </div>
                <div
                  onClick={() => {
                    setEditing(-1);
                    setListOffset((prevState) =>
                      prevState + 5 <= generalInfos.length - 1 ? prevState + 5 : prevState
                    );
                  }}
                >
                  <Button color="nav">
                    <Next className="stroke-current" color="blank" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxonGeneralInformationEditor;
