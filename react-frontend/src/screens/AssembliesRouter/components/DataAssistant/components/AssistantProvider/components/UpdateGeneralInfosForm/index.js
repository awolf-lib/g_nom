import { Close, New, Trash, Validate } from "grommet-icons";
import React, { useEffect, useState } from "react";
import API from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const UpdateGeneralInfosForm = (props) => {
  const { selectedTaxon, level } = props;

  const [generalInfos, setGeneralInfos] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [updatedKey, setUpdatedKey] = useState(undefined);
  const [updatedValue, setUpdatedValue] = useState(undefined);

  const [fetchingAll, setFetchingAll] = useState(false);
  const [fetchingOnNew, setFetchingOnNew] = useState(false);
  const [fetchingOnUpdate, setFetchingOnUpdate] = useState(false);
  const [fetchingOnDelete, setFetchingOnDelete] = useState(false);

  useEffect(() => {
    loadGeneralInfos(level, selectedTaxon.ncbiTaxonID);
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

  const handleSetEditing = (index, info = undefined) => {
    setNewKey("");
    setNewValue("");
    if (info && updatedKey === undefined && updatedValue === undefined) {
      setUpdatedKey(info.generalInfoLabel);
      setUpdatedValue(info.generalInfoDescription);
    }
    setEditing(index);
  };

  const loadGeneralInfos = async (level, id) => {
    setFetchingAll(true);
    const response = await api.fetchGeneralInfosByID(level, id);
    if (response && response.payload) {
      setGeneralInfos(response.payload);
    }
    setFetchingAll(false);
  };

  const createNewGeneralInfo = async () => {
    setFetchingOnNew(true);
    if (newKey && newValue) {
      if (newKey.length <= 400 || newValue.length <= 2000) {
        const response = await api.addGeneralInfo(
          level,
          selectedTaxon.ncbiTaxonID,
          newKey,
          newValue
        );

        if (response && response.notification) {
          handleNewNotification(response.notification);
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

    setNewKey("");
    setNewValue("");
    setEditing(undefined);
    loadGeneralInfos(level, selectedTaxon.ncbiTaxonID);
    setFetchingOnNew(false);
  };

  const updateGeneralInfo = async (id) => {
    setFetchingOnUpdate(true);
    if (updatedKey && updatedValue) {
      if (updatedKey.length <= 400 || updatedValue.length <= 2000) {
        const response = await api.updateGeneralInfoByID(
          level,
          id,
          updatedKey,
          updatedValue
        );

        if (response && response.notification) {
          handleNewNotification(response.notification);
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

    setUpdatedKey(undefined);
    setUpdatedValue(undefined);
    loadGeneralInfos(level, selectedTaxon.ncbiTaxonID);
    setEditing(undefined);
    setFetchingOnUpdate(false);
  };

  const deleteGeneralInfo = async (id) => {
    setFetchingOnDelete(true);
    const response = await api.removeGeneralInfoByID(level, id);
    if (response && response.notification) {
      handleNewNotification(response.notification);
    }

    loadGeneralInfos(level, selectedTaxon.ncbiTaxonID);
    setEditing(undefined);
    setFetchingOnDelete(false);
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="w-1/3 px-4 font-bold">General info label</div>
        <div className="w-2/3 px-4 font-bold">General info description</div>
      </div>
      <hr className="shadow my-4" />
      {generalInfos && generalInfos.length > 0 ? (
        generalInfos.map((info, index) => {
          return (
            <div
              className="mb-4 flex justify-between items-center p-4 rounded-lg shadow cursor-pointer hover:bg-indigo-50 hover:text-blue-600 transition duration-300"
              onClick={() => {
                handleSetEditing(index, info);
              }}
              key={info.id}
            >
              <div className="w-1/3 px-4">
                {editing === index ? (
                  <div className="animate-grow-y">
                    <div>
                      <Input
                        placeholder="max. 400 characters"
                        value={
                          updatedKey !== undefined
                            ? updatedKey
                            : info.generalInfoLabel
                        }
                        onChange={(e) => setUpdatedKey(e.target.value)}
                      />
                    </div>
                    <hr className="shadow my-4" />
                    <div className="flex justify-around">
                      <div>
                        <Button
                          color="confirm"
                          onClick={() => updateGeneralInfo(info.id)}
                        >
                          <Validate
                            color="blank"
                            className={
                              !fetchingOnUpdate
                                ? "stroke-current"
                                : "stroke-current animate-ping"
                            }
                          />
                        </Button>
                      </div>
                      <div>
                        <Button
                          color="cancel"
                          onClick={() => deleteGeneralInfo(info.id)}
                        >
                          <Trash
                            color="blank"
                            className={
                              !fetchingOnDelete
                                ? "stroke-current"
                                : "stroke-current animate-ping"
                            }
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4">{info.generalInfoLabel}</div>
                )}
              </div>
              <div className="w-2/3 px-4">
                {editing === index ? (
                  <div className="animate-grow-y">
                    <Input
                      placeholder="max. 2000 characters"
                      type="textarea"
                      value={
                        updatedValue !== undefined
                          ? updatedValue
                          : info.generalInfoDescription
                      }
                      onChange={(e) => setUpdatedValue(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="px-4">{info.generalInfoDescription}</div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center font-semibold">
          {!fetchingAll ? (
            "No general infos!"
          ) : (
            <LoadingSpinner label="Fetching..." />
          )}
        </div>
      )}
      <hr className="shadow my-8" />
      {editing === -1 ? (
        <div className="flex justify-between items-center p-4 shadow animate-grow-y">
          <div className="w-1/3 px-4">
            <div>
              <Input
                placeholder="max. 400 characters"
                value={newKey}
                onChange={(e) => {
                  setNewKey(e.target.value);
                }}
              />
            </div>
            <hr className="shadow my-4" />
            <div className="flex justify-around">
              <div>
                <Button color="confirm">
                  <Validate
                    color="blank"
                    className={
                      !fetchingOnNew
                        ? "stroke-current"
                        : "stroke-current animate-ping"
                    }
                    onClick={() => createNewGeneralInfo()}
                  />
                </Button>
              </div>
              <div>
                <Button color="cancel">
                  <Close
                    color="blank"
                    className={
                      !fetchingOnDelete
                        ? "stroke-current"
                        : "stroke-current animate-ping"
                    }
                    onClick={() => {
                      setNewKey("");
                      setNewValue("");
                    }}
                  />
                </Button>
              </div>
            </div>
          </div>
          <div className="w-2/3 px-4">
            <Input
              placeholder="max. 2000 characters"
              type="textarea"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="w-64">
            <Button
              label="Create new general info..."
              onClick={() => handleSetEditing(-1)}
            >
              <New color="blank" className="stroke-current" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateGeneralInfosForm;

UpdateGeneralInfosForm.defaultProps = {};

UpdateGeneralInfosForm.propTypes = {};
