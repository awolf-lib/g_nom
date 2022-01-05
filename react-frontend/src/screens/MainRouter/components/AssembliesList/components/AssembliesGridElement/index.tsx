import { Link } from "react-router-dom";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import { useEffect, useState } from "react";
import { CaretNext, Radial, RadialSelected } from "grommet-icons";

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
    addedOn,
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

  useEffect(() => {
    if (renderDelay) {
      setTimeout(() => setRenderActivation(true), renderDelay * 200);
    }
  }, [renderDelay]);

  return (
    <div>
      {renderActivation && (
        <Link
          className="flex justify-center shadow"
          to={"/g-nom/assemblies/assembly?assemblyID=" + id}
          key={id}
        >
          <div className="h-48 border border-gray-300 w-full animate-fade-in transition duration-500 ease-in-out bg-gradient-to-tr from-gray-800 via-gray-700 to-gray-500 transform hover:-translate-y-1 hover:scale-110 flex">
            {taxonID && (
              <div className="min-w-max m-1 border border-double border-gray-300">
                <SpeciesProfilePictureViewer taxonID={taxonID} imagePath={imagePath} />
              </div>
            )}
            <div className="w-full text-white px-4 py-2">
              <div className="text-xl font-semibold h-8 truncate">{label || name}</div>
              <div className="text-sm h-6 truncate">{scientificName}</div>
              <div className="h-24 w-full flex items-center"></div>
              <div className="h-8 f-full flex justify-between items-center">
                <div className="text-sm">{username}</div>
                <div className="text-sm">{addedOn}</div>
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default AssembliesGridElement;
