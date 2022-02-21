import { Next, Previous, Trash } from "grommet-icons";
import { useEffect, useRef, useState } from "react";
import {
  INcbiTaxon,
  fetchTaxonGeneralInformationByTaxonID,
  addTaxonGeneralInformation,
  deleteTaxonGeneralInformationByID,
  updateTaxonGeneralInformationByID,
  IGeneralInformation,
  fetchAssemblyGeneralInformationByAssemblyID,
  updateAssemblyGeneralInformationByID,
  addAssemblyGeneralInformation,
  deleteAssemblyGeneralInformationByID,
  NotificationObject,
} from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../tsInterfaces/tsInterfaces";

const GeneralInformationEditor = ({
  target,
  level,
}: {
  target: INcbiTaxon | AssemblyInterface;
  level: "taxon" | "assembly";
}) => {
  const [generalInfos, setGeneralInfos] = useState<IGeneralInformation[]>([]);
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

  const [toggleAddNewGeneralInforamtion, setToggleAddNewGeneralInforamtion] =
    useState<boolean>(false);

  const newGeneralInformationFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGeneralInformation(target.id);
    topRef.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [listOffset, editing]);

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    newGeneralInformationFormRef.current?.scrollIntoView();
  }, [newGeneralInformationFormRef]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadGeneralInformation = async (id: number) => {
    setFetchingGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      switch (level) {
        case "taxon":
          await fetchTaxonGeneralInformationByTaxonID(id, userID, token).then((response) => {
            if (response && response.payload) {
              setGeneralInfos(response.payload);
              if (response.notification && response.notification.length) {
                response.notification.forEach((not) => {
                  handleNewNotification(not);
                });
              }
            }
          });
          break;
        case "assembly":
          await fetchAssemblyGeneralInformationByAssemblyID(id, userID, token).then((response) => {
            if (response && response.payload) {
              setGeneralInfos(response.payload);
              if (response.notification && response.notification.length) {
                response.notification.forEach((not) => {
                  handleNewNotification(not);
                });
              }
            }
          });
          break;

        default:
          break;
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
    if (newDescription.length <= 500) {
      setUpdatedGeneralInformationDescription(newDescription);
    }
  };

  const handleChangeNewGeneralInformationLabel = (newLabel: string) => {
    if (newLabel.length <= 50) {
      setNewGeneralInformationLabel(newLabel);
    }
  };

  const handleChangeNewGeneralInformationDescription = (newDescription: string) => {
    if (newDescription.length <= 500) {
      setNewGeneralInformationDescription(newDescription);
    }
  };

  const updateGeneralInformation = async (id: number) => {
    setFetchingUpdateGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      if (updatedGeneralInformationLabel && updatedGeneralInformationDescription) {
        if (
          updatedGeneralInformationLabel.length <= 50 ||
          updatedGeneralInformationDescription.length <= 2000
        ) {
          switch (level) {
            case "taxon":
              await updateTaxonGeneralInformationByID(
                id,
                updatedGeneralInformationLabel,
                updatedGeneralInformationDescription,
                userID,
                token
              ).then((response) => {
                if (response && response.notification && response.notification.length) {
                  response.notification.forEach((element: NotificationObject) => {
                    handleNewNotification(element);
                  });
                } else {
                  handleNewNotification({
                    label: "Error",
                    message: "Input too long!",
                    type: "error",
                  });
                }
              });
              break;
            case "assembly":
              await updateAssemblyGeneralInformationByID(
                id,
                updatedGeneralInformationLabel,
                updatedGeneralInformationDescription,
                userID,
                token
              ).then((response) => {
                if (response && response.notification && response.notification.length) {
                  response.notification.forEach((element: NotificationObject) => {
                    handleNewNotification(element);
                  });
                } else {
                  handleNewNotification({
                    label: "Error",
                    message: "Input too long!",
                    type: "error",
                  });
                }
              });
              break;

            default:
              break;
          }
        } else {
          handleNewNotification({
            label: "Error",
            message: "Missing input!",
            type: "error",
          });
        }
      }
    }

    setUpdatedGeneralInformationLabel("");
    setUpdatedGeneralInformationDescription("");
    loadGeneralInformation(target.id);
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
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      if (newGeneralInformationLabel && newGeneralInformationDescription) {
        if (
          newGeneralInformationLabel.length <= 50 &&
          newGeneralInformationDescription.length <= 2000
        ) {
          switch (level) {
            case "taxon":
              await addTaxonGeneralInformation(
                target.id,
                newGeneralInformationLabel,
                newGeneralInformationDescription,
                userID,
                token
              ).then((response) => {
                if (response && response.notification && response.notification.length) {
                  response.notification.forEach((element) => {
                    handleNewNotification(element);
                  });
                }
              });
              break;
            case "assembly":
              await addAssemblyGeneralInformation(
                target.id,
                newGeneralInformationLabel,
                newGeneralInformationDescription,
                userID,
                token
              ).then((response) => {
                if (response && response.notification && response.notification.length) {
                  response.notification.forEach((element) => {
                    handleNewNotification(element);
                  });
                }
              });
              break;

            default:
              break;
          }
        } else {
          handleNewNotification({
            label: "Error",
            message: "Input too long!",
            type: "error",
          });
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
    loadGeneralInformation(target.id);
    setFetchingNewGeneralInformation(false);
  };

  const handleResetNewGeneralInformationForm = () => {
    setNewGeneralInformationLabel("");
    setNewGeneralInformationDescription("");
  };

  const handleDeleteGeneralInformation = async (id: number) => {
    setFetchingDeleteGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      switch (level) {
        case "taxon":
          await deleteTaxonGeneralInformationByID(id, userID, token).then((response) => {
            if (response && response.notification && response.notification.length) {
              response.notification.forEach((element: NotificationObject) => {
                handleNewNotification(element);
              });
            }
          });
          break;
        case "assembly":
          await deleteAssemblyGeneralInformationByID(id, userID, token).then((response) => {
            if (response && response.notification && response.notification.length) {
              response.notification.forEach((element: NotificationObject) => {
                handleNewNotification(element);
              });
            }
          });
          break;

        default:
          break;
      }

      loadGeneralInformation(target.id);
      setEditing(-1);
      setFetchingDeleteGeneralInformation(false);
    }
  };

  return (
    <div className="animate-grow-y">
      {/* Update existing GIs */}
      <div>
        <div className="font-semibold text-sm text-white bg-gray-500 border-b border-t border-white flex">
          <div className="w-1/5 py-2 px-4 text-sm font-semibold">Label</div>
          <div className="w-4/5 py-2 px-4 text-sm font-semibold">Description</div>
          {fetchingGeneralInformation && (
            <div>
              <LoadingSpinner />
            </div>
          )}
        </div>
        <div className="animate-grow-y min-h-1/4 max-h-1/2">
          {generalInfos && generalInfos.length > 0 ? (
            generalInfos.slice(listOffset, listOffset + 5).map((gi) => (
              <div
                key={gi.id}
                className="hover:text-blue-600 cursor-pointer odd:bg-gray-100 even:bg-white border-t py-2 shadow"
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
                        <div className="relative">
                          <Input
                            type="textarea"
                            placeholder="Max. 50 characters..."
                            onChange={(e: React.FormEvent<HTMLInputElement>) =>
                              handleChangeUpdatedGeneralInformationLabel(e.currentTarget.value)
                            }
                            value={updatedGeneralInformationLabel}
                          />
                          <div className="absolute bottom-0 right-0 m-2 text-xs">
                            {updatedGeneralInformationLabel &&
                              updatedGeneralInformationLabel.length + "/50"}
                          </div>
                        </div>
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
                        <div className="relative">
                          <Input
                            type="textarea"
                            placeholder="Max. 500 characters..."
                            onChange={(e: React.FormEvent<HTMLInputElement>) =>
                              handleChangeUpdatedGeneralInformationDescription(
                                e.currentTarget.value
                              )
                            }
                            value={updatedGeneralInformationDescription}
                          />
                          <div className="absolute bottom-0 right-0 m-2 text-xs">
                            {updatedGeneralInformationDescription &&
                              updatedGeneralInformationDescription.length + "/500"}
                          </div>
                        </div>
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
        <div className="flex my-4 justify-center">
          <div className="w-72">
            <Button
              size="sm"
              label="Add new General Information..."
              onClick={() => setToggleAddNewGeneralInforamtion((prevState) => !prevState)}
            />
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Create new GIs */}
      {toggleAddNewGeneralInforamtion && (
        <div className="bg-indigo-100 animate-grow-y">
          <div
            className="px-4 py-2 font-semibold text-sm text-white bg-gray-500 border-b border-t border-white"
            ref={newGeneralInformationFormRef}
          >
            <div>Add new general information...</div>
          </div>
          <div className="bg-gray-100 py-4 px-2">
            <div className="flex">
              <div className="w-1/5 mx-1">
                <div className="relative">
                  <Input
                    type="textarea"
                    placeholder="Max. 50 characters..."
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      handleChangeNewGeneralInformationLabel(e.currentTarget.value)
                    }
                    value={newGeneralInformationLabel}
                  />
                  <div className="absolute bottom-0 right-0 m-2 text-xs">
                    {newGeneralInformationLabel && newGeneralInformationLabel.length + "/50"}
                  </div>
                </div>
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
                <div className="relative">
                  <Input
                    type="textarea"
                    placeholder="Max. 500 characters..."
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      handleChangeNewGeneralInformationDescription(e.currentTarget.value)
                    }
                    value={newGeneralInformationDescription}
                  />
                  <div className="absolute bottom-0 right-0 m-2 text-xs">
                    {newGeneralInformationDescription &&
                      newGeneralInformationDescription.length + "/500"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralInformationEditor;
