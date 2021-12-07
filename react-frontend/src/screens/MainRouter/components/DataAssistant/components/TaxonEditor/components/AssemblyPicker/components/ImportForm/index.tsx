import { useState } from "react";
import { IImportFileInformation, INcbiTaxon } from "../../../../../../../../../../api";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import FileTree from "../../../../../../../../../../components/FileTree";

const NewAssemblyImportForm = ({ taxon }: { taxon: INcbiTaxon }) => {
  const [newAssembly, setNewAssembly] = useState<IImportFileInformation>();
  const [newAnnotations, setNewAnnotations] = useState<IImportFileInformation[]>([]);
  const [newMappings, setNewMappings] = useState<IImportFileInformation[]>([]);
  const [newBuscos, setNewBuscos] = useState<IImportFileInformation[]>([]);
  const [newFcats, setNewFcats] = useState<IImportFileInformation[]>([]);
  const [newMilts, setNewMilts] = useState<IImportFileInformation[]>([]);
  const [newRepeatmaskers, setNewRepeatmaskers] = useState<IImportFileInformation[]>([]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleDropFileInformation = (fileInformation: IImportFileInformation) => {
    console.log(fileInformation);
    if (fileInformation.type) {
      switch (fileInformation.type) {
        case "sequence":
          setNewAssembly(fileInformation);
          break;
        case "annotation":
          setNewAnnotations((prevState) => [...prevState, fileInformation]);
          break;
        case "mapping":
          setNewMappings((prevState) => [...prevState, fileInformation]);
          break;
        case "busco":
          setNewBuscos((prevState) => [...prevState, fileInformation]);
          break;
        case "fcat":
          setNewFcats((prevState) => [...prevState, fileInformation]);
          break;
        case "milts":
          setNewMilts((prevState) => [...prevState, fileInformation]);
          break;
        case "repeatmasker":
          setNewRepeatmaskers((prevState) => [...prevState, fileInformation]);
          break;
        default:
          break;
      }
    } else if (fileInformation.dirType) {
      switch (fileInformation.dirType) {
        case "sequence":
          setNewAssembly(fileInformation);
          break;
        case "annotation":
          setNewAnnotations((prevState) => [...prevState, fileInformation]);
          break;
        case "mapping":
          setNewMappings((prevState) => [...prevState, fileInformation]);
          break;
        case "busco":
          setNewBuscos((prevState) => [...prevState, fileInformation]);
          break;
        case "fcat":
          setNewFcats((prevState) => [...prevState, fileInformation]);
          break;
        case "milts":
          setNewMilts((prevState) => [...prevState, fileInformation]);
          break;
        case "repeatmasker":
          setNewRepeatmaskers((prevState) => [...prevState, fileInformation]);
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="animate-grow-y">
      <div className="grid grid-cols-2 gap-4">
        <div
          className="border rounded-lg p-2"
          onDragOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDrop={(e) => handleDropFileInformation(JSON.parse(e.dataTransfer.getData("fileInfos")))}
        >
          {/* Assembly */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Assembly</div>
            {newAssembly && (
              <div>
                <div className="ml-4">{newAssembly.name}</div>
                {newAssembly.children &&
                  newAssembly.children.length > 0 &&
                  newAssembly.children.map((child) => (
                    <div key={child.id} className="ml-8">
                      {child.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {/* Annotations */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Annotations</div>
            {newAnnotations &&
              newAnnotations.length > 0 &&
              newAnnotations.map((annotation) => (
                <div key={annotation.id}>
                  <div className="ml-4">{annotation.name}</div>
                  {annotation.children &&
                    annotation.children.length > 0 &&
                    annotation.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
          {/* Mappings */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Mappings</div>
            {newMappings &&
              newMappings.length > 0 &&
              newMappings.map((mapping) => (
                <div key={mapping.id}>
                  <div className="ml-4">{mapping.name}</div>
                  {mapping.children &&
                    mapping.children.length > 0 &&
                    mapping.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
          {/* Buscos */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Buscos</div>
            {newBuscos &&
              newBuscos.length > 0 &&
              newBuscos.map((busco) => (
                <div key={busco.id}>
                  <div className="ml-4">{busco.name}</div>
                  {busco.children &&
                    busco.children.length > 0 &&
                    busco.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
          {/* fCats */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Fcats</div>
            {newFcats &&
              newFcats.length > 0 &&
              newFcats.map((fcat) => (
                <div key={fcat.id}>
                  <div className="ml-4">{fcat.name}</div>
                  {fcat.children &&
                    fcat.children.length > 0 &&
                    fcat.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
          {/* Milts */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Milts</div>
            {newMilts &&
              newMilts.length > 0 &&
              newMilts.map((milts) => (
                <div key={milts.id}>
                  <div className="ml-4">{milts.name}</div>
                  {milts.children &&
                    milts.children.length > 0 &&
                    milts.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
          {/* Repeatmaskers */}
          <div className="py-2 text-sm">
            <div className="font-semibold">Repeatmaskers</div>
            {newRepeatmaskers &&
              newRepeatmaskers.length > 0 &&
              newRepeatmaskers.map((repeatmasker) => (
                <div key={repeatmasker.id}>
                  <div className="ml-4">{repeatmasker.name}</div>
                  {repeatmasker.children &&
                    repeatmasker.children.length > 0 &&
                    repeatmasker.children.map((child) => (
                      <div key={child.id} className="ml-8">
                        {child.name}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </div>
        <div className="max-h-75 min-h-1/2 border rounded-lg">
          <FileTree />
        </div>
      </div>
    </div>
  );
};

export default NewAssemblyImportForm;
