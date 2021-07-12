import React, { useEffect, useState } from "react";
import "../../App.css";
import PropTypes from "prop-types";
import picPlacerholder from "../../images/blankProfilePicture.png";

const SpeciesProfilePictureViewer = ({ taxonID, imageStatus }) => {
  const [mounted, setMounted] = useState(true);
  const [url, setUrl] = useState(undefined);

  useEffect(() => {
    fetchImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchImage = async () => {
    let url = "";
    if (taxonID && imageStatus) {
      url =
        "http://localhost:5003/g-nom/storage/api/v1/fs/taxa/images/" +
        taxonID +
        ".thumbnail.jpg";
    }

    if (mounted) {
      setUrl(url);
    }
  };

  useEffect(() => {
    return setMounted(false);
  }, []);

  return (
    <img
      className="w-full h-full object-fill"
      alt="Species profile"
      src={url || picPlacerholder}
    />
  );
};

SpeciesProfilePictureViewer.defaultProps = {};

SpeciesProfilePictureViewer.propTypes = {
  taxonID: PropTypes.number.isRequired,
};

export default SpeciesProfilePictureViewer;
