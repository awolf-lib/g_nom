import { Close, Edit, Trash } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteAnalysesByAnalysesID,
  fetchRepeatmaskerAnalysesByAssemblyID,
} from "../../../../../../../../../../api";
import { INcbiTaxon } from "../../../../../../../../../../api";
import Input from "../../../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../../../tsInterfaces/tsInterfaces";

const EditRepeatmaskersForm = ({
  taxon,
  assembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
}) => {
  const [repeatmaskers, setRepeatmaskers] = useState<any[]>([]);
  const [toggleConfirmDeletion, setToggleConfirmDeletion] = useState<number>(-1);
  const [confirmDeletion, setConfirmDeletion] = useState<string>("");

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    loadRepeatmaskers();
  }, [assembly.id]);

  const loadRepeatmaskers = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly && assembly.id && userID && token) {
      const response = await fetchRepeatmaskerAnalysesByAssemblyID(assembly.id, userID, token);

      if (response) {
        if (response.payload) {
          setRepeatmaskers(response.payload);
        }
      }
    }
  };

  const handleDeleteRepeatmasker = async (analysesID: number, confirmation: string) => {
    if (toggleConfirmDeletion !== analysesID) {
      setToggleConfirmDeletion(analysesID);
    } else {
      setConfirmDeletion(confirmation);

      if (confirmation === "REMOVE") {
        const userID = JSON.parse(sessionStorage.getItem("userID") || "");
        const token = JSON.parse(sessionStorage.getItem("token") || "");

        if (analysesID && userID && token) {
          const response = await deleteAnalysesByAnalysesID(analysesID, userID, token);
          setToggleConfirmDeletion(-1);
          setConfirmDeletion("");
          loadRepeatmaskers();

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
        <div className="w-56" />
      </div>
      <div className="min-h-1/4 max-h-1/2">
        {repeatmaskers && repeatmaskers.length > 0 ? (
          repeatmaskers.map((repeatmasker: any) => (
            <div
              key={repeatmasker.analysisID}
              className="border-t border-b odd:bg-indigo-50 shadow"
            >
              <div className="flex py-4 text-center">
                <div className="w-16">{repeatmasker.analysisID}</div>
                <div className="w-2/5">{repeatmasker.name}</div>
                <div className="w-1/5">{repeatmasker.username}</div>
                <div className="w-2/5">{repeatmasker.addedOn}</div>
                <div className="flex justify-around items-center w-56">
                  {toggleConfirmDeletion !== repeatmasker.analysisID ? (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRepeatmasker(repeatmasker.analysisID, "");
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
                          onChange={(e: any) =>
                            handleDeleteRepeatmasker(repeatmasker.analysisID, e.target.value)
                          }
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
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center py-4 border-t border-b">No items!</div>
        )}
      </div>
    </div>
  );
};

export default EditRepeatmaskersForm;
