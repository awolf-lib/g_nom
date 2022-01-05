import { Link } from "react-router-dom";
import { IGenomicAnnotationFeature } from "../../../../../../api";

const FeaturesListElement = ({
  feature,
  noAssemblyDetails = 0,
}: {
  feature: IGenomicAnnotationFeature;
  noAssemblyDetails?: number;
}) => {
  const {
    assemblyID,
    annotationID,
    seqID,
    type,
    start,
    end,
    attributes,
    scientificName,
    name,
    label,
  } = feature;
  return (
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
      className="text-center hover:bg-blue-100 hover:text-blue-600 py-1 px-4 flex shadow border transition duration-300 animate-grow-y"
    >
      <div className="flex items-center w-full py-2 text-sm">
        <div className="w-2/12 truncate">{seqID}</div>
        <div className="w-1/12 truncate">{type}</div>
        <div className="w-1/12 truncate">{start}</div>
        <div className="w-1/12 truncate">{end}</div>
        <div
          className={noAssemblyDetails ? "w-full truncate text-left" : "w-3/12 truncate text-left"}
        >
          {JSON.stringify(attributes)}
        </div>
        {!noAssemblyDetails && <div className="w-2/12 truncate">{scientificName}</div>}
        {!noAssemblyDetails && <div className="w-2/12 truncate">{label || name}</div>}
      </div>
    </Link>
  );
};

export default FeaturesListElement;
