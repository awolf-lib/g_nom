import { Close, Trash, Validate } from "grommet-icons";
import React, { useEffect, useState } from "react";
import {fetchAnalysesByAssemblyID, fetchAnnotationsByAssemblyID, fetchMappingsByAssemblyID, removeAnnotationByAnnotationID, removeMappingByMappingID, removeAnalysisByAnalysisID} from "../../../../../../../../api";
import Input from "../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../components/NotificationProvider";

const EditAnalysisForm = (props) => {
  const [analyses, setAnalyses] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [removing, setRemoving] = useState(undefined);
  const [confirmRemoving, setConfirmRemoving] = useState("");
  const [newName, setNewName] = useState("");
  useEffect(() => {
    loadAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.type]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadAnalyses = async () => {
    var response;
    if (props.type === "annotation") {
      response = await fetchAnnotationsByAssemblyID(props.object.id);
    } else if (props.type === "mapping") {
      response = await fetchMappingsByAssemblyID(props.object.id);
    } else if (props.type === "analysis") {
      response = await fetchAnalysesByAssemblyID(props.object.id);
    }

    if (response && response.payload) {
      setAnalyses(response.payload);
    }

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
    }
  };

  const handleRename = () => null;

  const handleRemove = async (confirmation) => {
    setConfirmRemoving(confirmation);
    if (confirmation === "REMOVE" && removing) {
      let response;
      if (props.type === "annotation") {
        response = await removeAnnotationByAnnotationID(removing);
      } else if (props.type === "analysis") {
        response = await removeAnalysisByAnalysisID(removing);
      } else if (props.type === "mapping") {
        response = await removeMappingByMappingID(removing);
      } else {
        handleNewNotification({
          label: "Error",
          message: "Unknown type to remove!",
          type: "error",
        });
        return 0;
      }

      if (response && response.payload) {
        setConfirmRemoving("");
        setEditing(undefined);
        setNewName("");
        loadAnalyses();
      }
      if (response && response.notification && response.notification.message) {
        handleNewNotification(response.notification);
      }
    }
  };

  return (
    <div className="animate-grow-y">
      <table className="w-full">
        <thead className="text-left">
          <tr className="text-xs lg:text-base">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Add on</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="text-left">
          {analyses && analyses.length > 0 ? (
            analyses.map((analysis) => {
              return (
                <tr
                  className="animate-grow-y rounded-lg shadow hover:text-blue-600 text-xs lg:text-base"
                  key={analyses.id}
                >
                  <td className="py-2 px-4">
                    {editing !== analysis.id ? (
                      <div className="flex items-center">
                        <div className="w-full">{analysis.name}</div>
                        {/* <Edit
                          className="stroke-current text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg p-1 m-2 transition duration-300 cursor-pointer"
                          color="blank"
                          onClick={() => {
                            setEditing(analysis.id);
                            setNewName("");
                          }}
                        /> */}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-full">
                          <Input
                            placeholder={analysis.name}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        </div>
                        <Validate
                          className="stroke-current text-green-600 hover:bg-green-600 hover:text-white rounded-lg p-1 transition duration-300 cursor-pointer mx-2"
                          color="blank"
                          onClick={() => {
                            handleRename();
                          }}
                        />
                        <Close
                          className="stroke-current text-red-600 hover:bg-red-600 hover:text-white rounded-lg p-1 transition duration-300 cursor-pointer mx-2"
                          color="blank"
                          onClick={() => {
                            setEditing(undefined);
                            setNewName("");
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4">{analysis.addedOn}</td>
                  <td className="py-2 px-4 flex justify-end items-center">
                    {removing !== analysis.id ? (
                      <Trash
                        className="stroke-current text-red-600 hover:bg-red-600 hover:text-white rounded-lg m-2 p-1 transition duration-300 cursor-pointer mx-4"
                        color="blank"
                        onClick={() => {
                          setRemoving(analysis.id);
                        }}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Input
                          placeholder="Type REMOVE"
                          onChange={(e) => handleRemove(e.target.value)}
                          value={confirmRemoving}
                        />
                        <Close
                          className="stroke-current text-red-600 hover:bg-red-600 hover:text-white rounded-lg p-1 m-2 transition duration-300 cursor-pointer mx-4"
                          color="blank"
                          onClick={() => {
                            setRemoving(undefined);
                          }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="text-center">
                No items!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EditAnalysisForm;

EditAnalysisForm.defaultProps = {};

EditAnalysisForm.propTypes = {};
