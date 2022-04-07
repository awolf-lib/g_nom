import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "../../../../../../components/Button";
import { Download, Next, Previous } from "grommet-icons";
import { fetchFileByPath, ITaxaminerAnalysis } from "../../../../../../api";

const TaxonomicAssignmentViewer = ({
  taxaminers,
  setTaxonomicAssignmentLoading,
}: {
  taxaminers: ITaxaminerAnalysis[];
  setTaxonomicAssignmentLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const [index, setIndex] = useState<number>(0);
  const [plot, setPlot] = useState<any>();

  useEffect(() => {
    getPlot();
    setTaxonomicAssignmentLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const getPlot = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    await fetchFileByPath(taxaminers[index].path, userID, token).then((response) => {
      if (response && response.url) {
        setPlot(response.url);
      }
    });
  };

  return (
    <div className="animate-grow-y overflow-hidden relative">
      <div className="animate-fade-in">
        {taxaminers && taxaminers[index] && (
          <iframe
            onLoad={() => setTaxonomicAssignmentLoading(false)}
            title="taXaminerPlot"
            className="w-full h-75"
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
      {taxaminers.length > 1 && (
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
                if (prevState + 1 > taxaminers.length - 1) {
                  return taxaminers.length - 1;
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
