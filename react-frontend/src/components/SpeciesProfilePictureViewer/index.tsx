import "../../App.css";
import picPlacerholder from "../../images/blankProfilePicture.png";
import { useEffect, useState } from "react";
import { fetchTaxonImageByTaxonID, NotificationObject } from "../../api";
import { useNotification } from "../NotificationProvider";

const SpeciesProfilePictureViewer = ({
  taxonID,
  imagePath,
  useTimestamp = true,
}: {
  taxonID: number;
  imagePath: string;
  useTimestamp?: boolean;
}) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    getImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxonID]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const getImage = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (taxonID && userID && token && imagePath) {
      const response = await fetchTaxonImageByTaxonID(taxonID, userID, token);

      if (response && response.notification) {
        response.notification.forEach((not: NotificationObject) => handleNewNotification(not));
      }

      if (response && !response.notification) {
        setImage(response.url);
      }
    }
  };

  const getImageURL = () => {
    if (useTimestamp) {
      return image + "&hash=" + Date.now();
    } else {
      return image;
    }
  };

  return (
    <div className="bg-gray-700" style={{ aspectRatio: "1 / 1" }}>
      <img
        className="h-full object-contain bg-black"
        alt="Species profile"
        src={imagePath && image ? getImageURL() : picPlacerholder}
      />
    </div>
  );
};

export default SpeciesProfilePictureViewer;
