import { Close, Edit, Trash } from "grommet-icons";
import { SetStateAction, useEffect, useState } from "react";
import {
  deleteAssemblyByAssemblyID,
  fetchAssembliesByTaxonID,
  INcbiTaxon,
} from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import NewAssemblyImportForm from "./components/NewAssemblyImportForm";

const AssemblyPicker = ({
  taxon,
  getAssembly,
}: {
  taxon: INcbiTaxon;
  getAssembly: SetStateAction<any>;
}) => {
  const [assemblies, setAssemblies] = useState<any>([]);
  const [toggleStatistics, setToggleStatistics] = useState<number>(-1);
  const [toggleConfirmDeletion, setToggleConfirmDeletion] = useState<number>(-1);
  const [confirmDeletion, setConfirmDeletion] = useState<string>("");

  const [targetAssembly, setTargetAssembly] = useState<any>();

  const [toggleNewAssemblyImportForm, setToggleNewAssemblyImportForm] = useState<boolean>(false);

  useEffect(() => {
    loadAssemblies();
    const interval = setInterval(() => loadAssemblies(), 60000);
    return clearInterval(interval);
  }, []);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadAssemblies = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");

    if (taxon && taxon.id && userID && token) {
      const response = await fetchAssembliesByTaxonID(taxon.id, parseInt(userID), token);
      if (response) {
        if (response.payload) {
          setAssemblies(response.payload);
        }
        if (response.notification && response.notification.length) {
          response.notification.map((notification: any) => handleNewNotification(notification));
        }
      }
    }
  };

  const handleToggleStatistics = (id: number) => {
    if (id === toggleStatistics) {
      setToggleStatistics(-1);
    } else {
      setToggleStatistics(id);
    }
  };

  const handleDeleteAssembly = async (assemblyID: number, confirmation: string) => {
    if (toggleConfirmDeletion !== assemblyID) {
      setToggleConfirmDeletion(assemblyID);
    } else {
      setConfirmDeletion(confirmation);

      if (confirmation === "REMOVE") {
        const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
        const token = JSON.parse(sessionStorage.getItem("token") || "{}");

        if (userID && token) {
          const response = await deleteAssemblyByAssemblyID(assemblyID, parseInt(userID), token);
          setToggleConfirmDeletion(-1);
          setConfirmDeletion("");

          if (response.notification && response.notification.length > 0) {
            response.notification.map((n: any) => handleNewNotification(n));
          }
        }
      }
    }
  };

  return (
    <div className="animate-grow-y">
      <div className="flex border-t border-b text-center py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        <div className="w-16">ID</div>
        <div className="w-2/5">Name</div>
        <div className="w-1/5">Added by</div>
        <div className="w-2/5">Added on</div>
        <div className="w-64" />
      </div>
      <div className="min-h-1/4 max-h-1/2">
        {assemblies && assemblies.length > 0 ? (
          assemblies.map((assembly: any) => (
            <div
              key={assembly.id}
              className={
                toggleStatistics === assembly.id
                  ? "border-t border-b odd:bg-indigo-50 font-semibold shadow"
                  : "border-t border-b odd:bg-indigo-50 shadow"
              }
            >
              <div
                className="flex py-4 text-center"
                onClick={() => handleToggleStatistics(assembly.id)}
              >
                <div className="w-16">{assembly.id}</div>
                <div className="w-2/5">{assembly.name}</div>
                <div className="w-1/5">{assembly.username}</div>
                <div className="w-2/5">{assembly.addedOn}</div>
                <div className="flex justify-around items-center w-64">
                  {toggleConfirmDeletion !== assembly.id ? (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center justify-center">
                        <div className="flex cursor-pointer hover:bg-red-600 hover:text-white p-1 rounded-lg transform scale-125">
                          <Trash
                            className="stroke-current"
                            color="blank"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAssembly(assembly.id, "");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div
                        className="w-32 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          size="sm"
                          placeholder="Type REMOVE..."
                          onChange={(e) => handleDeleteAssembly(assembly.id, e.target.value)}
                        />
                      </div>
                      <div className="w-8 flex items-center justify-center">
                        <div className="flex cursor-pointer hover:bg-red-600 hover:text-white p-1 rounded-lg transform scale-125">
                          <Close
                            className="stroke-current"
                            color="blank"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeletion("");
                              setToggleConfirmDeletion(-1);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="cursor-pointer hover:bg-blue-600 hover:text-white flex items-center justify-center p-1 rounded-lg transform scale-125">
                    <Edit
                      className="stroke-current"
                      color="blank"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetAssembly(assembly);
                        getAssembly(assembly);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                {toggleStatistics === assembly.id && (
                  <div className="animate-grow-y">
                    <hr className="my-2 shadow" />
                    <div>
                      {Object.keys(assembly).map((key: string) => (
                        <div className="flex justify-between">
                          <div>{key}</div>
                          <div>{assembly[key]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center py-4 border-t border-b">No items!</div>
        )}
        <div className="flex my-4 justify-center">
          <div className="w-72">
            <Button
              size="sm"
              label="Toggle add new assembly..."
              onClick={() => setToggleNewAssemblyImportForm((prevState) => !prevState)}
            />
          </div>
        </div>
      </div>
      <hr className="shadow my-4" />
      {toggleNewAssemblyImportForm && <NewAssemblyImportForm taxon={taxon} />}
    </div>
  );
};

export default AssemblyPicker;
