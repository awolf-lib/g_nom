import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import PropTypes from "prop-types";

import SpeciesProfilePictureViewer from "../SpeciesProfilePictureViewer";

const AssemblyInfoListItem = ({
  id,
  taxonID,
  scientificName,
  assemblyName,
  types,
  imageStored,
}) => {
  const analysisClass = (analysisDone) =>
    classNames(
      "mx-1 rounded-full px-2 py-1 text-center text-xs text-white shadow border border-gray-200 border-inset",
      {
        "bg-red-600": !analysisDone,
        "bg-green-600": analysisDone,
      }
    );
  return (
    <Link
      to={"/g-nom/assemblies/assembly:" + id}
      className="text-xs md:text-base text-center even:bg-gray-100 odd:bg-indigo-50 hover:bg-indigo-400 hover:text-white my-2 flex shadow rounded-lg truncate items-center hover:ring-2 ring-offset-1 transition duration-300"
      key={id}
    >
      <div className="sm:w-1/12 px-4 py-2 hidden sm:block">
        <div className="w-16 h-16 object-contain min-w-min rounded-lg overflow-hidden">
          <SpeciesProfilePictureViewer
            taxonID={taxonID}
            imageStatus={imageStored}
          />
        </div>
      </div>
      <div className="w-3/12 sm:w-3/12 px-4 py-2">{scientificName}</div>
      <div className="w-3/12 sm:w-2/12 px-4 py-2">{taxonID}</div>
      <div className="w-3/12 sm:w-3/12 px-4 py-2">{assemblyName}</div>
      <div className="w-3/12 sm:w-3/12 px-4 py-2 flex items-center justify-center">
        {types && (
          <div className="transform scale-75 md:scale-100 text-xs grid grid-cols-2 md:flex bg-gray-100 border border-gray-300 border-dotted shadow p-1 sm:px-2 rounded-lg transition transition duration-500">
            <div className={analysisClass(types.includes("busco"))}>B</div>
            <div className={analysisClass(types.includes("fcat"))}>F</div>
            <div className={analysisClass(types.includes("repeatmasker"))}>
              R
            </div>
            <div className={analysisClass(types.includes("milts"))}>M</div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AssemblyInfoListItem;

AssemblyInfoListItem.propTypes = {
  id: PropTypes.number.isRequired,
  scientificName: PropTypes.string,
  taxonID: PropTypes.number,
  assemblyName: PropTypes.string,
  types: PropTypes.array,
  imageStored: PropTypes.number,
};

AssemblyInfoListItem.defaultProps = {
  scientificName: "",
  taxonID: 0,
  assemblyName: "",
  types: [],
  imageStored: 0,
};
