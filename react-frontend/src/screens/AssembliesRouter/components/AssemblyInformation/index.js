import { Bookmark, Checkmark } from "grommet-icons";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../../../../api";
import Button from "../../../../components/Button";
import LoadingSpinner from "../../../../components/LoadingSpinner";

import GeneralInformationCarousel from "./components/GeneralInformationTable";
import GenomeViewer from "./components/GenomeViewer";
import StaticAssemblyStatisticsViewer from "./components/StaticAssemblyStatisticsViewer";
import { useNotification } from "../../../../components/NotificationProvider";
import TaxonomicAssignmentViewer from "./components/TaxonomicAssignmentViewer";

const AssemblyInformation = () => {
  const [assemblyInformation, setAssemblyInformation] = useState({});
  const [fetchingAll, setFetchingAll] = useState(false);

  const [toggleGeneralInfoSection, setToggleGeneralInfoSection] = useState(
    true
  );

  const [toggleAssemblyStatistics, setToggleAssemblyStatistics] = useState(
    true
  );

  const [toggleGenomeViewerSection, setToggleGenomeViewerSection] = useState(
    false
  );

  const [toggleTaxonomicAssignment, setToggleTaxonomicAssignment] = useState(
    true
  );
  const [taxonomicAssignmentLoading, setTaxonomicAssignmentLoading] = useState(
    true
  );

  const [
    toggleAnnotationCompleteness,
    setToggleAnnotationCompleteness,
  ] = useState(true);

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

  const api = new API();

  const loadAssemblyInformation = async () => {
    setFetchingAll(true);
    const response = await api.fetchAssemblyInformationByAssemblyID(
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
      response = await api.addNewBookmark(userID, id.replace(":", ""));
    } else {
      response = await api.removeBookmark(userID, id.replace(":", ""));
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
            <div>
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
                  <Checkmark
                    className="stroke-current animate-grow-y"
                    color="blank"
                  />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {assemblyInformation && assemblyInformation.taxonGeneralInfos && (
        <div className="animate-grow-y">
          <div
            className="m-8 select-none"
            onClick={() =>
              setToggleGeneralInfoSection((prevState) => !prevState)
            }
          >
            <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
              General information
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

          {assemblyInformation.assemblyStatistics && (
            <div>
              <div
                className="m-8 select-none"
                onClick={() =>
                  setToggleAssemblyStatistics((prevState) => !prevState)
                }
              >
                <div className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-100">
                  Assembly statistics
                </div>
              </div>

              {toggleAssemblyStatistics && (
                <StaticAssemblyStatisticsViewer
                  statistics={assemblyInformation.assemblyStatistics}
                />
              )}
            </div>
          )}

          <hr className="shadow my-8 mx-8" />

          {assemblyInformation.analyses && assemblyInformation.analyses.milts && (
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
                  Taxonomic assignment
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
                  setTaxonomicAssignmentLoading={setTaxonomicAssignmentLoading}
                />
              )}
            </div>
          )}

          <hr className="shadow my-8 mx-8" />

          {assemblyInformation.analyses && assemblyInformation.analyses.milts && (
            <div className="animate-grow-y">
              <div
                className="m-8 select-none"
                onClick={() => {
                  setToggleAnnotationCompleteness((prevState) => !prevState);
                }}
              >
                <div className="flex justify-between items-center w-full text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-600 to-gray-400 rounded-lg text-white cursor-pointer hover:text-gray-300">
                  Annotation completeness
                </div>
              </div>
              {toggleAnnotationCompleteness && <div></div>}
            </div>
          )}

          <hr className="shadow my-8 mx-8" />

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
        </div>
      )}
    </div>
  );
};

export default AssemblyInformation;
