import React, { useState } from "react";
import { Search, List } from "grommet-icons";

import Button from "../../../../../../components/Button";

const GenomeViewer = ({ assemblyInformation }) => {
  const [showNav, setshowNav] = useState(false);
  const [showTracklist, setShowTracklist] = useState(true);

  const configureSource = () => {
    return (
      "http://localhost:8082/index.html?data=data%2F" +
      assemblyInformation.name +
      "&nav=" +
      showNav +
      "&tracklist=" +
      showTracklist
    );
  };
  return (
    <div className="mx-8">
      <div className="rounded-lg overflow-hidden p-1 bg-white animate-grow-y relative shadow-lg border">
        <iframe
          title="jbrowse"
          className="w-full h-75 border"
          src={configureSource()}
        />
        <div className="absolute left-0 bottom-0 flex m-8">
          <div className="opacity-25 hover:opacity-100 transition duration-300 mx-4">
            <Button
              color="secondary"
              onClick={() => {
                setshowNav((prevState) => !prevState);
              }}
            >
              <Search size="small" color="blank" className="stroke-current" />
            </Button>
          </div>
          <div className="opacity-25 hover:opacity-100 transition duration-300 mx-4">
            <Button
              color="secondary"
              onClick={() => {
                setShowTracklist((prevState) => !prevState);
              }}
            >
              <List size="small" color="blank" className="stroke-current" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenomeViewer;

GenomeViewer.defaultProps = {};

GenomeViewer.propTypes = {};
