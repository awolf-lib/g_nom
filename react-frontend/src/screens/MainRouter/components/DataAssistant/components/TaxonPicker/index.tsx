import { SetStateAction, useState } from "react";
import { fetchTaxonByNCBITaxonID, fetchTaxonBySearch, INcbiTaxon } from "../../../../../../api";
import Input from "../../../../../../components/Input";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../components/NotificationProvider";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";

const TaxonPicker = ({ getTaxon }: { getTaxon: SetStateAction<any> }) => {
  const [requestTimeoutTaxonID, setRequestTimeoutTaxonID] = useState<any>();
  const [taxa, setTaxa] = useState<any>([]);
  const [taxon, setTaxon] = useState<INcbiTaxon | undefined>();
  const [loadingTaxa, setLoadingTaxa] = useState<boolean>(false);

  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const fetchTaxaByID = (id: number | undefined) => {
    clearTimeout(requestTimeoutTaxonID);
    setTaxa([]);
    getTaxon(undefined);
    if (id) {
      setRequestTimeoutTaxonID(
        setTimeout(() => {
          setLoadingTaxa(true);
          const userID = JSON.parse(sessionStorage.getItem("userID") || "");
          const token = JSON.parse(sessionStorage.getItem("token") || "");

          if (userID && token) {
            fetchTaxonByNCBITaxonID(parseInt(userID), token, id).then((response) => {
              if (response.payload.length <= 1000) {
                if (response.payload) {
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
          setLoadingTaxa(false);
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
          setLoadingTaxa(true);
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
          setLoadingTaxa(false);
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
              <div className="w-32 rounded-lg overflow-hidden border-2 border-dotted border-white">
                <SpeciesProfilePictureViewer taxonID={taxon.id} imageStatus={taxon.imageStatus} />
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
                {loadingTaxa && <LoadingSpinner label="Loading..." />}
              </div>
              <hr className="shadow my-2" />
              <div className="shadow rounded-lg">
                <Input
                  type="number"
                  onChange={(e) => fetchTaxaByID(e.target.value)}
                  placeholder={taxon && taxon.ncbiTaxonID ? taxon.ncbiTaxonID + "" : "NCBI ID"}
                />
              </div>
            </label>
            <div>or</div>
            <label className="w-full px-4">
              <div className="w-full flex justify-between items-center">
                <div className="w-full text-center font-semibold truncate">Search by name</div>
                {loadingTaxa && <LoadingSpinner label="Loading..." />}
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
