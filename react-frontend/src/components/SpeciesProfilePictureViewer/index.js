import React, { Component } from "react";
import "../../App.css";
import PropTypes from "prop-types";
import API from "../../api/genomes";
import picPlacerholder from "../../images/blankProfilePicture.png";

class SpeciesProfilePictureViewer extends Component {
  constructor(props) {
    super();
    this.state = { url: undefined };

    this.mounted = true;
  }

  componentDidMount() {
    this.fetchImage(this.props.taxonID);
  }

  async fetchImage(taxonID) {
    var api = new API();
    var blob = await api.fetchImageByTaxonID(taxonID);

    var tmpURL;

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
      if (this.mounted) {
        this.setState({ url: tmpURL });
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { url } = this.state;
    return (
      <img
        className="w-full h-full object-fill"
        alt="Species profile"
        src={url || picPlacerholder}
      />
    );
  }
}

SpeciesProfilePictureViewer.defaultProps = {};

SpeciesProfilePictureViewer.propTypes = {
  taxonID: PropTypes.number.isRequired,
};

export default SpeciesProfilePictureViewer;
