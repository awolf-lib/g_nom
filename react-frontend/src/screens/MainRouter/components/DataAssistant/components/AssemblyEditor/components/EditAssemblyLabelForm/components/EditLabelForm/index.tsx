import { CaretNext, CaretPrevious } from "grommet-icons";
import { useState } from "react";
import {
  IAnalyses,
  IAnnotation,
  IMapping,
  IResponse,
  NotificationObject,
} from "../../../../../../../../../../api";
import Button from "../../../../../../../../../../components/Button";
import Input from "../../../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import { AssemblyInterface } from "../../../../../../../../../../tsInterfaces/tsInterfaces";

interface AssemblyInterfaceExtended extends AssemblyInterface {
  analysisID?: number;
}
interface IAnnotationExtended extends IAnnotation {
  analysisID?: number;
}
interface IMappingExtended extends IMapping {
  analysisID?: number;
}

type LabelTargets = AssemblyInterfaceExtended | IAnnotationExtended | IMappingExtended | IAnalyses;

const EditLabelForm = ({
  target,
  reloadTarget,
  updateLabel,
}: {
  target: LabelTargets;
  reloadTarget: (...args: any) => void;
  updateLabel: (
    assemblyID: number,
    label: string,
    userID: number,
    token: string
  ) => Promise<IResponse>;
}) => {
  const [label, setLabel] = useState<string>("");

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleChangeLabel = (label: string) => {
    if (label.length <= 50) {
      setLabel(label);
    }
  };

  const handleSubmitLabel = async (id: number) => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token) {
      if (id) {
        if (label) {
          await updateLabel(id, label, userID, token).then((response) => {
            if (response.notification) {
              response.notification.forEach((not) => handleNewNotification(not));
            }

            if (response.payload) {
              setLabel("");
              if (reloadTarget) {
                reloadTarget(id, userID, token);
              }
            }
          });
        }
      }
    }
  };

  const handleRestoreLabel = async (id: number) => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token) {
      if (id) {
        await updateLabel(id, "", userID, token).then((response) => {
          if (response.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }

          if (response.payload) {
            setLabel("");
            if (reloadTarget) {
              reloadTarget(id, userID, token);
            }
          }
        });
      }
    }
  };

  return (
    <div className="animate-grow-y bg-white px-4 mx-1 my-4 shadow rounded-lg border">
      <div className="font-semibold text-sm py-2">Change annotation label:</div>
      <div className="mt-2 mb-8">
        <div className="flex justify-center items-center mb-2">
          <div className="mx-8 w-96 font-semibold text-center">Current label:</div>
          <div className="w-8" />
          <div className="mx-8 w-96 font-semibold text-center">Change to:</div>
          <div className="w-24" />
        </div>
        <div className="flex justify-center items-center">
          <div className="mx-8 w-96 truncate border-gray-600 text-center">
            {target.label || target.name}
          </div>
          <div className="flex items-center justify-center w-8">
            <CaretNext className="stroke-current" color="blank" size="small" />
          </div>
          <div className="mx-8 w-96 relative">
            <Input
              placeholder="Max. 50 chararcters..."
              value={label}
              onChange={(e: any) => handleChangeLabel(e.target.value)}
            />
            <div className="absolute right-0 text-xs mt-px mr-1">{label.length + "/50"}</div>
          </div>
          <div className="w-24">
            <Button
              label="Change"
              color="confirm"
              onClick={() => handleSubmitLabel(target.analysisID || target.id)}
            />
          </div>
        </div>
      </div>
      <hr className="shadow" />
      <div className="font-semibold text-sm py-2">Restore default value:</div>
      <div className="mb-1">
        <div className="flex justify-center items-center mb-2">
          <div className="mx-8 w-96 font-semibold text-center">Default name:</div>
          <div className="w-8" />
          <div className="mx-8 w-96" />
          <div className="w-24" />
        </div>
        <div className="mt-2 mb-8 flex items-center justify-center">
          <div className="mx-8 w-96 truncate text-center">{target.name}</div>
          <div className="w-8 flex items-center justify-center">
            <CaretPrevious className="stroke-current" color="blank" size="small" />
          </div>
          <div className="mx-8 w-96">
            <Button
              label="Restore default name"
              color="secondary"
              onClick={() => {
                handleRestoreLabel(target.analysisID || target.id);
              }}
            />
          </div>
          <div className="w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default EditLabelForm;
