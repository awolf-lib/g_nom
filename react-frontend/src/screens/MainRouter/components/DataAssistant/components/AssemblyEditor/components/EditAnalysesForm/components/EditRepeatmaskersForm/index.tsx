import { Close, Tag, Trash } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteAnalysesByAnalysesID,
  fetchRepeatmaskerAnalysesByAssemblyID,
  INcbiTaxon,
  IRepeatmaskerAnalysis,
  NotificationObject,
  updateAnalysisLabel,
} from "../../../../../../../../../../api";
import Input from "../../../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../../../tsInterfaces/tsInterfaces";
import EditLabelForm from "../../../EditAssemblyLabelForm/components/EditLabelForm";

const EditRepeatmaskersForm = ({
  taxon,
  assembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
}) => {
  const [repeatmaskers, setRepeatmaskers] = useState<IRepeatmaskerAnalysis[]>([]);
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
    loadRepeatmaskerAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly.id]);

  const loadRepeatmaskerAnalyses = async () => {
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
        loadRepeatmaskerAnalyses();

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
        {repeatmaskers && repeatmaskers.length > 0 ? (
          repeatmaskers.map((repeatmasker) => (
            <div
              key={repeatmasker.analysisID}
              className="border-t border-b odd:bg-indigo-50 shadow"
            >
              <div className="flex py-4 text-center items-center">
                <div className="w-16">{repeatmasker.analysisID}</div>
                <div className="w-2/5 flex justify-center items-center">
                  {repeatmasker.label || repeatmasker.name}
                </div>
                <div className="w-1/5">{repeatmasker.username}</div>
                <div className="w-2/5">{repeatmasker.addedOn}</div>
                <div className="flex justify-around items-center w-48">
                  <div
                    onClick={() => {
                      setToggleConfirmDeletion(-1);
                      setConfirmDeletion("");
                      setToggleEditLabel((prevState) =>
                        prevState !== repeatmasker.analysisID ? repeatmasker.analysisID : -1
                      );
                    }}
                    className="p-1 hover:bg-gray-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                  >
                    {toggleEditLabel !== repeatmasker.analysisID ? (
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
                          prevState !== repeatmasker.analysisID ? repeatmasker.analysisID : -1
                        );
                      }}
                      className="p-1 hover:bg-red-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                    >
                      {toggleConfirmDeletion !== repeatmasker.analysisID ? (
                        <Trash className="stroke-current" color="blank" size="small" />
                      ) : (
                        <Close className="stroke-current" color="blank" size="small" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {(toggleConfirmDeletion || toggleEditLabel) && <hr className="shadow" />}
              {toggleConfirmDeletion === repeatmasker.analysisID && (
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
                                handleDeleteAnalyses(repeatmasker.analysisID, e.target.value)
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
              {toggleEditLabel === repeatmasker.analysisID && (
                <EditLabelForm
                  target={repeatmasker}
                  updateLabel={updateAnalysisLabel}
                  reloadTarget={loadRepeatmaskerAnalyses}
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

export default EditRepeatmaskersForm;
