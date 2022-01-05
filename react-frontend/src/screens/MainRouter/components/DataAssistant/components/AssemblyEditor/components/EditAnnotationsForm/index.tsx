import { Close, Tag, Trash } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteAnnotationByAnnotationID,
  fetchAnnotationsByAssemblyID,
  IAnnotation,
  INcbiTaxon,
  NotificationObject,
  updateAnnotationLabel,
} from "../../../../../../../../api";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../tsInterfaces/tsInterfaces";
import EditLabelForm from "../EditAssemblyLabelForm/components/EditLabelForm";

const EditAnnotationsForm = ({
  taxon,
  assembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
}) => {
  const [annotations, setAnnotations] = useState<IAnnotation[]>([]);
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
    loadAnnotations();
  }, [assembly.id]);

  const loadAnnotations = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly && assembly.id && userID && token) {
      const response = await fetchAnnotationsByAssemblyID(assembly.id, userID, token);

      if (response) {
        if (response.payload) {
          setAnnotations(response.payload);
        }
      }
    }
  };

  const handleDeleteAnnotation = async (annotationID: number, confirmationString: string) => {
    setConfirmDeletion(confirmationString);

    if (confirmationString === "REMOVE") {
      const userID = JSON.parse(sessionStorage.getItem("userID") || "");
      const token = JSON.parse(sessionStorage.getItem("token") || "");

      if (annotationID && userID && token) {
        setIsRemoving(true);
        const response = await deleteAnnotationByAnnotationID(annotationID, userID, token);
        setToggleConfirmDeletion(-1);
        setConfirmDeletion("");
        loadAnnotations();

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
        {annotations && annotations.length > 0 ? (
          annotations.map((annotation) => (
            <div key={annotation.id} className="border-t border-b odd:bg-indigo-50 shadow">
              <div className="flex py-4 text-center items-center">
                <div className="w-16">{annotation.id}</div>
                <div className="w-2/5 flex justify-center items-center">
                  {annotation.label || annotation.name}
                </div>
                <div className="w-1/5">{annotation.username}</div>
                <div className="w-2/5">{annotation.addedOn}</div>
                <div className="flex justify-around items-center w-48">
                  <div
                    onClick={() => {
                      setToggleConfirmDeletion(-1);
                      setConfirmDeletion("");
                      setToggleEditLabel((prevState) =>
                        prevState !== annotation.id ? annotation.id : -1
                      );
                    }}
                    className="p-1 hover:bg-gray-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                  >
                    {toggleEditLabel !== annotation.id ? (
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
                          prevState !== annotation.id ? annotation.id : -1
                        );
                      }}
                      className="p-1 hover:bg-red-600 hover:text-white cursor-pointer transition duration-300 flex rounded-lg transform scale-125"
                    >
                      {toggleConfirmDeletion !== annotation.id ? (
                        <Trash className="stroke-current" color="blank" size="small" />
                      ) : (
                        <Close className="stroke-current" color="blank" size="small" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {(toggleConfirmDeletion || toggleEditLabel) && <hr className="shadow" />}
              {toggleConfirmDeletion === annotation.id && (
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
                                handleDeleteAnnotation(annotation.id, e.target.value)
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
              {toggleEditLabel === annotation.id && (
                <EditLabelForm
                  target={annotation}
                  updateLabel={updateAnnotationLabel}
                  reloadTarget={loadAnnotations}
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

export default EditAnnotationsForm;
