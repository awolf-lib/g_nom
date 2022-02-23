import { Link } from "react-router-dom";
import classNames from "classnames";

import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import { Checkmark, Close } from "grommet-icons";
import { useRef } from "react";

const AssembliesListElement = ({
  assembly,
  fcatMode,
}: {
  assembly: AssemblyInterface;
  fcatMode: number;
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
    addedOn,
  } = assembly;

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

  const formatDate = (date: Date) => {
    date = new Date(date);
    return date.toLocaleDateString();
  };

  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);

  return (
    <Link
      to={"/g-nom/assemblies/assembly?assemblyID=" + id}
      className="text-center hover:bg-blue-100 hover:text-blue-600 py-1 px-4 flex shadow border transition duration-300 animate-grow-y"
    >
      <div className="flex items-center text-center w-full">
        <div className="flex items-center mr-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden shadow border ring-1 ring-gray-300 ring-offset-1">
            <SpeciesProfilePictureViewer
              taxonID={taxonID}
              imagePath={imagePath}
              useTimestamp={false}
            />
          </div>
        </div>
        <div
          ref={ref1}
          className="px-2 py-2 w-2/12 truncate hover:whitespace-normal hover:text-clip hover:overflow-auto"
          onMouseLeave={() => ref1.current?.scrollTo(0, 0)}
        >
          {scientificName}
        </div>
        <div
          ref={ref2}
          className="px-2 py-2 w-3/12 truncate hover:whitespace-normal hover:text-clip hover:overflow-auto"
          onMouseLeave={() => ref2.current?.scrollTo(0, 0)}
        >
          {label || name}
        </div>
        {annotations && annotations > 0 ? (
          <div className="w-1/12 text-green-600">
            <Checkmark className="stroke-current" color="blank" />
          </div>
        ) : (
          <div className="w-1/12 text-red-600">
            <Close className="stroke-current" color="blank" />
          </div>
        )}
        {buscos && buscos > 0 ? (
          <div className={buscoCheckmarkClass()}>
            <Checkmark className="stroke-current" color="blank" />
          </div>
        ) : (
          <div className="w-1/12 text-red-600">
            <Close className="stroke-current" color="blank" />
          </div>
        )}
        {fcats && fcats > 0 ? (
          <div className={fcatCheckmarkClass()}>
            <Checkmark className="stroke-current" color="blank" />
          </div>
        ) : (
          <div className="w-1/12 text-red-600">
            <Close className="stroke-current" color="blank" />
          </div>
        )}
        {milts && milts > 0 ? (
          <div className="w-1/12 text-green-600">
            <Checkmark className="stroke-current" color="blank" />
          </div>
        ) : (
          <div className="w-1/12 text-red-600">
            <Close className="stroke-current" color="blank" />
          </div>
        )}
        {repeatmaskers && repeatmaskers > 0 ? (
          <div className="w-1/12 text-green-600">
            <Checkmark className="stroke-current" color="blank" />
          </div>
        ) : (
          <div className="w-1/12 text-red-600">
            <Close className="stroke-current" color="blank" />
          </div>
        )}
        <div
          ref={ref3}
          className="px-2 py-2 w-1/12 truncate hover:whitespace-normal hover:text-clip hover:overflow-auto"
          onMouseLeave={() => ref3.current?.scrollTo(0, 0)}
        >
          {username || "deleted"}
        </div>
        <div
          ref={ref4}
          className="px-2 py-2 w-1/12 truncate hover:whitespace-normal hover:text-clip hover:overflow-auto"
          onMouseLeave={() => ref4.current?.scrollTo(0, 0)}
        >
          {formatDate(addedOn)}
        </div>
      </div>
    </Link>
  );
};

export default AssembliesListElement;
