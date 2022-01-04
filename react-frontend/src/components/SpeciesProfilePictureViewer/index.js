import "../../App.css";
import PropTypes from "prop-types";
import picPlacerholder from "../../images/blankProfilePicture.png";
import { useEffect, useState } from "react";
import { fetchTaxonImageByTaxonID } from "../../api";
import { useNotification } from "../NotificationProvider";

const SpeciesProfilePictureViewer = ({ taxonID, imagePath, useTimestamp = true }) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    getImage();
  }, [taxonID]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const getImage = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (taxonID && userID && token) {
      const response = await fetchTaxonImageByTaxonID(taxonID, userID, token);

      if (response && response.notification) {
        response.notification.forEach((not) => handleNewNotification(not));
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
    <img
      className="w-full h-full object-contain object-top"
      alt="Species profile"
      src={imagePath && image ? getImageURL() : picPlacerholder}
    />
  );
};

SpeciesProfilePictureViewer.defaultProps = {};

SpeciesProfilePictureViewer.propTypes = {
  taxonID: PropTypes.number.isRequired,
};

export default SpeciesProfilePictureViewer;
