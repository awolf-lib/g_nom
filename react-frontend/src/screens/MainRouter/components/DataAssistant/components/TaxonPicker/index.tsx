import { SetStateAction, useEffect, useState } from "react";
import {
  fetchTaxonByNCBITaxonID,
  fetchTaxonBySearch,
  fetchTaxonByTaxonID,
  INcbiTaxon,
  NotificationObject,
} from "../../../../../../api";
import Input from "../../../../../../components/Input";
import { useNotification } from "../../../../../../components/NotificationProvider";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { useSearchParams } from "react-router-dom";

const TaxonPicker = ({
  getTaxon,
  parentTaxon,
}: {
  getTaxon: SetStateAction<any>;
  parentTaxon: INcbiTaxon | undefined;
}) => {
  const [requestTimeoutTaxonID, setRequestTimeoutTaxonID] = useState<any>();
  const [taxa, setTaxa] = useState<any>([]);
  const [taxon, setTaxon] = useState<INcbiTaxon | undefined>();

  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    if (parentTaxon?.imagePath !== taxon?.imagePath) setTaxon(parentTaxon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentTaxon?.imagePath]);

  useEffect(() => {
    if (taxon?.id) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("taxID", JSON.stringify(taxon.id));
      if (taxon?.ncbiTaxonID) {
        newSearchParams.set("ncbiTaxID", JSON.stringify(taxon.ncbiTaxonID));
      }
      setSearchParams(newSearchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxon?.id]);

  useEffect(() => {
    const taxIdString = searchParams.get("taxID");
    const taxID = Number(taxIdString);
    const ncbiTaxIdString = searchParams.get("ncbiTaxID");
    const ncbiTaxID = Number(ncbiTaxIdString);
    if (taxID) {
      fetchTaxonByID(taxID);
    } else if (ncbiTaxID) {
      fetchTaxaByNcbiID(ncbiTaxID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchTaxonByID = (taxonID: number) => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    fetchTaxonByTaxonID(taxonID, userID, token).then((response) => {
      if (response && response.payload) {
        setTaxon(response.payload);
        getTaxon(response.payload);
      }

      if (response?.notification) {
        response?.notification.forEach((n) => {
          handleNewNotification(n);
        });
      }
    });
  };

  const fetchTaxaByNcbiID = (ncbiID: number) => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      fetchTaxonByNCBITaxonID(userID, token, ncbiID).then((response) => {
        if (response.payload.length <= 1000) {
          if (response.payload) {
            setTaxa(response.payload);

            if (response.payload.length >= 1) {
              setTaxon(response.payload[0]);
              getTaxon(response.payload[0]);
            }
          }
        } else {
          handleNewNotification({
            label: "Error",
            message: "Too many results. Specify name!",
            type: "error",
          });
        }

        if (response.notification && response.notification.length) {
          response.notification.map((not: any) => handleNewNotification(not));
        }
      });
    } else {
      handleNewNotification({
        label: "Error",
        message: "UserID and/or userToken deleted from storage. Relog necessary!",
        type: "error",
      });
    }
  };

  const fetchTaxaByIDTimeout = (id: number | undefined) => {
    clearTimeout(requestTimeoutTaxonID);
    setTaxa([]);
    getTaxon(undefined);
    if (id) {
      setRequestTimeoutTaxonID(
        setTimeout(() => {
          fetchTaxaByNcbiID(id);
        }, 3000)
      );
    }
  };

  const fetchTaxaBySearch = (search: string | undefined) => {
    clearTimeout(requestTimeoutTaxonID);
    setTaxa([]);
    getTaxon(undefined);
    if (search) {
      setRequestTimeoutTaxonID(
        setTimeout(() => {
          const userID = JSON.parse(sessionStorage.getItem("userID") || "");
          const token = JSON.parse(sessionStorage.getItem("token") || "");

          if (userID && token) {
            fetchTaxonBySearch(search, parseInt(userID), token).then((response) => {
              if (response.payload.length <= 1000) {
                if (response && response.payload) {
                  setTaxa(response.payload);

                  if (response.payload.length === 1) {
                    setTaxon(response.payload[0]);
                    getTaxon(response.payload[0]);
                  }
                }
              } else {
                handleNewNotification({
                  label: "Error",
                  message: "Too many results. Specify name!",
                  type: "error",
                });
              }

              if (response.notification && response.notification.length) {
                response.notification.map((not: any) => handleNewNotification(not));
              }
            });
          } else {
            handleNewNotification({
              label: "Error",
              message: "UserID and/or userToken deleted from storage. Relog necessary!",
              type: "error",
            });
          }
        }, 3000)
      );
    }
  };

  const handleChangeTaxon = (taxonID: number) => {
    const targetTaxon = taxa.find((obj: INcbiTaxon) => obj.id === taxonID);
    setTaxon(targetTaxon);
    getTaxon(targetTaxon);
  };

  return (
    <div className="text-gray-700">
      <div className="xl:flex justify-center animate-grow-y">
        {taxon && taxon.id && (
          <div className="flex justify-around items-center w-full border p-2 xl:rounded-xl shadow bg-gray-100">
            <div>
              <div className="rounded-lg overflow-hidden border-2 border-dotted border-white">
                <SpeciesProfilePictureViewer taxonID={taxon.id} imagePath={taxon.imagePath} />
              </div>
            </div>
            <div className="w-full flex">
              <div className="w-full">
                <div className="flex items-center py-1 mx-4 animate-fade-in">
                  <div className="text-xs w-32 font-semibold hidden xl:block mx-2">
                    Scientific name:
                  </div>
                  <div className="w-full">
                    <div className="truncate font-semibold">{taxon.scientificName}</div>
                  </div>
                </div>
                {taxon.commonName && (
                  <div className="flex items-center py-1 mx-4 animate-fade-in">
                    <div className="text-xs w-32 font-semibold hidden xl:block mx-2">
                      Common name:
                    </div>
                    <div className="w-full">
                      <div className="truncate">{taxon.commonName}</div>
                    </div>
                  </div>
                )}
                {taxon.taxonRank && (
                  <div className="flex items-center py-1 mx-4 animate-fade-in">
                    <div className="text-xs w-32 font-semibold hidden xl:block mx-2">Rank:</div>
                    <div className="w-full">
                      <div className="truncate">{taxon.taxonRank}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {taxon && taxon.id && (
          <div className="w-px bg-gray-200 animate-fade-in mx-4 hidden xl:block" />
        )}

        <div className="bg-gray-200 flex justify-around w-full my-2 text-sm xl:my-0 items-center border py-6 xl:rounded-lg shadow">
          <div className="flex">
            <label className="w-2/5 px-4">
              <div className="w-full flex justify-between items-center">
                <div className="w-full text-center font-semibold truncate">NCBI ID</div>
              </div>
              <hr className="shadow my-2" />
              <div className="shadow rounded-lg">
                <Input
                  type="number"
                  onChange={(e) => fetchTaxaByIDTimeout(e.target.value)}
                  placeholder={taxon && taxon.ncbiTaxonID ? taxon.ncbiTaxonID + "" : "NCBI ID"}
                />
              </div>
            </label>
            <div>or</div>
            <label className="w-full px-4">
              <div className="w-full flex justify-between items-center">
                <div className="w-full text-center font-semibold truncate">Search by name</div>
              </div>
              <hr className="shadow my-2" />
              <div className="shadow rounded-lg">
                <Input
                  onChange={(e) => fetchTaxaBySearch(e.target.value)}
                  placeholder={taxon && taxon.scientificName ? taxon.scientificName + "" : "Name"}
                />
              </div>
            </label>
          </div>
        </div>

        {taxa && taxa.length > 1 && (
          <div className="w-px bg-gray-200 animate-fade-in mx-4 hidden xl:block" />
        )}

        {taxa && taxa.length > 1 && (
          <div className="bg-gray-200 flex justify-around w-full xl:w-1/2 my-2 text-sm xl:my-0 items-center border py-6 xl:rounded-lg shadow">
            <label className="w-full px-4 animate-fade-in">
              <div className="text-center font-semibold truncate">Multiple entries detected:</div>
              <hr className="shadow my-2" />
              <div className="w-full px-4">
                <select
                  className="text-sm text-center mt-1 shadow h-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 ring-offset-1 transition duration-300"
                  onChange={(e) => handleChangeTaxon(parseInt(e.target.value))}
                >
                  {taxa.map((tx: INcbiTaxon) => (
                    <option value={tx.id} key={tx.id}>
                      {tx.scientificName} {tx.commonName && " (" + tx.commonName + ")"}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxonPicker;
