import { Edit } from "grommet-icons";
import { useEffect, useState } from "react";
import { fetchAssembliesByTaxonID, INcbiTaxon } from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import NewAssemblyImportForm from "./components/ImportForm";

const AssemblyPicker = ({ taxon }: { taxon: INcbiTaxon }) => {
  const [assemblies, setAssemblies] = useState<any>([]);
  const [toggleStatistics, setToggleStatistics] = useState<number>(-1);
  const [toggleFileTree, setToggleFileTree] = useState<boolean>(false);

  const [newAssembly, setNewAssembly] = useState<any>({});
  const [newAnnotations, setNewAnnotations] = useState<any>([]);
  const [newMappings, setNewMappings] = useState<any>([]);
  const [newBuscos, setNewBuscos] = useState<any>([]);
  const [newFcats, setNewFcats] = useState<any>([]);
  const [newMilts, setNewMilts] = useState<any>([]);
  const [newRepeatmaskers, setNewRepeatmaskers] = useState<any>([]);

  useEffect(() => {
    loadAssemblies();
  }, []);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadAssemblies = async () => {
    const userID = sessionStorage.getItem("userID");
    const token = sessionStorage.getItem("token");

    if (userID && token) {
      const response = await fetchAssembliesByTaxonID(taxon.id, parseInt(userID), token);
      if (response) {
        if (response.payload) {
          setAssemblies(response.payload);
        }
        if (response.notification && response.notification.length) {
          response.notification.map((notification: Notification) =>
            handleNewNotification(notification)
          );
        }
      }
    }
  };

  const handleToggleStatistics = (id: number) => {
    if (id === toggleStatistics) {
      setToggleStatistics(-1);
    } else {
      setToggleStatistics(id);
    }
  };

  return (
    <div className="animate-grow-y">
      <div className="flex justify-between border-t border-b py-2 px-4 text-sm font-semibold text-white bg-gray-500 border-white">
        <div className="w-1/12">ID</div>
        <div className="w-1/5">Name</div>
        <div className="w-1/5">Added by</div>
        <div className="w-2/5">Added on</div>
        <div className="w-1/12" />
      </div>
      <div>
        {assemblies &&
          assemblies.length > 0 &&
          assemblies.map((assembly: any) => (
            <div
              key={assembly.id}
              className={
                toggleStatistics === assembly.id
                  ? "border-t border-b odd:bg-indigo-50 font-semibold"
                  : "border-t border-b odd:bg-indigo-50"
              }
            >
              <div
                className="flex justify-between px-4 py-4"
                onClick={() => handleToggleStatistics(assembly.id)}
              >
                <div className="w-1/12">{assembly.id}</div>
                <div className="w-1/5">{assembly.name}</div>
                <div className="w-1/5">{assembly.username}</div>
                <div className="w-2/5">{assembly.addedOn}</div>
                <div className="w-1/12">
                  <Edit className="stroke-current" color="blank" size="small" />
                </div>
              </div>
              <div>
                {toggleStatistics === assembly.id && (
                  <div className="animate-grow-y">
                    <hr className="my-2 shadow" />
                    <div>
                      {Object.keys(assembly).map((key: string) => (
                        <div className="flex justify-between">
                          <div>{key}</div>
                          <div>{assembly[key]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      <hr className="my-4 shadow" />
      {!toggleFileTree && (
        <div className="flex justify-center">
          <div className="w-96">
            <Button label="Add new assembly..." onClick={() => setToggleFileTree(true)} />
          </div>
        </div>
      )}
      {toggleFileTree && <NewAssemblyImportForm taxon={taxon} />}
    </div>
  );
};

export default AssemblyPicker;
