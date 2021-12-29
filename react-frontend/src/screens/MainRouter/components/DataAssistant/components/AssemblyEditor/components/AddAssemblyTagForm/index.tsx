import { Checkmark, Close, Trash } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  addAssemblyTag,
  fetchAssemblyTagsByAssemblyID,
  INcbiTaxon,
  removeAssemblyTagbyTagID,
} from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import {
  AssemblyInterface,
  AssemblyTagInterface,
} from "../../../../../../../../tsInterfaces/tsInterfaces";

const AddAssemblyTagForm = ({
  taxon,
  assembly,
}: {
  taxon: INcbiTaxon;
  assembly: AssemblyInterface;
}) => {
  const [tags, setTags] = useState<AssemblyTagInterface[]>();
  const [newAssemblyTag, setNewAssemblyTag] = useState<string>("");
  const [hoverTag, setHoverTag] = useState<number>(-1);
  const [removeTagConfirmation, setRemoveTagConfirmation] = useState<number>(-1);

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
    loadTags();
  }, []);

  const loadTags = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly && assembly.id && userID && token) {
      const response = await fetchAssemblyTagsByAssemblyID(assembly.id, userID, token);

      if (response && response.payload) {
        setTags(
          response.payload.map((tag) => ({
            ...tag,
            ...createColorCombination(),
          }))
        );
      }

      if (response && response.notification && response.notification.length > 0) {
        response.notification.map((not) => handleNewNotification(not));
      }
    }
  };

  const handleChangeNewAssemblyTag = (tag: string) => {
    if (tag.length <= 45) {
      setNewAssemblyTag(tag);
    }
  };

  const handleAddNewAssemblyTag = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (assembly && assembly.id && newAssemblyTag && userID && token) {
      if (!tags?.find((x) => x.tag.toUpperCase() === newAssemblyTag.toUpperCase())) {
        const response = await addAssemblyTag(
          assembly.id,
          newAssemblyTag.toUpperCase(),
          userID,
          token
        );

        if (response && response.notification && response.notification.length > 0) {
          response.notification.map((not) => handleNewNotification(not));
        }

        setNewAssemblyTag("");
        loadTags();
      } else {
        handleNewNotification({ label: "Info", message: "Tag already exists!", type: "info" });
      }
    } else {
      handleNewNotification({ label: "Error", message: "Missing input!", type: "error" });
    }
  };

  const handleRemoveAssemblyTag = async (tag: AssemblyTagInterface) => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (tag && tag.id && userID && token) {
      const response = await removeAssemblyTagbyTagID(tag.id, userID, token);

      if (response && response.notification && response.notification.length > 0) {
        response.notification.map((not) => handleNewNotification(not));
      }

      setRemoveTagConfirmation(-1);
      setHoverTag(-1);
      loadTags();
    }
  };

  const createColorCombination = () => {
    // Generate random RGB values
    var r = Math.floor(Math.random() * 15 - 1);
    var g = Math.floor(Math.random() * 175 - 1);
    var b = Math.floor(Math.random() * 150 - 1);
    // Calculate brightness of randomized colour
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // Calculate brightness of white and black text
    var lightText = (255 * 299 + 255 * 587 + 255 * 114) / 1000;
    var darkText = (0 * 299 + 0 * 587 + 0 * 114) / 1000;

    let backgroundColor = "rgb(" + r + "," + g + "," + b + ")";

    let color;
    if (Math.abs(brightness - lightText) > Math.abs(brightness - darkText)) {
      color = "rgb(255, 255, 255)";
    } else {
      color = "rgb(0, 0, 0)";
    }

    return { backgroundColor: backgroundColor, color: color };
  };

  return (
    <div className="animate-grow-y">
      <div className="flex border-t border-b text-center px-4 py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        Edit assembly tags...
      </div>
      <div>
        <div className="relative flex flex-wrap justify-around items-center py-2 border rounded mt-2">
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <div
                key={tag.id}
                style={{ backgroundColor: tag.backgroundColor, color: tag.color }}
                className="mb-4 mx-4 max-w-max cursor-pointer text-sm font-bold flex justify-between items-center py-1 px-2 rounded-lg uppercase ring-1 ring-gray-400 shadow-lg"
                onMouseEnter={() => setHoverTag(index)}
                onMouseLeave={() => {
                  setRemoveTagConfirmation(-1);
                  setHoverTag(-1);
                }}
                onClick={() => setRemoveTagConfirmation(index)}
              >
                <span className="text-center px-2 py-1">
                  {removeTagConfirmation !== index ? tag.tag : "DELETE?"}
                </span>
                {hoverTag === index && removeTagConfirmation !== index && (
                  <div className="flex items-center">
                    <Trash className="stroke-current" color="blank" size="small" />
                  </div>
                )}
                {hoverTag === index && removeTagConfirmation === index && (
                  <div className="flex items-center animate-grow-y">
                    <div className="bg-green-600 text-white p-1 rounded-full flex items-center cursor-pointer hover:bg-green-400">
                      <Checkmark
                        className="stroke-current"
                        color="blank"
                        size="small"
                        onClick={() => handleRemoveAssemblyTag(tag)}
                      />
                    </div>
                    <div className="bg-red-600 text-white p-1 rounded-full flex items-center cursor-pointer hover:bg-red-400 ml-2">
                      <Close
                        className="stroke-current"
                        color="blank"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveTagConfirmation(-1);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex justify-center py-4">No items!</div>
          )}
        </div>
      </div>
      <hr className="shadow my-4" />
      <div className="flex">
        <label className="mx-4 flex items-center w-full">
          <span className="w-32 font-semibold flex justify-center items-center">New tag...</span>
          <div className="relative w-full mx-4">
            <Input
              placeholder="Max. 45 characters..."
              value={newAssemblyTag}
              onChange={(e) => handleChangeNewAssemblyTag(e.target.value)}
            />
            <div className="absolute bottom-0 right-0 m-2 text-xs">
              {newAssemblyTag && newAssemblyTag.length + "/45"}
            </div>
          </div>
        </label>
        <div className="mx-4 w-20">
          <Button label="Add" color="confirm" onClick={() => handleAddNewAssemblyTag()} />
        </div>
      </div>
    </div>
  );
};

export default AddAssemblyTagForm;
