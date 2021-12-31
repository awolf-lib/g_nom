import { useEffect, useState } from "react";
import Button from "../../../../../../components/Button";
import { Download, Next, Previous } from "grommet-icons";
import { fetchFileByPath } from "../../../../../../api";

const TaxonomicAssignmentViewer = ({ milts, setTaxonomicAssignmentLoading }) => {
  const [index, setIndex] = useState(0);
  const [plot, setPlot] = useState();

  useEffect(() => {
    getPlot();
  }, [index]);

  const getPlot = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    await fetchFileByPath(milts[index].path, userID, token).then((response) => {
      if (response && response.url) {
        setPlot(response.url);
      }
    });
  };

  return (
    <div className="mx-8 animate-grow-y shadow-lg rounded-lg overflow-hidden border bg-white relative">
      <div className="animate-fade-in">
        {milts && milts[index] && (
          <iframe
            onLoad={() => setTaxonomicAssignmentLoading(false)}
            title="MiltsPlot"
            className="w-full h-screen"
            src={plot}
          />
        )}
      </div>
      <div className="absolute bottom-0 right-0 z-10 opacity-50 flex items-center mx-4 my-1">
        <a
          href={process.env.REACT_APP_FILE_SERVER_ADRESS}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center"
        >
          <Button color="link">
            <Download className="stroke-current" color="blank" />
          </Button>
        </a>
      </div>
      {milts.length > 1 && (
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
                if (prevState + 1 > milts.length - 1) {
                  return milts.length - 1;
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
