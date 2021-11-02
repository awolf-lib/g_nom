import { useState } from "react";
import Button from "../../../../../../components/Button";
import { Download, Next, Previous } from "grommet-icons";

const TaxonomicAssignmentViewer = ({
  assemblyInformation,
  setTaxonomicAssignmentLoading,
}) => {
  const [index, setIndex] = useState(0);
  return (
    <div className="mx-8 animate-grow-y shadow-lg rounded-lg overflow-hidden border bg-white relative">
      <div className="animate-fade-in">
        <iframe
          onLoad={() => setTaxonomicAssignmentLoading(false)}
          title="MiltsPlot"
          className="w-full h-screen"
          src={
            process.env.REACT_APP_API_ADRESS +
            "/fetchMiltsPlotByPath?path=" +
            assemblyInformation.analyses.milts[index].path
          }
        />
      </div>
      <div className="absolute bottom-0 right-0 z-10 opacity-50 flex items-center mx-4 my-1">
        <a
          href={process.env.REACT_APP_NEXTCLOUD_DOWNLOAD_ADRESS}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center"
        >
          <Button color="link">
            <Download className="stroke-current" color="blank" />
          </Button>
        </a>
      </div>
      {assemblyInformation.analyses.milts.length > 1 && (
        <div className="absolute bottom-0 left-0 opacity-50 flex items-center mx-4 my-1 z-10">
          <Button
            color="link"
            onClick={() =>
              setIndex((prevState) => {
                if (prevState - 1 < 0) {
                  return 0;
                } else {
                  return prevState - 1;
                }
              })
            }
          >
            <Previous className="stroke-current" color="blank" />
          </Button>
          <Button
            color="link"
            onClick={() =>
              setIndex((prevState) => {
                if (
                  prevState + 1 >
                  assemblyInformation.analyses.milts.length - 1
                ) {
                  return assemblyInformation.analyses.milts.length - 1;
                } else {
                  return prevState + 1;
                }
              })
            }
          >
            <Next className="stroke-current" color="blank" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaxonomicAssignmentViewer;

TaxonomicAssignmentViewer.defaultProps = {};

TaxonomicAssignmentViewer.propTypes = {};
