import { useEffect, useState } from "react";
import "../../App.css";
import PropTypes from "prop-types";
import picPlacerholder from "../../images/blankProfilePicture.png";
import { fetchSpeciesProfilePictureTaxonID } from "../../api";

const SpeciesProfilePictureViewer = ({ taxonID, imageStatus }) => {
  return (
    <img
      className="w-full h-full object-fill"
      alt="Species profile"
      src={
        imageStatus
          ? "http://localhost:3002/fetchSpeciesProfilePictureTaxonID?taxonID=" +
            taxonID
          : picPlacerholder
      }
    />
  );
};

SpeciesProfilePictureViewer.defaultProps = {};

SpeciesProfilePictureViewer.propTypes = {
  taxonID: PropTypes.number.isRequired,
};

export default SpeciesProfilePictureViewer;
