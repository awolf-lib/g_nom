import { Book, Bookmark, Close } from "grommet-icons";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {addNewBookmark, fetchAssemblyInformationByAssemblyID, removeBookmark} from "../../../../api";
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
  const [assemblyInformation, setAssemblyInformation] = useState({});
  const [fetchingAll, setFetchingAll] = useState(false);
  const [hoverBookmark, setHoverBookmark] = useState(false);

  const [toggleGeneralInfoSection, setToggleGeneralInfoSection] = useState(
    true
  );

  const [toggleAssemblyStatistics, setToggleAssemblyStatistics] = useState(
    true
  );

  const [toggleMaskings, setToggleMaskings] = useState(false);

  const [toggleTaxonomicAssignment, setToggleTaxonomicAssignment] = useState(
    false
  );
  const [taxonomicAssignmentLoading, setTaxonomicAssignmentLoading] = useState(
    false
  );

  const [
    toggleAnnotationCompleteness,
    setToggleAnnotationCompleteness,
  ] = useState(false);

  const [toggleGenomeViewerSection, setToggleGenomeViewerSection] = useState(
    false
  );

  const { id } = useParams();
  const userID = sessionStorage.getItem("userID");

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    loadAssemblyInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAssemblyInformation = async () => {
    setFetchingAll(true);
    const response = await fetchAssemblyInformationByAssemblyID(
      id.replace(":", ""),
      userID
    );
    if (response && response.payload) {
      setAssemblyInformation(response.payload);
    }
    setFetchingAll(false);
  };

  const handleBookmarkAssembly = async () => {
    let response;
    if (!assemblyInformation.bookmarked) {
      response = await addNewBookmark(userID, id.replace(":", ""));
    } else {
      response = await removeBookmark(userID, id.replace(":", ""));
    }

    if (response && response.payload) {
      setAssemblyInformation((prevState) => {
        return { ...prevState, bookmarked: !prevState.bookmarked };
      });
    }

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
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
                assemblyInformation.scientificName
              )}
            </div>
            <div
              onMouseEnter={() => setHoverBookmark(true)}
              onMouseLeave={() => setHoverBookmark(false)}
            >
              <Button
                onClick={() => handleBookmarkAssembly()}
                color="secondary"
              >
                {!assemblyInformation.bookmarked ? (
                  <Bookmark
                    className="stroke-current animate-grow-y"
                    color="blank"
                  />
                ) : (
                  <div>
                    {!hoverBookmark ? (
                      <Book
                        className="stroke-current animate-grow-y"
                        color="blank"
                      />
                    ) : (
                      <Close
                        className="stroke-current animate-grow-y"
                        color="blank"
                      />
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {assemblyInformation && assemblyInformation.taxonGeneralInfos && (
        <div>
          <div className="animate-grow-y">
            <div
              className="m-8 select-none"
              onClick={() =>
                setToggleGeneralInfoSection((prevState) => !prevState)
              }
            >
              <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
                General Information
              </div>
            </div>

            {toggleGeneralInfoSection && (
              <GeneralInformationCarousel
                generalInfos={assemblyInformation.taxonGeneralInfos}
                ncbiTaxonID={assemblyInformation.ncbiTaxonID}
                imageStatus={assemblyInformation.imageStatus}
              />
            )}
            <hr className="shadow my-8 mx-8" />
          </div>

          {assemblyInformation.assemblyStatistics && (
            <div>
              <div>
                <div
                  className="m-8 select-none"
                  onClick={() =>
                    setToggleAssemblyStatistics((prevState) => !prevState)
                  }
                >
                  <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
                    Assembly Statistics
                  </div>
                </div>

                {toggleAssemblyStatistics && (
                  <StaticAssemblyStatisticsViewer
                    statistics={assemblyInformation.assemblyStatistics}
                  />
                )}
              </div>
              <hr className="shadow my-8 mx-8" />
            </div>
          )}

          {assemblyInformation.analyses &&
            assemblyInformation.analyses.repeatmasker &&
            assemblyInformation.analyses.repeatmasker.length > 0 && (
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
                      repeatmasker={assemblyInformation.analyses.repeatmasker}
                      assemblyName={assemblyInformation.name}
                    />
                  )}
                </div>
                <hr className="shadow my-8 mx-8" />
              </div>
            )}

          {assemblyInformation.analyses &&
            assemblyInformation.analyses.milts &&
            assemblyInformation.analyses.milts.length > 0 && (
              <div>
                <div className="animate-grow-y">
                  <div
                    className="m-8 select-none"
                    onClick={() => {
                      setTaxonomicAssignmentLoading(
                        toggleTaxonomicAssignment ? false : true
                      );
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
                      assemblyInformation={assemblyInformation}
                      setTaxonomicAssignmentLoading={
                        setTaxonomicAssignmentLoading
                      }
                    />
                  )}
                </div>
                <hr className="shadow my-8 mx-8" />
              </div>
            )}

          {assemblyInformation.analyses &&
            assemblyInformation.analyses.busco &&
            assemblyInformation.analyses.fcat &&
            (assemblyInformation.analyses.busco.length > 0 ||
              assemblyInformation.analyses.fcat.length > 0) && (
              <div>
                <div className="animate-grow-y">
                  <div
                    className="m-8 select-none"
                    onClick={() => {
                      setToggleAnnotationCompleteness(
                        (prevState) => !prevState
                      );
                    }}
                  >
                    <div className="flex justify-between items-center w-full text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-300">
                      Annotation Completeness
                    </div>
                  </div>
                  {toggleAnnotationCompleteness && (
                    <AnnotationCompletenessViewer
                      busco={assemblyInformation.analyses.busco}
                      fcat={assemblyInformation.analyses.fcat}
                      assemblyName={assemblyInformation.name}
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
                onClick={() =>
                  setToggleGenomeViewerSection((prevState) => !prevState)
                }
              >
                <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-700 to-gray-500 rounded-lg text-white cursor-pointer hover:text-gray-300">
                  Genome Viewer
                </div>
              </div>
              {toggleGenomeViewerSection && (
                <GenomeViewer assemblyInformation={assemblyInformation} />
              )}
            </div>
            <hr className="shadow my-8 mx-8" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyInformation;
