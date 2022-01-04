import { Link } from "react-router-dom";
import classNames from "classnames";

import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import { useEffect, useState } from "react";

const AssembliesGridElement = ({
  assembly,
  fcatMode = 1,
  renderDelay = 1,
}: {
  assembly: AssemblyInterface;
  fcatMode?: number;
  renderDelay?: number;
}) => {
  const {
    id,
    taxonID,
    imagePath,
    scientificName,
    name,
    label,
    annotations,
    buscos,
    maxBuscoScore,
    fcats,
    maxFcatScoreM1,
    maxFcatScoreM2,
    maxFcatScoreM3,
    maxFcatScoreM4,
    milts,
    repeatmaskers,
    username,
  } = assembly;

  const [renderActivation, setRenderActivation] = useState<boolean>(false);

  const buscoCheckmarkClass = () =>
    classNames("w-1/12 text-yellow-600", {
      "text-green-600": maxBuscoScore && maxBuscoScore > 75,
    });
  const fcatCheckmarkClass = () => {
    let value: number | undefined;
    switch (fcatMode) {
      case 1:
        value = maxFcatScoreM1;
        break;
      case 2:
        value = maxFcatScoreM2;
        break;
      case 3:
        value = maxFcatScoreM3;
        break;
      case 4:
        value = maxFcatScoreM4;
        break;
      default:
        value = 0;
        break;
    }
    return classNames("w-1/12 text-yellow-600 flex justify-center items-center", {
      "text-green-600": value && value > 75,
    });
  };

  useEffect(() => {
    if (renderDelay) {
      setTimeout(() => setRenderActivation(true), renderDelay * 200);
    }
  }, [renderDelay]);

  return (
    <div>
      {renderActivation && (
        <Link
          className="flex justify-center"
          to={"/g-nom/assemblies/assembly?assemblyID=" + id}
          key={id}
        >
          <div className="h-64 my-4 border border-gray-300 w-full animate-fade-in transition duration-500 ease-in-out bg-gradient-to-b from-gray-600 to-gray-400 transform hover:-translate-y-1 hover:scale-110 flex shadow">
            {taxonID && (
              <div className="w-32 h-32 min-w-max m-1 border border-gray-300 shadow">
                <SpeciesProfilePictureViewer taxonID={taxonID} imagePath={imagePath} />
              </div>
            )}
            <div className="px-3 py-2 mr-12">
              <div className="w-full">
                {label ? (
                  <div className="text-sm font-semibold text-white leading-tight hover:text-gray-300">
                    {label}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-white leading-tight hover:text-gray-300">
                    {name}
                  </div>
                )}
                {label && name && (
                  <div className="text-sm font-semibold text-white leading-tight hover:text-gray-300">
                    {name}
                  </div>
                )}

                {scientificName && (
                  <div className="text-white text-xs truncate w-full">{scientificName}</div>
                )}

                {/* PLOT CAROUSSEL */}
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default AssembliesGridElement;
