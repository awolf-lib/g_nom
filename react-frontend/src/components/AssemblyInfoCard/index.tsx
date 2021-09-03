import React from "react";
import "../../App.css";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import SpeciesProfilePictureViewer from "../SpeciesProfilePictureViewer";
import classNames from "classnames";

export interface IAssemblyInfoProps{
  id: any,
  scientificName: any,
  taxonID: any,
  assemblyName: any,
  types: any,
  imageStatus: any
}

const AssemblyInfoCard = ({
  id,
  scientificName,
  taxonID,
  assemblyName,
  types,
  imageStatus,
}: IAssemblyInfoProps) => {
  const analysisClass = (analysisDone: boolean) =>
    classNames(
      "my-2 rounded-full px-1 text-center text-xs text-white py-px shadow",
      {
        "bg-red-600": !analysisDone,
        "bg-green-600": analysisDone,
      }
    );
  return (
    <Link
      className="flex justify-center"
      to={"/g-nom/assemblies/assembly:" + id}
      key={id}
    >
      <div className="h-36 my-4 lg:my-0 border border-outset border-gray-400 w-full max-w-lg transition duration-500 ease-in-out bg-gradient-to-b from-gray-600 to-gray-400 transform hover:-translate-y-1 hover:scale-110 flex overflow-hidden rounded-r-lg shadow-lg">
        {taxonID && (
          <div className="w-64 p-1">
            <SpeciesProfilePictureViewer
              taxonID={taxonID}
              imageStatus={imageStatus}
            />
          </div>
        )}
        <div className="w-full px-3 py-2 mr-12">
          <div className="w-full">
            {scientificName && (
              <div className="text-sm lg:text-base font-semibold text-white leading-tight hover:text-gray-300">
                {scientificName}
              </div>
            )}

            {taxonID && (
              <div className="pt-1 text-xs lg:text-normal text-white hover:text-gray-300">
                <span className="border-b border-dashed border-gray-400 mb-1">
                  {taxonID}
                </span>
              </div>
            )}

            {assemblyName && (
              <div className="absolute bottom-0 my-2 text-white text-xs">
                <div>{assemblyName}</div>
              </div>
            )}

            {types && (
              <div className="absolute right-0 inset-y-0 py-2 px-4 bg-gray-600 border-l border-gray-400">
                <div className="text-white text-xs">Status</div>
                <div className={analysisClass(types.includes("busco"))}>B</div>
                <div className={analysisClass(types.includes("fcat"))}>F</div>
                <div className={analysisClass(types.includes("repeatmasker"))}>
                  R
                </div>
                <div className={analysisClass(types.includes("milts"))}>M</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssemblyInfoCard;

AssemblyInfoCard.propTypes = {
  id: PropTypes.number.isRequired,
  scientificName: PropTypes.string,
  taxonID: PropTypes.number,
  assemblyName: PropTypes.string,
  types: PropTypes.array,
};

AssemblyInfoCard.defaultProps = {
  scientificName: "",
  taxonID: 0,
  assemblyName: "",
  types: [],
};
