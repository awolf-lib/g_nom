import { Close, Tag, Trash } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteAnalysesByAnalysesID,
  fetchFcatAnalysesByAssemblyID,
  IFcatAnalysis,
  INcbiTaxon,
  updateAnalysisLabel,
} from "../../../../../../../../../../api";
import Input from "../../../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../../../tsInterfaces/tsInterfaces";
import EditLabelForm from "../../../EditAssemblyLabelForm/components/EditLabelForm";

const EditFcatsForm = ({ taxon, assembly }: { taxon: INcbiTaxon; assembly: AssemblyInterface }) => {
  const [fcats, setFcats] = useState<IFcatAnalysis[]>([]);
  const [toggleConfirmDeletion, setToggleConfirmDeletion] = useState<number>(-1);
  const [confirmDeletion, setConfirmDeletion] = useState<string>("");
  const [toggleEditLabel, setToggleEditLabel] = useState<number>(-1);

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
    loadFcats();
  }, [assembly.id]);

  const loadFcats = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly && assembly.id && userID && token) {
      const response = await fetchFcatAnalysesByAssemblyID(assembly.id, userID, token);

      if (response) {
        if (response.payload) {
          setFcats(response.payload);
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
        const response = await deleteAnalysesByAnalysesID(analysesID, userID, token);
        setToggleConfirmDeletion(-1);
        setConfirmDeletion("");
        loadFcats();

        if (response.notification && response.notification.length > 0) {
          response.notification.map((n: any) => handleNewNotification(n));
        }
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
        {fcats && fcats.length > 0 ? (
          fcats.map((fcat) => (
            <div key={fcat.analysisID} className="border-t border-b odd:bg-indigo-50 shadow">
              <div className="flex py-4 text-center items-center">
                <div className="w-16">{fcat.analysisID}</div>
                <div className="w-2/5 flex justify-center items-center">
                  {fcat.label || fcat.name}
                </div>
                <div className="w-1/5">{fcat.username}</div>
                <div className="w-2/5">{fcat.addedOn}</div>
                <div className="flex justify-around items-center w-48">
                  <div
                    onClick={() => {
                      setToggleConfirmDeletion(-1);
                      setConfirmDeletion("");
                      setToggleEditLabel((prevState) =>
                        prevState !== fcat.analysisID ? fcat.analysisID : -1
                      );
                    }}
                    className="p-1 hover:bg-gray-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                  >
                    {toggleEditLabel !== fcat.analysisID ? (
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
                          prevState !== fcat.analysisID ? fcat.analysisID : -1
                        );
                      }}
                      className="p-1 hover:bg-red-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                    >
                      {toggleConfirmDeletion !== fcat.analysisID ? (
                        <Trash className="stroke-current" color="blank" size="small" />
                      ) : (
                        <Close className="stroke-current" color="blank" size="small" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {(toggleConfirmDeletion || toggleEditLabel) && <hr className="shadow" />}
              {toggleConfirmDeletion === fcat.analysisID && (
                <div className="flex justify-center animate-grow-y">
                  <div className="mx-4 my-8">
                    <div className="flex justify-between items-center">
                      <label className="flex">
                        <span className="flex items-center mx-4 font-semibold text-sm">
                          CONFIRM DELETION:
                        </span>
                        <div className="flex items-center justify-center w-96">
                          <Input
                            placeholder="Type REMOVE..."
                            onChange={(e) => handleDeleteAnalyses(fcat.analysisID, e.target.value)}
                            value={confirmDeletion}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {toggleEditLabel === fcat.analysisID && (
                <EditLabelForm
                  target={fcat}
                  updateLabel={updateAnalysisLabel}
                  reloadTarget={loadFcats}
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

export default EditFcatsForm;
