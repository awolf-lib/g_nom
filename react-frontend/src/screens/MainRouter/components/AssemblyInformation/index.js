import { Book, Bookmark, Close } from "grommet-icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  addBookmark,
  addNewBookmark,
  fetchAnalysesByAssemblyID,
  fetchAssemblyByAssemblyID,
  fetchTaxonByTaxonID,
  fetchTaxonGeneralInformationByTaxonID,
  removeBookmark,
} from "../../../../api";
import Button from "../../../../components/Button";
import LoadingSpinner from "../../../../components/LoadingSpinner";

import GeneralInformationCarousel from "./components/GeneralInformationTable";
import GenomeViewer from "./components/GenomeViewer";
import StaticAssemblyStatisticsViewer from "./components/StaticAssemblyStatisticsViewer";
import { useNotification } from "../../../../components/NotificationProvider";
import TaxonomicAssignmentViewer from "./components/TaxonomicAssignmentViewer";
import AnnotationCompletenessViewer from "./components/AnnotationCompletenessViewer";
import MaskingsViewer from "./components/MaskingsViewer";

const AssemblyInformation = () => {
  const [assembly, setAssembly] = useState({});
  const [taxon, setTaxon] = useState({});
  const [generalInformation, setGeneralInformation] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const [fetchingAll, setFetchingAll] = useState(false);
  const [hoverBookmark, setHoverBookmark] = useState(false);

  const [toggleGeneralInfoSection, setToggleGeneralInfoSection] = useState(true);

  const [toggleAssemblyStatistics, setToggleAssemblyStatistics] = useState(true);

  const [toggleMaskings, setToggleMaskings] = useState(false);

  const [toggleTaxonomicAssignment, setToggleTaxonomicAssignment] = useState(false);
  const [taxonomicAssignmentLoading, setTaxonomicAssignmentLoading] = useState(false);

  const [toggleAnnotationCompleteness, setToggleAnnotationCompleteness] = useState(false);

  const [toggleGenomeViewerSection, setToggleGenomeViewerSection] = useState(false);

  const { id } = useParams();

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
  const token = JSON.parse(sessionStorage.getItem("token") || "{}");

  useEffect(() => {
    loadAssembly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchTaxonByTaxonID(assembly.taxonID, parseInt(userID), token).then((responseTaxa) => {
      if (responseTaxa && responseTaxa.payload) {
        setTaxon(responseTaxa.payload);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly.taxonID]);

  useEffect(() => {
    loadGeneralInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly.taxonID]);

  useEffect(() => {
    loadAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAssembly = async () => {
    setFetchingAll(true);
    if (userID && token && id) {
      const responseAssemblies = await fetchAssemblyByAssemblyID(
        id.replace(":", ""),
        userID,
        token
      );
      if (responseAssemblies && responseAssemblies.payload) {
        setAssembly(responseAssemblies.payload);
      }
    }
    setFetchingAll(false);
  };

  const loadGeneralInformation = async () => {
    setFetchingAll(true);
    if (userID && token) {
      const responseGeneralInformation = await fetchTaxonGeneralInformationByTaxonID(
        assembly.taxonID,
        parseInt(userID),
        token
      );
      if (responseGeneralInformation && responseGeneralInformation.payload) {
        setGeneralInformation(responseGeneralInformation.payload);
      }
    }
    setFetchingAll(false);
  };

  const loadAnalyses = async () => {
    setFetchingAll(true);
    if (userID && token && id) {
      const responseAnalyses = await fetchAnalysesByAssemblyID(
        parseInt(id.replace(":", "")),
        parseInt(userID),
        token
      );
      if (responseAnalyses && responseAnalyses.payload) {
        setAnalyses(responseAnalyses.payload);
      }
    }
    setFetchingAll(false);
  };

  const handleBookmarkAssembly = async () => {
    let response;
    if (!assembly.bookmarked) {
      response = await addBookmark(userID, id.replace(":", ""), token);
    } else {
      response = await removeBookmark(userID, id.replace(":", ""), token);
    }

    if (response && response.payload) {
      setAssembly((prevState) => {
        return { ...prevState, bookmarked: !prevState.bookmarked };
      });
    }

    if (response && response.notification && response.notification.length > 0) {
      response.notification.map((not) => handleNewNotification(not));
    }
  };

  return (
    <div className="pb-32 bg-indigo-50">
      <div className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center w-full">
            <div className="text-xl lg:text-3xl font-bold text-gray-900 mr-4">
              {fetchingAll ? (
                <LoadingSpinner label="Loading..." />
              ) : (
                <div>{taxon.scientificName + " (" + assembly.name + ")"}</div>
              )}
            </div>
            <div
              onMouseEnter={() => setHoverBookmark(true)}
              onMouseLeave={() => setHoverBookmark(false)}
            >
              <Button onClick={() => handleBookmarkAssembly()} color="secondary">
                {!assembly.bookmarked ? (
                  <Bookmark className="stroke-current animate-grow-y" color="blank" />
                ) : (
                  <div>
                    {!hoverBookmark ? (
                      <Book className="stroke-current animate-grow-y" color="blank" />
                    ) : (
                      <Close className="stroke-current animate-grow-y" color="blank" />
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {assembly && assembly.id && (
        <div>
          <div className="animate-grow-y">
            <div
              className="m-8 select-none"
              onClick={() => setToggleGeneralInfoSection((prevState) => !prevState)}
            >
              <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
                General Information
              </div>
            </div>

            {toggleGeneralInfoSection && taxon && taxon.ncbiTaxonID && (
              <GeneralInformationCarousel
                generalInfos={generalInformation}
                ncbiTaxonID={taxon.ncbiTaxonID}
                imageStatus={taxon.imageStatus}
              />
            )}
            <hr className="shadow my-8 mx-8" />
          </div>

          <div>
            <div>
              <div
                className="m-8 select-none"
                onClick={() => setToggleAssemblyStatistics((prevState) => !prevState)}
              >
                <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
                  Assembly Statistics
                </div>
              </div>

              {toggleAssemblyStatistics && <StaticAssemblyStatisticsViewer statistics={assembly} />}
            </div>
            <hr className="shadow my-8 mx-8" />
          </div>

          {assembly.analyses &&
            assembly.analyses.repeatmasker &&
            assembly.analyses.repeatmasker.length > 0 && (
              <div>
                <div>
                  <div
                    className="m-8 select-none"
                    onClick={() => setToggleMaskings((prevState) => !prevState)}
                  >
                    <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
                      Masking
                    </div>
                  </div>

                  {toggleMaskings && (
                    <MaskingsViewer
                      repeatmasker={assembly.analyses.repeatmasker}
                      assemblyName={assembly.name}
                    />
                  )}
                </div>
                <hr className="shadow my-8 mx-8" />
              </div>
            )}

          {assembly.analyses && assembly.analyses.milts && assembly.analyses.milts.length > 0 && (
            <div>
              <div className="animate-grow-y">
                <div
                  className="m-8 select-none"
                  onClick={() => {
                    setTaxonomicAssignmentLoading(toggleTaxonomicAssignment ? false : true);
                    setToggleTaxonomicAssignment((prevState) => !prevState);
                  }}
                >
                  <div className="flex justify-between items-center w-full text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-300">
                    Taxonomic Assignment
                    {taxonomicAssignmentLoading && (
                      <div className="text-xs">
                        <LoadingSpinner label="Loading..." />
                      </div>
                    )}
                  </div>
                </div>
                {toggleTaxonomicAssignment && (
                  <TaxonomicAssignmentViewer
                    assembly={assembly}
                    setTaxonomicAssignmentLoading={setTaxonomicAssignmentLoading}
                  />
                )}
              </div>
              <hr className="shadow my-8 mx-8" />
            </div>
          )}

          {assembly.analyses &&
            assembly.analyses.busco &&
            assembly.analyses.fcat &&
            (assembly.analyses.busco.length > 0 || assembly.analyses.fcat.length > 0) && (
              <div>
                <div className="animate-grow-y">
                  <div
                    className="m-8 select-none"
                    onClick={() => {
                      setToggleAnnotationCompleteness((prevState) => !prevState);
                    }}
                  >
                    <div className="flex justify-between items-center w-full text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-300">
                      Annotation Completeness
                    </div>
                  </div>
                  {toggleAnnotationCompleteness && (
                    <AnnotationCompletenessViewer
                      busco={assembly.analyses.busco}
                      fcat={assembly.analyses.fcat}
                      assemblyName={assembly.name}
                    />
                  )}
                </div>
                <hr className="shadow my-8 mx-8" />
              </div>
            )}

          <div>
            <div className="animate-grow-y">
              <div
                className="m-8 select-none"
                onClick={() => setToggleGenomeViewerSection((prevState) => !prevState)}
              >
                <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-700 to-gray-500 rounded-lg text-white cursor-pointer hover:text-gray-300">
                  Genome Viewer
                </div>
              </div>
              {toggleGenomeViewerSection && <GenomeViewer assembly={assembly} />}
            </div>
            <hr className="shadow my-8 mx-8" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyInformation;
