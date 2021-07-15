import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../../../../api";
import LoadingSpinner from "../../../../components/LoadingSpinner";

import GeneralInformationCarousel from "./components/GeneralInformationTable";

const AssemblyInformation = () => {
  const [assemblyInformation, setAssemblyInformation] = useState({});
  const [fetchingAll, setFetchingAll] = useState(false);

  const [toggleGeneralInfoSection, setToggleGeneralInfoSection] = useState(
    true
  );

  const [toggleGenomeViewerSection, setToggleGenomeViewerSection] = useState(
    false
  );

  const { id } = useParams();

  useEffect(() => {
    loadAssemblyInformation();
  }, []);

  const api = new API();

  const loadAssemblyInformation = async () => {
    setFetchingAll(true);
    const response = await api.fetchAssemblyInformationByAssemblyID(
      id.replace(":", "")
    );
    if (response && response.payload) {
      setAssemblyInformation(response.payload);
    }
    setFetchingAll(false);
  };

  const [showNav, setshowNav] = useState(false);
  const [showTracklist, setShowTracklist] = useState(true);

  const configureSource = () => {
    return (
      "http://localhost:8082/index.html?data=data%2F" +
      assemblyInformation.name +
      "&nav=" +
      showNav +
      "&tracklist=" +
      showTracklist
    );
  };

  return (
    <div className="mb-32">
      <div className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mr-4">
              {fetchingAll ? (
                <LoadingSpinner label="Loading..." />
              ) : (
                assemblyInformation.scientificName
              )}
            </h1>
          </div>
        </div>
      </div>

      {assemblyInformation && assemblyInformation.id && (
        <div className="animate-grow-y">
          <div
            className="m-8 select-none"
            onClick={() =>
              setToggleGeneralInfoSection((prevState) => !prevState)
            }
          >
            <h1 className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-700 to-gray-500 rounded-lg text-white cursor-pointer hover:text-gray-300">
              General information
            </h1>
          </div>

          {toggleGeneralInfoSection &&
            assemblyInformation.taxonGeneralInfos && (
              <GeneralInformationCarousel
                generalInfos={assemblyInformation.taxonGeneralInfos}
                ncbiTaxonID={assemblyInformation.ncbiTaxonID}
                imageStatus={assemblyInformation.imageStatus}
              />
            )}

          <hr className="shadow my-16 mx-8" />

          <div className="animate-grow-y">
            <div
              className="m-8 select-none"
              onClick={() =>
                setToggleGenomeViewerSection((prevState) => !prevState)
              }
            >
              <h1 className="text-xl px-4 py-2 font-semibold shadow bg-gradient-to-b from-gray-700 to-gray-500 rounded-lg text-white cursor-pointer hover:text-gray-300">
                Genome Viewer
              </h1>
            </div>
            {toggleGenomeViewerSection && (
              <div className="rounded-lg overflow-hidden p-2 bg-indigo-200 mx-8 animate-grow-y">
                <iframe
                  title="jbrowse"
                  className="w-full h-75"
                  src={configureSource()}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyInformation;
