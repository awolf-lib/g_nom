import { Close, Document, Folder } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  fetchAssembliesByTaxonID,
  fetchTaxonByNCBITaxonID,
  importFiles,
} from "../../../../../../api";
import Button from "../../../../../../components/Button";
import Input from "../../../../../../components/Input";
import { useNotification } from "../../../../../../components/NotificationProvider";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";

const ImportForm = () => {
  const [requestTimeoutTaxonID, setRequestTimeoutTaxonID] = useState<any>();
  const [taxa, setTaxa] = useState<any>([]);
  const [taxon, setTaxon] = useState<any>({});
  const [loadingTaxa, setLoadingTaxa] = useState<boolean>(false);

  const [assemblies, setAssemblies] = useState<any>([]);
  const [assembly, setAssembly] = useState<any>({});
  const [loadingAssemblies, setLoadingAssemblies] = useState<boolean>(false);

  const [newFiles, setNewFiles] = useState<any>([]);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [edit, setEdit] = useState<string>("");
  const [newLabel, setNewLabel] = useState<string>("");

  useEffect(() => {
    if (taxon) {
      getAssemblies();
    }
  }, [taxon]);

  const getTaxon = (id: number | undefined) => {
    clearTimeout(requestTimeoutTaxonID);
    setTaxon(undefined);
    setTaxa([]);
    if (id) {
      setRequestTimeoutTaxonID(
        setTimeout(() => {
          setLoadingTaxa(true);
          fetchTaxonByNCBITaxonID(id).subscribe((response) => {
            if (response.payload) {
              setTaxa(response.payload);

              if (response.payload.length == 1) {
                setTaxon(response.payload[0]);
              }
            }

            if (response.notification && response.notification.message) {
              handleNewNotification(response.notification);
            }
          });
          setLoadingTaxa(false);
        }, 3000)
      );
    }
  };

  const getAssemblies = () => {
    setLoadingAssemblies(true);
    fetchAssembliesByTaxonID(taxon.id).subscribe((response) => {
      setAssemblies(response.payload);
    });
    setLoadingAssemblies(false);
  };

  const addNewFiles = (file: any) => {
    if (file.type || file.dirType) {
      if (
        !newFiles.find(
          (item: any) =>
            item.id === file.id ||
            (item.children &&
              item.children.find((child: any) => child.id === file.id)) ||
            (file.children &&
              file.children.find((child: any) => child.id === item.id))
        )
      ) {
        if (file.type === "sequence" || file.dirType === "sequence") {
          setAssembly({ ...file, new: true });
        } else {
          setNewFiles((prevState: any) => [...prevState, file]);
        }
      } else {
        handleNewNotification({
          label: "Info",
          message: "File already marked for import!",
          type: "info",
        });
      }
    } else {
      handleNewNotification({
        label: "Error",
        message: "File pattern does not match supported file types!",
        type: "error",
      });
    }
  };

  const removeFromNewFiles = (id: any) => {
    setNewFiles((prevState: any) =>
      prevState.filter((file: any) => file.id !== id)
    );
  };

  const ignoreFileAssembly = (id: any) => {
    if (assembly && assembly.children) {
      const children = assembly.children.map((file: any) => {
        if (file.id === id) {
          if (!file.type) {
            return { ...file, ignore: !file.ignore };
          } else {
            handleNewNotification({
              label: "Info",
              message: "File cannot be ignored!",
              type: "info",
            });
            return file;
          }
        }
        return file;
      });
      setAssembly({ ...assembly, children: children });
    }
  };

  const ignoreFileDownstream = (id: any) => {
    setNewFiles(
      newFiles.map((file: any) => {
        if (file.children) {
          const children = file.children.map((child: any) => {
            if (child.id === id) {
              if (!child.type) {
                return { ...child, ignore: !child.ignore };
              } else {
                handleNewNotification({
                  label: "Info",
                  message: "File cannot be ignored!",
                  type: "info",
                });
                return child;
              }
            } else {
              return child;
            }
          });
          return { ...file, children: children };
        }
        return file;
      })
    );
  };

  const relabelFile = (id: any, newLabel: string) => {
    setNewFiles(
      newFiles.map((file: any) => {
        if (file.children) {
          const children = file.children.map((child: any) => {
            if (child.id === id) {
              return { ...child, name: newLabel };
            } else {
              return child;
            }
          });
          return { ...file, children: children };
        }
      })
    );
  };

  const submitImport = async () => {
    let error = false;

    if (!taxon || !taxon.id) {
      handleNewNotification({
        label: "Info",
        message: "Specify target taxon before submitting!",
        type: "info",
      });
      error = true;
    }

    if (!assembly || !assembly.name) {
      handleNewNotification({
        label: "Info",
        message: "Specify target assembly before submitting!",
        type: "info",
      });
      error = true;
    }

    if (error) {
      return;
    }

    const response = await importFiles({
      taxon: taxon,
      assembly: assembly,
      analyses: newFiles,
    });

    console.log(response);

    console.log({
      taxon: taxon,
      assembly: assembly,
      analyses: newFiles,
    });
  };

  const resetForm = () => {
    setTaxa([]);
    setTaxon({});
    setAssemblies([]);
    setAssembly({});
    setNewFiles([]);
  };

  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  return (
    <div className="h-full text-gray-700">
      {!dragOver ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            addNewFiles(JSON.parse(e.dataTransfer.getData("text")));
            setDragOver(false);
          }}
          className="h-full p-4"
          style={{ border: dragOver ? "dashed 2px gray" : "" }}
        >
          <div className="shadow p-2 border rounded-lg">
            <label className="flex justify-around items-center truncate">
              <div className="text-center text-shadow font-semibold">
                Specify target taxon:
              </div>
              <div className="p-1 text-sm">
                <Input
                  type="number"
                  size="small"
                  onChange={(e) => getTaxon(e.target.value)}
                  placeholder="NCBI taxonomy ID..."
                />
              </div>
            </label>

            {taxon && taxon.id && (
              <div className="px-2 py-2 border rounded-lg mt-2 grid grid-rows-2 grid-cols-6 animate-grow-y bg-white">
                <div className="row-span-2 flex justify-center items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <SpeciesProfilePictureViewer
                      taxonID={taxon.ncbiTaxonID}
                      imageStatus={taxon.imageStatus}
                    />
                  </div>
                </div>
                <div className="col-span-2 text-xs flex items-center">
                  Scientific name:
                </div>
                <div className="col-span-2 text-xs flex items-center">
                  Common name:
                </div>
                <div className="text-xs flex items-center">Rank:</div>
                <div className="col-span-2 uppercase text-xs flex items-center justify-center font-bold truncate">
                  {taxon.scientificName}
                </div>
                <div className="col-span-2 uppercase text-xs flex items-center justify-center font-bold">
                  {taxon.commonName}
                </div>
                <div className="uppercase text-xs flex items-center justify-center font-bold">
                  {taxon.taxonRank}
                </div>
              </div>
            )}
          </div>

          <hr className="my-4 shadow" />

          <div className="shadow p-2 mt-2 border rounded overflow-hidden">
            {assemblies && assemblies.length > 0 && (
              <div>
                <div className="font-semibold py-1 mx-2">
                  Assemblies in database:
                </div>
                <div className="flex justify-between">
                  <div className="">Name</div>
                </div>
                {assemblies.map((item: any) => {
                  return (
                    <div
                      className="flex justify-between text-xs"
                      onClick={() =>
                        setAssembly({
                          ...item,
                          _name: item.name,
                          name: item.path.split("/").pop(),
                          type: "sequence",
                        })
                      }
                    >
                      <div className="col-span-3">{item.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <hr className="my-4 shadow" />

          <div className="shadow p-2 mt-2 border rounded overflow-hidden">
            <div className="font-semibold py-1 mx-2">Target assembly</div>
            <div className="bg-white py-2 px-4 animate-grow-y">
              <div className="flex justify-between mb-1">
                <div className="w-2/4 font-bold text-sm">Files</div>
                <div className="w-1/4 text-center font-bold text-sm">Type</div>
                <div className="w-6" />
              </div>
              <hr className="shadow mb-1" />
              {assembly && assembly.name ? (
                <div
                  key={assembly.id}
                  className="bg-white py-2 px-4 animate-grow-y"
                >
                  <div className="flex justify-between items-center hover:text-blue-600 cursor-pointer">
                    <div className="w-2/4 text-xs flex items-center">
                      {assembly && assembly.children ? (
                        <Folder
                          className="stroke-current mx-2"
                          color="blank"
                          size="small"
                        />
                      ) : (
                        <Document
                          className="stroke-current mx-2"
                          color="blank"
                          size="small"
                        />
                      )}
                      {assembly && assembly.name}
                    </div>
                    <div className="w-1/4 text-center text-xs">
                      {assembly.type || assembly.dirType}
                    </div>
                    <div className="w-6">
                      <div
                        onClick={() => setAssembly({})}
                        className="px-1 py-1 cursor-pointer rounded-lg flex justify-center items-center hover:bg-red-500 hover:text-white"
                      >
                        <Close
                          className="stroke-current"
                          color="blank"
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                  {assembly.children && (
                    <ul>
                      {assembly.children.length > 0 &&
                        assembly.children.map((child: any) => {
                          return (
                            <li
                              key={child.id}
                              className="text-xs ml-4 hover:text-blue-600 cursor-pointer select-none border-l-2"
                            >
                              <div className="w-full">
                                <div className="flex items-center">
                                  <div
                                    onClick={() => {
                                      ignoreFileAssembly(child.id);
                                    }}
                                    className={
                                      !child.ignore
                                        ? "w-full"
                                        : "w-full line-through"
                                    }
                                  >
                                    {child.children ? (
                                      <Folder
                                        className="stroke-current mx-2"
                                        color="blank"
                                        size="small"
                                      />
                                    ) : (
                                      <Document
                                        className="stroke-current mx-2"
                                        color="blank"
                                        size="small"
                                      />
                                    )}
                                    {child.name}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="flex justify-center text-sm py-2">
                  Select target assembly!
                </div>
              )}
            </div>
          </div>

          <hr className="my-4 shadow" />

          <div className="shadow p-2 mt-2 border-2 border-dashed rounded overflow-hidden">
            <div className="font-semibold py-1 mx-2">Downstream analyses</div>

            {newFiles && newFiles.length > 0 ? (
              <div className="bg-white py-2 px-4 animate-grow-y">
                <div className="flex justify-between mb-1">
                  <div className="w-2/4 font-bold text-sm">Files</div>
                  <div className="w-1/4 text-center font-bold text-sm">
                    Type
                  </div>
                  <div className="w-6" />
                </div>
                <hr className="shadow mb-1" />
                {newFiles.map((item: any) => {
                  return (
                    <div key={item.id} className="mb-4">
                      <div className="flex justify-between items-center hover:text-blue-600 cursor-pointer">
                        <div className="w-2/4 text-xs truncate flex items-center">
                          {item && item.children ? (
                            <Folder
                              className="stroke-current mx-2"
                              color="blank"
                              size="small"
                            />
                          ) : (
                            <Document
                              className="stroke-current mx-2"
                              color="blank"
                              size="small"
                            />
                          )}
                          {item && item.name}
                        </div>
                        <div className="w-1/4 text-center text-xs">
                          {item.type || item.dirType}
                        </div>
                        <div className="w-6">
                          <div
                            onClick={() => removeFromNewFiles(item.id)}
                            className="px-1 py-1 cursor-pointer rounded-lg flex justify-center items-center hover:bg-red-500 hover:text-white"
                          >
                            <Close
                              className="stroke-current"
                              color="blank"
                              size="small"
                            />
                          </div>
                        </div>
                      </div>
                      {item.children && (
                        <ul className="">
                          {item.children.length > 0 &&
                            item.children.map((child: any) => {
                              return (
                                <li
                                  key={child.id}
                                  className="text-xs ml-4 hover:text-blue-600 cursor-pointer select-none border-l-2"
                                >
                                  <div className="w-full">
                                    <div className="flex items-center">
                                      <div
                                        onClick={() => {
                                          ignoreFileDownstream(child.id);
                                        }}
                                        className={
                                          !child.ignore
                                            ? "w-full"
                                            : "w-full line-through"
                                        }
                                      >
                                        {child.children ? (
                                          <Folder
                                            className="stroke-current mx-2"
                                            color="blank"
                                            size="small"
                                          />
                                        ) : (
                                          <Document
                                            className="stroke-current mx-2"
                                            color="blank"
                                            size="small"
                                          />
                                        )}
                                        {child.name}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center text-sm py-8">
                Drop files on here to mark for import...
              </div>
            )}
          </div>

          <hr className="my-4 shadow" />

          <div className="flex justify-around items-center mt-2">
            <div className="w-1/4 min-w-min">
              <Button
                color="confirm"
                label="Submit"
                onClick={() => submitImport()}
              />
            </div>
            <div className="w-1/4 min-w-min">
              <Button
                color="cancel"
                label="Reset"
                onClick={() => resetForm()}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            addNewFiles(JSON.parse(e.dataTransfer.getData("text")));
            setDragOver(false);
          }}
          style={{ border: dragOver ? "dashed 2px lightblue" : "" }}
          className="p-4 flex h-full justify-center items-center font-bold"
        >
          Drop now to mark for import...
        </div>
      )}
    </div>
  );
};

export default ImportForm;
