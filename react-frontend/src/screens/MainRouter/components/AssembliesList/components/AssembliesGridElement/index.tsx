import { Link } from "react-router-dom";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import { useEffect, useState } from "react";
import classNames from "classnames";

const AssembliesGridElement = ({
  assembly,
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
    username,
    annotations,
    buscos,
    fcats,
    taxaminers,
    repeatmaskers,
    maxBuscoScore,
    maxFcatScoreM1,
    maxFcatScoreM2,
    maxFcatScoreM3,
    maxFcatScoreM4,
  } = assembly;

  const [renderActivation, setRenderActivation] = useState<boolean>(false);
  const [fcatMode, setFcatMode] = useState<number>(0);

  useEffect(() => {
    if (renderDelay) {
      setTimeout(() => setRenderActivation(true), renderDelay * 200);
    }
  }, [renderDelay]);

  useEffect(() => {
    if (renderActivation) {
      const interval = setInterval(() => {
        setFcatMode((prevState) => (prevState + 1 <= 3 ? prevState + 1 : 0));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [renderActivation]);

  const analysesClass = (type: "A" | "B" | "F" | "T" | "R") => {
    const fcatModes: number[] = [
      maxFcatScoreM1 || 0,
      maxFcatScoreM2 || 0,
      maxFcatScoreM3 || 0,
      maxFcatScoreM4 || 0,
    ];
    return classNames(
      "flex items-center font-bold text-white rounded-lg mx-6 shadow border w-12 my-2",
      {
        "bg-gradient-to-t from-yellow-800 via-yellow-600 to-yellow-600 border-yellow-500":
          (type === "B" && buscos && buscos > 0 && maxBuscoScore && maxBuscoScore < 75) ||
          (type === "F" && fcats && fcats > 0 && fcatModes[fcatMode] < 75),
        "bg-gradient-to-t from-green-800 via-green-700 to-green-700 border-green-600":
          (type === "A" && annotations && annotations > 0) ||
          (type === "B" && buscos && buscos > 0 && maxBuscoScore && maxBuscoScore >= 75) ||
          (type === "F" && fcats && fcats > 0 && fcatModes[fcatMode] >= 75) ||
          (type === "T" && taxaminers && taxaminers > 0) ||
          (type === "R" && repeatmaskers && repeatmaskers > 0),
        "bg-gradient-to-t from-red-900 via-red-700 to-red-700 border-red-500":
          (type === "A" && !annotations) ||
          (type === "B" && !buscos) ||
          (type === "F" && !fcats) ||
          (type === "T" && !taxaminers) ||
          (type === "R" && !repeatmaskers),
      }
    );
  };

  const formatDate = (addedOn: Date) => {
    const date = new Date(addedOn);
    return date.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" });
  };

  return (
    <div>
      {renderActivation && (
        <Link
          className="flex justify-center shadow"
          to={"/g-nom/assemblies/assembly?assemblyID=" + id}
          key={id}
        >
          <div className="h-48 border border-gray-300 w-full animate-fade-in transition duration-500 ease-in-out bg-gradient-to-tr from-gray-800 via-gray-700 to-gray-500 transform hover:-translate-y-1 hover:scale-105 flex">
            {taxonID && (
              <div className="p-1 h-48 w-48">
                <SpeciesProfilePictureViewer
                  taxonID={taxonID}
                  imagePath={imagePath}
                  useTimestamp={false}
                />
              </div>
            )}
            <div className="w-full text-white px-4 py-2 truncate">
              <div className="text-xl font-semibold h-8 truncate">{label || name}</div>
              <div className="text-sm h-6 truncate">{scientificName}</div>
              <div className="h-16 w-full flex items-center"></div>
              <div className="h-16 f-full flex justify-between items-center">
                <div>
                  <div className="text-sm items-center">{"added on " + formatDate(addedOn)}</div>
                  <div className="text-sm items-center">{"by " + username}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-500 border border-gray-400 shadow py-1 h-full">
              <div className={analysesClass("A")}>
                <div className="text-center w-full">A</div>
              </div>
              <div className={analysesClass("B")}>
                <div className="text-center w-full">B</div>
              </div>
              <div className={analysesClass("F")}>
                <div className="text-center w-full">
                  F<span className="text-xs">{fcatMode + 1}</span>
                </div>
              </div>
              <div className={analysesClass("T")}>
                <div className="text-center w-full">M</div>
              </div>
              <div className={analysesClass("R")}>
                <div className="text-center w-full">R</div>
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default AssembliesGridElement;
