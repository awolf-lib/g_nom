import { Close, Tag, Trash } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteAnalysesByAnalysesID,
  fetchMiltsAnalysesByAssemblyID,
  IMiltsAnalysis,
  INcbiTaxon,
  NotificationObject,
  updateAnalysisLabel,
} from "../../../../../../../../../../api";
import Input from "../../../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../../../tsInterfaces/tsInterfaces";
import EditLabelForm from "../../../EditAssemblyLabelForm/components/EditLabelForm";

const EditMiltsForm = ({ taxon, assembly }: { taxon: INcbiTaxon; assembly: AssemblyInterface }) => {
  const [miltsAnalyses, setMiltsAnalyses] = useState<IMiltsAnalysis[]>([]);
  const [toggleConfirmDeletion, setToggleConfirmDeletion] = useState<number>(-1);
  const [confirmDeletion, setConfirmDeletion] = useState<string>("");
  const [toggleEditLabel, setToggleEditLabel] = useState<number>(-1);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

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
    loadMiltsAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly.id]);

  const loadMiltsAnalyses = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly && assembly.id && userID && token) {
      const response = await fetchMiltsAnalysesByAssemblyID(assembly.id, userID, token);

      if (response) {
        if (response.payload) {
          setMiltsAnalyses(response.payload);
        }
      }
    }
  };

  const handleDeleteAnalyses = async (analysesID: number, confirmationString: string) => {
    setConfirmDeletion(confirmationString);

    if (confirmationString === "REMOVE") {
      const userID = JSON.parse(sessionStorage.getItem("userID") || "");
      const token = JSON.parse(sessionStorage.getItem("token") || "");

      if (analysesID && userID && token) {
        setIsRemoving(true);
        const response = await deleteAnalysesByAnalysesID(analysesID, userID, token);
        setToggleConfirmDeletion(-1);
        setConfirmDeletion("");
        loadMiltsAnalyses();

        if (response.notification && response.notification.length > 0) {
          response.notification.map((n: any) => handleNewNotification(n));
        }
        setIsRemoving(false);
      }
    }
  };

  return (
    <div className="animate-grow-y">
      <div className="flex border-t border-b text-center py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        <div className="w-16">ID</div>
        <div className="w-2/5">Name/Alias</div>
        <div className="w-1/5">Added by</div>
        <div className="w-2/5">Added on</div>
        <div className="w-96" />
      </div>
      <div className="min-h-1/4 max-h-1/2">
        {miltsAnalyses && miltsAnalyses.length > 0 ? (
          miltsAnalyses.map((milts) => (
            <div key={milts.analysisID} className="border-t border-b odd:bg-indigo-50 shadow">
              <div className="flex py-4 text-center items-center">
                <div className="w-16">{milts.analysisID}</div>
                <div className="w-2/5 flex justify-center items-center">
                  {milts.label || milts.name}
                </div>
                <div className="w-1/5">{milts.username}</div>
                <div className="w-2/5">{milts.addedOn}</div>
                <div className="flex justify-around items-center w-48">
                  <div
                    onClick={() => {
                      setToggleConfirmDeletion(-1);
                      setConfirmDeletion("");
                      setToggleEditLabel((prevState) =>
                        prevState !== milts.analysisID ? milts.analysisID : -1
                      );
                    }}
                    className="p-1 hover:bg-gray-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                  >
                    {toggleEditLabel !== milts.analysisID ? (
                      <Tag className="stroke-current" color="blank" size="small" />
                    ) : (
                      <Close className="stroke-current" color="blank" size="small" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    <div
                      onClick={() => {
                        setToggleEditLabel(-1);
                        setConfirmDeletion("");
                        setToggleConfirmDeletion((prevState) =>
                          prevState !== milts.analysisID ? milts.analysisID : -1
                        );
                      }}
                      className="p-1 hover:bg-red-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                    >
                      {toggleConfirmDeletion !== milts.analysisID ? (
                        <Trash className="stroke-current" color="blank" size="small" />
                      ) : (
                        <Close className="stroke-current" color="blank" size="small" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {(toggleConfirmDeletion || toggleEditLabel) && <hr className="shadow" />}
              {toggleConfirmDeletion === milts.analysisID && (
                <div className="flex justify-center animate-grow-y">
                  <div className="mx-4 my-8">
                    <div className="flex justify-between items-center">
                      {!isRemoving ? (
                        <label className="flex">
                          <span className="flex items-center mx-4 font-semibold text-sm">
                            CONFIRM DELETION:
                          </span>
                          <div className="flex items-center justify-center w-96">
                            <Input
                              placeholder="Type REMOVE..."
                              onChange={(e) =>
                                handleDeleteAnalyses(milts.analysisID, e.target.value)
                              }
                              value={confirmDeletion}
                            />
                          </div>
                        </label>
                      ) : (
                        <div>
                          <LoadingSpinner label="Removing..." />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {toggleEditLabel === milts.analysisID && (
                <EditLabelForm
                  target={milts}
                  updateLabel={updateAnalysisLabel}
                  reloadTarget={loadMiltsAnalyses}
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center py-4 border-t border-b">No items!</div>
        )}
      </div>
    </div>
  );
};

export default EditMiltsForm;
