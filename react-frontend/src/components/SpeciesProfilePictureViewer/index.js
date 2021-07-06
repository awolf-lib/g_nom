import React, { useEffect, useState } from "react";
import "../../App.css";
import PropTypes from "prop-types";
import API from "../../api";
import picPlacerholder from "../../images/blankProfilePicture.png";

const SpeciesProfilePictureViewer = ({ taxonID }) => {
  const [mounted, setMounted] = useState(true);
  const [url, setUrl] = useState(undefined);

  useEffect(() => {
    fetchImage(taxonID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchImage = async (taxonID) => {
    const api = new API();
    const blob = await api.fetchImageByTaxonID(taxonID);

    let tmpURL;

    if (blob) {
      if (blob.type && blob.type) {
        var urlCreator;
        switch (blob.type) {
          case "image/png":
            urlCreator = window.URL || window.webkitURL;
            tmpURL = urlCreator.createObjectURL(blob);
            break;

          case "image/jpeg":
            urlCreator = window.URL || window.webkitURL;
            tmpURL = urlCreator.createObjectURL(blob);
            break;

          case "application/json":
            break;

          default:
            break;
        }
      }
      if (mounted) {
        setUrl(tmpURL);
      }
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
