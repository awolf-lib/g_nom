import { Search } from "grommet-icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IGenomicAnnotationFeature } from "../../../../../../api";

const FeaturesListElement = ({
  feature,
  noAssemblyDetails = 0,
  showAllAttributes = false,
}: {
  feature: IGenomicAnnotationFeature;
  noAssemblyDetails?: number;
  showAllAttributes?: boolean;
}) => {
  const [showAttributes, setShowAttributes] = useState<boolean>(false);

  useEffect(() => {
    setShowAttributes(showAllAttributes);
  }, [showAllAttributes]);

  const { assemblyID, seqID, type, start, end, attributes, scientificName, name, label } = feature;
  return (
    <div
      onClick={() => setShowAttributes((prevState) => !prevState)}
      className="cursor-pointer text-center hover:bg-blue-100 hover:text-blue-600 py-1 px-4 flex shadow border transition duration-300 animate-grow-y"
    >
      <div className="flex items-center w-full py-2 text-sm">
        {!noAssemblyDetails && <div className="w-2/12 truncate">{scientificName}</div>}
        {!noAssemblyDetails && <div className="w-2/12 truncate">{label || name}</div>}
        <div className="w-3/12 truncate">{seqID}</div>
        <div className="w-2/12 truncate">{type}</div>
        <div className="w-1/12 truncate">{start}</div>
        <div className="w-1/12 truncate">{end}</div>
        <div
          className={noAssemblyDetails ? "w-1/2 truncate text-left" : "w-2/3 truncate text-left"}
        >
          {Object.keys(attributes) && Object.keys(attributes).length > 0 ? (
            <div>
              {showAllAttributes || showAttributes ? (
                <div>
                  {Object.keys(attributes).map((attr, index) => (
                    <div
                      key={attr}
                      className="w-full flex items-center justify-between border-b animate-grow-y"
                    >
                      <div className="px-2">{attr + ":"}</div>
                      <div className="px-2 truncate">{attributes[attr]}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="w-full flex items-center justify-between border-b">
                    <div className="px-2">{Object.keys(attributes)[0] + ":"}</div>
                    <div className="px-2 truncate">{attributes[Object.keys(attributes)[0]]}</div>
                  </div>
                  {Object.keys(attributes).length > 1 && <div className="text-center">{"..."}</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-center p-2">No attributes!</div>
          )}
        </div>
        <div className="w-40 flex justify-around">
          <Link
            to={
              "/g-nom/assemblies/assembly?assemblyID=" +
              assemblyID +
              "&location=" +
              seqID +
              ":" +
              start +
              ".." +
              end
            }
            onClick={(e) => e.stopPropagation()}
            // target="_blank"
            // rel="noopener noreferrer"
            className="max-w-min text-white flex animate-fade-in-fast bg-blue-600 p-2 rounded-lg hover:bg-blue-500"
          >
            <Search size="small" className="stroke-current" color="blank" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturesListElement;
