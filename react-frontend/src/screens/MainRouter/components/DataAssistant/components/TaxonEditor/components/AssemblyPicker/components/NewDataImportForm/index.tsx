import { useEffect, useRef, useState } from "react";
import {
  IImportFileInformation,
  importDataset,
  INcbiTaxon,
  NotificationObject,
  fetchImportDirectory,
  validateFileInfo,
  Dataset,
  DatasetTypes,
  TreeNode,
  fetchTaskStatus,
} from "../../../../../../../../../../api";
import { useNotification } from "../../../../../../../../../../components/NotificationProvider";
import FileTree from "../../../../../../../../../../components/FileTree";
import Button from "../../../../../../../../../../components/Button";
import { Trash } from "grommet-icons";
import { AssemblyInterface } from "../../../../../../../../../../tsInterfaces/tsInterfaces";

const NewDataImportForm = ({
  taxon,
  loadAssemblies,
  assembly,
}: {
  taxon: INcbiTaxon;
  loadAssemblies: any;
  assembly: AssemblyInterface | undefined;
}) => {
  const [importDir, setImportDir] = useState<IImportFileInformation>();

  const [newAssembly, setNewAssembly] = useState<Dataset[]>([]);
  const [newAnnotations, setNewAnnotations] = useState<Dataset[]>([]);
  const [newMappings, setNewMappings] = useState<Dataset[]>([]);
  const [newBuscos, setNewBuscos] = useState<Dataset[]>([]);
  const [newFcats, setNewFcats] = useState<Dataset[]>([]);
  const [newTaxaminer, setNewTaxaminer] = useState<Dataset[]>([]);
  const [newRepeatmaskers, setNewRepeatmaskers] = useState<Dataset[]>([]);

  const [importing, setImporting] = useState<boolean>(false);

  const [dropHover, setDropHover] = useState<boolean>(false);

  const newAssemblyFormRef = useRef<HTMLDivElement>(null);

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
    loadImportDir();
    const interval = setInterval(() => {
      loadImportDir();
    }, 30000);

    return clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    newAssemblyFormRef.current?.scrollIntoView();
  }, [newAssemblyFormRef]);

  const loadImportDir = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    await fetchImportDirectory(userID, token).then((response) => {
      if (response && response.payload) {
        setImportDir(response.payload);
      } else {
        setImportDir(undefined);
      }
    });
  };

  const alreadyMarkedForImport = (f: IImportFileInformation, fList: Dataset[]) => {
    const isDuplicate = fList.some((marked_file) => {
      if (marked_file["main_file"].id === f.id) {
        return true;
      }

      return false;
    });

    if (isDuplicate) {
      handleNewNotification({
        label: "Info",
        message: "File '" + f["name"] + "' already marked for import!",
        type: "info",
      });
    }
    return isDuplicate;
  };

  const handleDropFileInformation = async (fileInformation: IImportFileInformation) => {
    setDropHover(false);

    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (fileInformation && userID && token) {
      const minFileInformation = removeFileTreeAttributes(fileInformation);

      await validateFileInfo(minFileInformation, userID, token).then((response) => {
        if (response && response.payload) {
          Object.keys(response.payload).forEach((fileType) => {
            switch (fileType) {
              case "sequence":
                if (!assembly?.id) {
                  if (response.payload.sequence!.length <= 1) {
                    response.payload.sequence!.forEach((x) => {
                      !alreadyMarkedForImport(x["main_file"], newAssembly) && setNewAssembly([x]);
                    });
                  } else {
                    if (!newAssembly || !newAssembly.length) {
                      setNewAssembly([
                        response.payload.sequence!.reduce(function (prev, current) {
                          return prev.main_file.size! > current.main_file.size! ? prev : current;
                        }, response.payload.sequence![0]),
                      ]);
                      handleNewNotification({
                        label: "Warning",
                        message:
                          "Directory contains multiple sequence files! Largest file selected!",
                        type: "warning",
                      });
                    } else {
                      handleNewNotification({
                        label: "Warning",
                        message: "Additional fasta-file(s) detetected!",
                        type: "warning",
                      });
                    }
                  }
                }
                break;
              case "annotation":
                response.payload.annotation!.length > 0 &&
                  response.payload.annotation!.forEach((x) => {
                    !alreadyMarkedForImport(x["main_file"], newAnnotations) &&
                      setNewAnnotations((prevState) => [...prevState, x]);
                  });
                break;
              case "mapping":
                response.payload.mapping!.length > 0 &&
                  response.payload.mapping!.forEach((x) => {
                    !alreadyMarkedForImport(x["main_file"], newMappings) &&
                      setNewMappings((prevState) => [...prevState, x]);
                  });
                break;
              case "busco":
                response.payload.busco!.length > 0 &&
                  response.payload.busco!.forEach((x) => {
                    !alreadyMarkedForImport(x["main_file"], newBuscos) &&
                      setNewBuscos((prevState) => [...prevState, x]);
                  });
                break;
              case "fcat":
                response.payload.fcat!.length > 0 &&
                  response.payload.fcat!.forEach((x) => {
                    !alreadyMarkedForImport(x["main_file"], newFcats) &&
                      setNewFcats((prevState) => [...prevState, x]);
                  });
                break;
              case "taxaminer":
                response.payload.taxaminer!.length > 0 &&
                  response.payload.taxaminer!.forEach((x) => {
                    !alreadyMarkedForImport(x["main_file"], newTaxaminer) &&
                      setNewTaxaminer((prevState) => [...prevState, x]);
                  });
                break;
              case "repeatmasker":
                response.payload.repeatmasker!.length > 0 &&
                  response.payload.repeatmasker!.forEach((x) => {
                    !alreadyMarkedForImport(x["main_file"], newRepeatmaskers) &&
                      setNewRepeatmaskers((prevState) => [...prevState, x]);
                  });
                break;
              default:
                break;
            }
          });
        }
      });
    }
  };

  const removeFileFromState = (
    prevState: Dataset[],
    mainFileID: string,
    additionalFileID: string | undefined
  ) => {
    if (!additionalFileID) {
      return prevState.filter((mainFile) => mainFile.main_file.id !== mainFileID);
    } else {
      const mainFileIndex = prevState.findIndex((mainFile) => mainFile.main_file.id === mainFileID);
      if (mainFileIndex >= 0) {
        prevState[mainFileIndex] = {
          ...prevState[mainFileIndex],
          additional_files: prevState[mainFileIndex]["additional_files"].filter(
            (additionalFile) => additionalFile.id !== additionalFileID
          ),
        };
      }
      return [...prevState];
    }
  };

  const handleRemoveFile = (
    type: DatasetTypes,
    mainFileID: string,
    additionalFileID: string | undefined = undefined
  ) => {
    switch (type) {
      case "sequence":
        if (!assembly?.id) {
          setNewAssembly((prevState) =>
            removeFileFromState(prevState, mainFileID, additionalFileID)
          );
        }
        break;
      case "annotation":
        setNewAnnotations((prevState) =>
          removeFileFromState(prevState, mainFileID, additionalFileID)
        );
        break;
      case "mapping":
        setNewMappings((prevState) => removeFileFromState(prevState, mainFileID, additionalFileID));
        break;
      case "busco":
        setNewBuscos((prevState) => removeFileFromState(prevState, mainFileID, additionalFileID));
        break;
      case "fcat":
        setNewFcats((prevState) => removeFileFromState(prevState, mainFileID, additionalFileID));
        break;
      case "taxaminer":
        setNewTaxaminer((prevState) =>
          removeFileFromState(prevState, mainFileID, additionalFileID)
        );
        break;
      case "repeatmasker":
        setNewRepeatmaskers((prevState) =>
          removeFileFromState(prevState, mainFileID, additionalFileID)
        );
        break;
      default:
        break;
    }
  };

  const removeFileTreeAttributes = (node: TreeNode): IImportFileInformation => {
    delete node.isOpen;

    if (node.children) {
      const children = node.children.map((child: TreeNode) => {
        return removeFileTreeAttributes(child);
      });

      return { ...node, children: children };
    }

    return { ...node };
  };

  const handleSubmitImport = () => {
    setImporting(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly?.id || (newAssembly && newAssembly?.length === 1)) {
      importDataset(
        taxon,
        newAssembly,
        newAnnotations,
        newMappings,
        newBuscos,
        newFcats,
        newTaxaminer,
        newRepeatmaskers,
        userID,
        token,
        assembly?.id
      ).subscribe((response) => {
        if (response && response.payload) {
          handleResetForm();
          const intervalID = setInterval(() => {
            checkTaskStatus(response.payload.id, intervalID);
          }, 30000);
        }
        if (response && response.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
        setImporting(false);
      });
    } else {
      handleNewNotification({
        label: "Error",
        message: "No or too much assemblies selected!",
        type: "error",
      });
    }
    setImporting(false);
  };

  const checkTaskStatus = async (taskID: string, intervalID: any) => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    await fetchTaskStatus(userID, token, taskID).then((response) => {
      if (!response.payload) {
        clearInterval(intervalID);
      }

      if (response.notification) {
        response.notification.forEach((not) => handleNewNotification(not));
      }
      switch (response.payload.status) {
        case "done":
          clearInterval(intervalID);
          if (loadAssemblies) {
            loadAssemblies();
          }
          return 1;
        case "running":
          return 0;
        case "aborted":
          clearInterval(intervalID);
          return 0;
        default:
          clearInterval(intervalID);
          return 0;
      }
    });
  };

  const handleResetForm = () => {
    setNewAssembly([]);
    setNewAnnotations([]);
    setNewMappings([]);
    setNewBuscos([]);
    setNewFcats([]);
    setNewTaxaminer([]);
    setNewRepeatmaskers([]);
  };

  const MarkedFiles = ({ file, type }: { file: Dataset; type: DatasetTypes }) => {
    return (
      <div className="mb-2">
        <div className="flex justify-between animate-fade-in">
          <FileTree files={file["main_file"]} />
          <div
            className="p-1 text-red-600 cursor-pointer hover:text-red-400"
            onClick={() => {
              handleRemoveFile(type, file.main_file.id);
            }}
          >
            <Trash color="blank" className="stroke-current" size="small" />
          </div>
        </div>

        <div>
          {file["additional_files"] &&
            file["additional_files"].length > 0 &&
            file["additional_files"].map((additional_files) => (
              <div key={additional_files.id} className="ml-8 animate-fade-in flex justify-between">
                <FileTree files={additional_files} />
                <div
                  className="p-1 text-red-600 cursor-pointer hover:text-red-400"
                  onClick={() => {
                    handleRemoveFile(type, file.main_file.id, additional_files.id);
                  }}
                >
                  <Trash color="blank" className="stroke-current" size="small" />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-grow-y">
      <div
        ref={newAssemblyFormRef}
        className="px-4 py-2 font-semibold text-sm text-white bg-gray-500 border-b border-t border-white"
      >
        Add new assembly?...
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="max-h-75 overflow-auto border rounded-lg py-2 px-4">
          <h1 className="font-bold text-xl">Import directory...</h1>
          <hr className="shadow my-2" />
          {importDir && <FileTree files={importDir} />}
        </div>
        <div
          className="border rounded-lg px-4 p-2 max-h-75 overflow-auto"
          onDragOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.stopPropagation();
            handleDropFileInformation(JSON.parse(e.dataTransfer.getData("fileInfos")));
          }}
        >
          <h1 className="font-bold text-xl">
            {dropHover ? "Drop now to mark for import..." : "Marked for import..."}
          </h1>
          <hr className="shadow my-2" />
          <div className="px-4 py-2">
            {/* Assembly */}
            <div className="text-sm">
              <div className="font-semibold">Assembly</div>
              {!assembly?.id ? (
                <div className="flex justify-between items-center">
                  <div className="w-full">
                    {newAssembly && newAssembly?.length > 0 ? (
                      newAssembly?.map((file) => (
                        <div key={file.main_file.id}>
                          <MarkedFiles file={file} type="sequence" />
                        </div>
                      ))
                    ) : (
                      <div className="mx-4 my-2">None</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 font-bold">{assembly?.name}</div>
              )}
            </div>
            <hr className="shadow mt-1 mb-4" />
            {/* Annotations */}
            <div className="text-sm">
              <div className="font-semibold">Annotations</div>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  {newAnnotations && newAnnotations.length > 0 ? (
                    newAnnotations.map((file) => (
                      <div key={file.main_file.id}>
                        <MarkedFiles file={file} type="annotation" />
                      </div>
                    ))
                  ) : (
                    <div className="mx-4 my-2">None</div>
                  )}
                </div>
              </div>
            </div>
            <hr className="shadow mt-1 mb-4" />
            {/* Mappings */}
            <div className="text-sm">
              <div className="font-semibold">Mappings</div>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  {newMappings && newMappings.length > 0 ? (
                    newMappings.map((file) => (
                      <div key={file.main_file.id}>
                        <MarkedFiles file={file} type="mapping" />
                      </div>
                    ))
                  ) : (
                    <div className="mx-4 my-2">None</div>
                  )}
                </div>
              </div>
            </div>
            <hr className="shadow mt-1 mb-4" />
            {/* Buscos */}
            <div className="text-sm">
              <div className="font-semibold">Busco</div>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  {newBuscos && newBuscos.length > 0 ? (
                    newBuscos.map((file) => (
                      <div key={file.main_file.id}>
                        <MarkedFiles file={file} type="busco" />
                      </div>
                    ))
                  ) : (
                    <div className="mx-4 my-2">None</div>
                  )}
                </div>
              </div>
            </div>
            <hr className="shadow mt-1 mb-4" />
            {/* fCats */}
            <div className="text-sm">
              <div className="font-semibold">fCat</div>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  {newFcats && newFcats.length > 0 ? (
                    newFcats.map((file) => (
                      <div key={file.main_file.id}>
                        <MarkedFiles file={file} type="fcat" />
                      </div>
                    ))
                  ) : (
                    <div className="mx-4 my-2">None</div>
                  )}
                </div>
              </div>
            </div>
            <hr className="shadow mt-1 mb-4" />
            {/* taXaminer */}
            <div className="text-sm">
              <div className="font-semibold">taXaminer</div>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  {newTaxaminer && newTaxaminer.length > 0 ? (
                    newTaxaminer.map((file) => (
                      <div key={file.main_file.id}>
                        <MarkedFiles file={file} type="taxaminer" />
                      </div>
                    ))
                  ) : (
                    <div className="mx-4 my-2">None</div>
                  )}
                </div>
              </div>
            </div>
            <hr className="shadow mt-1 mb-4" />
            {/* Repeatmaskers */}
            <div className="text-sm">
              <div className="font-semibold">Repeatmasker</div>
              <div className="flex justify-between items-center">
                <div className="w-full">
                  {newRepeatmaskers && newRepeatmaskers.length > 0 ? (
                    newRepeatmaskers.map((file) => (
                      <div key={file.main_file.id}>
                        <MarkedFiles file={file} type="repeatmasker" />
                      </div>
                    ))
                  ) : (
                    <div className="mx-4 my-2">None</div>
                  )}
                </div>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-around items-center py-2">
              <div className="w-28">
                <Button
                  color="confirm"
                  label={!importing ? "Submit" : "Importing..."}
                  onClick={() => handleSubmitImport()}
                />
              </div>
              <div className="w-28">
                <Button color="cancel" label="Reset" onClick={() => handleResetForm()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDataImportForm;
