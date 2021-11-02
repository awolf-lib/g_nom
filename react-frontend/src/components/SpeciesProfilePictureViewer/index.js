import "../../App.css";
import PropTypes from "prop-types";
import picPlacerholder from "../../images/blankProfilePicture.png";

const SpeciesProfilePictureViewer = ({ taxonID, imageStatus }) => {
  return (
    <img
      className="w-full h-full object-fill"
      alt="Species profile"
      src={
        imageStatus
          ? process.env.REACT_APP_API_ADRESS +
            "/fetchSpeciesProfilePictureTaxonID?taxonID=" +
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
