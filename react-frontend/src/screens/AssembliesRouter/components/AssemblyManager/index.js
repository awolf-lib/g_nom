import React, { useEffect, useState } from "react";
import API from "../../../../api";
import { useNotification } from "../../../../components/NotificationProvider";
import { Gallery, New, Add, Edit, Trash } from "grommet-icons";

import LoadingSpinner from "../../../../components/LoadingSpinner";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";

const AssemblyManager = () => {
  const [view1, setView1] = useState(true);
  const [taxonID, setTaxonID] = useState(0);
  const [changeTaxonIDTimeout, setChangeTaxonIDTimeout] = useState(undefined);
  const [taxa, setTaxa] = useState([]);
  const [selectedTaxon, setSelectedTaxon] = useState({});
  const [
    changeSelectedTaxonIDTimeout,
    setChangeSelectedTaxonIDTimeout,
  ] = useState(undefined);

  const [possibleImports, setPossibleImports] = useState([]);
  const [fetching, setFetching] = useState(false);

  const api = new API();

  useEffect(() => {
    //loadFiles();
  }, []);

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleTaxonIDChange = (input) => {
    setFetching(true);
    clearTimeout(changeTaxonIDTimeout);
    setTaxonID(input);
    setSelectedTaxon({});
    setTaxa([]);
    setChangeTaxonIDTimeout(
      setTimeout(() => loadTaxonInformation(input), 2000)
    );
    setFetching(false);
  };

  const loadTaxonInformation = async (taxonID) => {
    const response = await api.fetchTaxonByNCBITaxonID(taxonID);

    if (response && response.payload) {
      setTaxa(response.payload);
      if (response.payload.length === 1) {
        setSelectedTaxon(response.payload[0]);
        setView1(false);
      }
    }

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
    }
  };

  const handleChangeSelectedTaxon = (input) => {
    console.log(input);
    setFetching(true);
    clearTimeout(changeSelectedTaxonIDTimeout);
    setSelectedTaxon(input);
    setView1(false);
    setChangeSelectedTaxonIDTimeout(setTimeout(() => {}, 3000));
    setFetching(false);
  };

  const loadFiles = async () => {
    setFetching(true);
    const response = await api.fetchPossibleImports();
    if (response && response.payload) {
      setPossibleImports(response.payload);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setFetching(false);
  };

  return (
    <div className="mb-8 animate-grow-y">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              Assembly Manager
            </h1>
          </div>
        </div>
      </header>

      <div>
        <div className="mt-8 lg:mx-32 shadow rounded-lg p-4">
          <div
            for="taxonomyID"
            className="flex justify-between font-bold text-lg cursor-pointer select-none"
            onClick={() => setView1((prevState) => !prevState)}
          >
            <div className="hover:text-blue-600">
              1. Input NCBI taxonomy ID!
            </div>
            {selectedTaxon && selectedTaxon.scientificName && (
              <div className="animate-grow-y text-indigo-600">
                {selectedTaxon.ncbiTaxonID +
                  " (" +
                  selectedTaxon.scientificName +
                  ")"}
              </div>
            )}
          </div>
          {view1 && (
            <div className="animate-grow-y">
              <hr className="mt-4 mb-8 shadow" />
              <div className="py-4 flex justify-around items-center">
                <div className="w-64">
                  <Input
                    id="taxonomyID"
                    type="number"
                    placeholder="NCBI taxonomy ID..."
                    value={taxonID}
                    onChange={(e) => handleTaxonIDChange(e.target.value)}
                  />
                </div>
                <div className="w-1/3">
                  <span className="font-semibold">Choose taxon...</span>
                  <hr className="my-2 shadow" />
                  {taxa && taxa.length > 0 ? (
                    taxa.map((taxon) => {
                      return (
                        <div className="flex items-center justify-center ">
                          <Input
                            id={taxon.id}
                            value={taxon}
                            type="radio"
                            size="sm"
                            onChange={() => handleChangeSelectedTaxon(taxon)}
                            checked={selectedTaxon.id === taxon.id}
                          />
                          <label for={taxon.id} className="ml-4">
                            {taxon.scientificName}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <div>Empty...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        {selectedTaxon && selectedTaxon.id && (
          <div className="mt-16 lg:mx-32 animate-grow-y shadow p-4 rounded-lg">
            <label className="font-bold text-lg">
              2. What would you like to do?
            </label>
            <hr className="mt-4 mb-8 shadow" />
            <div className="flex justify-around">
              <div className="w-48 text-white mx-1 sm:mx-4">
                <Button label="Upload new image..." size="sm" color="secondary">
                  <Gallery color="blank" className="stroke-current" />
                </Button>
              </div>
              <div className="w-48 text-white mx-1 sm:mx-4">
                <Button
                  label="Create new assembly..."
                  size="sm"
                  color="secondary"
                >
                  <New color="blank" className="stroke-current" />
                </Button>
              </div>
              <div className="w-48 text-white mx-1 sm:mx-4">
                <Button
                  label="Add data to existing assembly..."
                  size="sm"
                  color="secondary"
                >
                  <Add color="blank" className="stroke-current" />
                </Button>
              </div>
              <div className="w-48 text-white mx-1 sm:mx-4">
                <Button label="Modify data..." size="sm" color="secondary">
                  <Edit color="blank" className="stroke-current" />
                </Button>
              </div>
              <div className="w-48 text-white mx-1 sm:mx-4">
                <Button label="Delete data..." size="sm" color="secondary">
                  <Trash color="blank" className="stroke-current" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {!fetching ? (
          <div>
            {possibleImports &&
              Object.keys(possibleImports).length > 0 &&
              Object.keys(possibleImports).map((filetype) => {
                return (
                  <div className="mb-8">
                    <div className="font-bold px-4 py-2">{filetype}</div>
                    <div className="border p-4">
                      {Object.keys(possibleImports[filetype]).length > 0 &&
                        Object.keys(possibleImports[filetype]).map(
                          (extension) => {
                            return (
                              <div className="border p-4">
                                {extension}
                                {possibleImports[filetype][extension].length >
                                  0 &&
                                  possibleImports[filetype][extension].map(
                                    (path) => {
                                      return (
                                        <div className="flex">
                                          {path &&
                                            path.length > 0 &&
                                            path.map((directory) => {
                                              return (
                                                <div className="flex">
                                                  <div className="hover:text-green-600">
                                                    {directory + "/"}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      );
                                    }
                                  )}
                              </div>
                            );
                          }
                        )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div>
            <LoadingSpinner label="Fetching possible imports..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssemblyManager;
