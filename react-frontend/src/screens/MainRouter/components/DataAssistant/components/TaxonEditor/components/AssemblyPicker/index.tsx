import { Close, Edit, Search, Trash } from "grommet-icons";
import { SetStateAction, useEffect, useState } from "react";
import {
  deleteAssemblyByAssemblyID,
  fetchAssembliesByTaxonID,
  INcbiTaxon,
  NotificationObject,
} from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import NewDataImportForm from "./components/NewDataImportForm";
import { Link, useSearchParams } from "react-router-dom";
import { AssemblyInterface } from "../../../../../../../../tsInterfaces/tsInterfaces";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";

const AssemblyPicker = ({
  taxon,
  getAssembly,
}: {
  taxon: INcbiTaxon;
  getAssembly: SetStateAction<any>;
}) => {
  const [assemblies, setAssemblies] = useState<AssemblyInterface[]>([]);
  const [toggleConfirmDeletion, setToggleConfirmDeletion] = useState<number>(-1);
  const [confirmDeletion, setConfirmDeletion] = useState<string>("");
  const [isRemoving, setIsRemoving] = useState<number>(-1);

  const [targetAssembly, setTargetAssembly] = useState<any>();

  const [toggleNewAssemblyImportForm, setToggleNewAssemblyImportForm] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadAssemblies();
    const interval = setInterval(() => loadAssemblies(), 30000);
    return clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxon]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    if (targetAssembly?.id) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("assemblyID", JSON.stringify(targetAssembly.id));
      setSearchParams(newSearchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAssembly?.id]);

  useEffect(() => {
    const assemblyIdString = searchParams.get("assemblyID");
    const assemblyID = Number(assemblyIdString);
    if (assemblyID) {
      const target = assemblies.find((element) => element.id === assemblyID);
      if (target?.id) {
        getAssembly(target);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, assemblies?.length]);

  const loadAssemblies = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (taxon && taxon.id && userID && token) {
      const response = await fetchAssembliesByTaxonID(taxon.id, parseInt(userID), token);
      if (response) {
        if (response.payload) {
          setAssemblies(response.payload);
        }
        if (response.notification && response.notification.length) {
          response.notification.forEach((notification: NotificationObject) =>
            handleNewNotification(notification)
          );
        }
      }
    }
  };

  const handleDeleteAssembly = async (assemblyID: number, confirmation: string) => {
    if (isRemoving === -1) {
      if (toggleConfirmDeletion !== assemblyID) {
        setToggleConfirmDeletion(assemblyID);
      } else {
        setConfirmDeletion(confirmation);

        if (confirmation === "REMOVE") {
          const userID = JSON.parse(sessionStorage.getItem("userID") || "");
          const token = JSON.parse(sessionStorage.getItem("token") || "");

          if (userID && token) {
            setIsRemoving(assemblyID);
            const response = await deleteAssemblyByAssemblyID(assemblyID, parseInt(userID), token);
            setToggleConfirmDeletion(-1);
            setConfirmDeletion("");
            loadAssemblies();

            if (response.notification && response.notification.length > 0) {
              response.notification.map((n: any) => handleNewNotification(n));
            }
            setIsRemoving(-1);
          }
        }
      }
    } else {
      handleNewNotification({
        label: "Info",
        message: "There is another ongoing removal. Please wait...",
        type: "info",
      });
    }
  };

  const handleEditAssembly = (assembly: AssemblyInterface) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("assemblyID", JSON.stringify(assembly.id));
    setTargetAssembly(assembly);
    getAssembly(assembly);
    setSearchParams(newSearchParams);
  };

  return (
    <div className="animate-grow-y">
      <div className="flex border-t border-b text-center py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        <div className="w-16">ID</div>
        <div className="w-2/5">Name/Alias</div>
        <div className="w-1/5">Added by</div>
        <div className="w-2/5">Added on</div>
        <div className="w-64" />
      </div>
      <div className="animate-grow-y min-h-1/4 max-h-1/2">
        {assemblies && assemblies.length > 0 ? (
          assemblies.map((assembly) => (
            <div key={assembly.id} className="border-t border-b odd:bg-indigo-50 shadow">
              <div className="flex py-4 text-center">
                <div className="w-16">{assembly.id}</div>
                <div className="w-2/5">{assembly.label || assembly.name}</div>
                <div className="w-1/5">{assembly.username}</div>
                <div className="w-2/5">{assembly.addedOn}</div>
                {isRemoving !== assembly.id ? (
                  <div className="flex justify-around items-center w-64">
                    <Link
                      to={"/g-nom/assemblies/assembly?assemblyID=" + assembly.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssembly(assembly.id, "");
                      }}
                      className="flex cursor-pointer hover:bg-gray-600 hover:text-white p-1 rounded-lg transform scale-125"
                    >
                      <Search className="stroke-current" color="blank" size="small" />
                    </Link>
                    {toggleConfirmDeletion !== assembly.id ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center justify-center">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAssembly(assembly.id, "");
                            }}
                            className="flex cursor-pointer hover:bg-red-600 hover:text-white p-1 rounded-lg transform scale-125"
                          >
                            <Trash className="stroke-current" color="blank" size="small" />
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
                            value={confirmDeletion}
                            onChange={(e) => handleDeleteAssembly(assembly.id, e.target.value)}
                          />
                        </div>
                        <div className="w-8 flex items-center justify-center">
                          <div className="flex cursor-pointer hover:bg-red-600 hover:text-white p-1 rounded-lg transform scale-125">
                            <Close
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeletion("");
                                setToggleConfirmDeletion(-1);
                              }}
                              className="stroke-current"
                              color="blank"
                              size="small"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAssembly(assembly);
                      }}
                      className="cursor-pointer hover:bg-blue-600 hover:text-white flex items-center justify-center p-1 rounded-lg transform scale-125"
                    >
                      <Edit className="stroke-current" color="blank" size="small" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center w-64">
                    <LoadingSpinner label="Removing..." />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center py-4 border-t border-b">No items!</div>
        )}
      </div>
      <div className="flex my-4 justify-center">
        <div className="w-72">
          <Button
            size="sm"
            label="Add new assembly..."
            onClick={() => setToggleNewAssemblyImportForm((prevState) => !prevState)}
          />
        </div>
      </div>
      <hr className="shadow my-4" />
      {toggleNewAssemblyImportForm && (
        <NewDataImportForm taxon={taxon} loadAssemblies={loadAssemblies} assembly={undefined} />
      )}
    </div>
  );
};

export default AssemblyPicker;
