import { Trash } from "grommet-icons";
import { SetStateAction, useRef, useState } from "react";
import {
  fetchTaxonByTaxonID,
  importImage,
  INcbiTaxon,
  NotificationObject,
  removeImageByTaxonID,
} from "../../../../../../../../api";
import picPlacerholder from "../../../../../../../../images/blankProfilePicture.png";
import Button from "../../../../../../../../components/Button";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import SpeciesProfilePictureViewer from "../../../../../../../../components/SpeciesProfilePictureViewer";

const TaxonImageEditor = ({
  taxon,
  setTaxon,
}: {
  taxon: INcbiTaxon;
  setTaxon: SetStateAction<any>;
}) => {
  const [file, setFile] = useState<any>();
  const [preview, setPreview] = useState<any>();

  const inputRef = useRef<HTMLInputElement>(null);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleChangeImage = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const img = e.target.files[0];
      if (img.type.includes("image")) {
        setPreview(URL.createObjectURL(img));
        setFile(img);
        e.target.value = null;
      }
    }
  };

  const handleSubmitImage = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    const data = new FormData();
    data.append("image", file);
    data.append("taxonID", taxon.id + "");
    data.append("taxonScientificName", taxon.scientificName);
    data.append("userID", userID);
    data.append("token", token);
    if (data && file && taxon && userID && token) {
      const response = await importImage(data);

      if (response && response.notification?.length > 0) {
        response.notification.map((not) => handleNewNotification(not));
      }

      if (response && response.payload) {
        fetchTaxonByTaxonID(taxon.id, userID, token).then((responseTaxa) => {
          if (responseTaxa && responseTaxa.payload) {
            setTaxon(responseTaxa.payload);
          }
        });
        URL.revokeObjectURL(preview);
        setPreview(undefined);
      }
    }
  };

  const handleRemoveImage = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (taxon && taxon.id && taxon.imagePath && userID && token) {
      const response = await removeImageByTaxonID(taxon.id, userID, token);

      if (response && response.notification?.length > 0) {
        response.notification.map((not) => handleNewNotification(not));
      }

      if (response && response.payload) {
        fetchTaxonByTaxonID(taxon.id, userID, token).then((responseTaxa) => {
          if (responseTaxa && responseTaxa.payload) {
            setTaxon(responseTaxa.payload);
          }
        });
      }
    }
  };

  return (
    <div className="animate-grow-y w-full">
      <div className="flex border-t border-b text-center py-2 text-sm font-semibold text-white bg-gray-500 border-white">
        <span className="px-4">
          {taxon && taxon.imagePath ? "Change or remove image..." : "Add image..."}
        </span>
      </div>
      <div className="flex items-center justify-center py-4">
        {taxon && taxon.imagePath && (
          <div className="w-64 mx-4">
            <div className="text-center py-2 font-semibold">Current taxon image:</div>
            <div className="w-64 h-64 animate-fade-in rounded-lg overflow-hidden shadow">
              <SpeciesProfilePictureViewer taxonID={taxon.id} imagePath={taxon.imagePath} />
            </div>
            <div className="mt-4 flex justify-center">
              <div
                className="bg-red-600 text-white flex items-center rounded-lg p-2 cursor-pointer hover:bg-red-500"
                onClick={() => handleRemoveImage()}
              >
                <Trash className="stroke-current" color="blank" />
              </div>
            </div>
          </div>
        )}
        <div className="w-64 mx-4">
          <div className="text-center py-2 font-semibold">Preview:</div>
          <div
            className="bg-gray-700 h-64 w-64 animate-fade-in rounded-lg overflow-hidden shadow"
            style={{ aspectRatio: "1 / 1" }}
          >
            <img
              className="h-full w-full object-fit bg-black"
              src={preview || picPlacerholder}
              alt="PrewiewImage"
            />
          </div>
          {inputRef && (
            <div className="flex justify-between mt-4">
              <div>
                <Button
                  color="secondary"
                  label="Browse local files..."
                  onClick={() => inputRef.current?.click()}
                />
              </div>
              <div className={!preview ? "invisible" : "animate-fade-in"}>
                <Button
                  disabled={!preview}
                  label="Submit"
                  color="confirm"
                  onClick={() => handleSubmitImage()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex">
        <input
          className="hidden"
          ref={inputRef}
          type="file"
          placeholder="Browse your local files..."
          onChange={(e) => handleChangeImage(e)}
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default TaxonImageEditor;
