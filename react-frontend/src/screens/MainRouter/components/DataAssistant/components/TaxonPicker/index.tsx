import { Down, Up } from "grommet-icons";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { fetchTaxonByNCBITaxonID, INcbiTaxon } from "../../../../../../api";
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

  const fetchTaxa = (id: number | undefined) => {
    clearTimeout(requestTimeoutTaxonID);
    setTaxa([]);
    getTaxon(undefined);
    if (id) {
      setRequestTimeoutTaxonID(
        setTimeout(() => {
          setLoadingTaxa(true);
          const userID = JSON.parse(sessionStorage.getItem("userID") || "{}");
          const token = JSON.parse(sessionStorage.getItem("token") || "{}");

          if (userID && token) {
            fetchTaxonByNCBITaxonID(parseInt(userID), token, id).then((response) => {
              if (response.payload) {
                setTaxa(response.payload);

                if (response.payload.length === 1) {
                  setTaxon(response.payload[0]);
                  getTaxon(response.payload[0]);
                }
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

  const handleChangeTaxon = (taxonID: string) => {
    const targetTaxon = taxa.find((obj: INcbiTaxon) => obj.id + "" === taxonID);
    setTaxon(targetTaxon);
    getTaxon(targetTaxon);
  };

  return (
    <div className="text-gray-700">
      <div className="xl:flex justify-center animate-grow-y">
        {taxon && taxon.id && (
          <div className="flex justify-around items-center w-full border p-2 rounded shadow bg-gray-100">
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

        <div className="bg-gray-200 flex justify-around w-full xl:w-2/3 mb-2 xl:mb-0 items-center border py-6 rounded shadow">
          <label className="w-full px-4">
            <div className="w-full flex justify-between items-center">
              <div className="w-full text-center font-semibold truncate">Specify target taxon:</div>
              {loadingTaxa && <LoadingSpinner label="Loading..." />}
            </div>
            <hr className="shadow my-4" />
            <div className="shadow-lg">
              <Input
                type="number"
                onChange={(e) => fetchTaxa(e.target.value)}
                placeholder={taxon && taxon.ncbiTaxonID ? taxon.ncbiTaxonID + "" : "NCBI ID"}
              />
            </div>
          </label>

          {taxa && taxa.length > 1 && (
            <label className="w-full px-4 animate-fade-in">
              <div className="text-center text-xs font-semibold truncate">
                Multiple entries detected:
              </div>
              <hr className="shadow my-4" />
              <div className="w-full px-4">
                <select
                  className="text-sm p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 ring-offset-1 transition duration-300"
                  onChange={(e) => handleChangeTaxon(e.target.value)}
                >
                  {taxa.map((tx: INcbiTaxon) => (
                    <option value={tx.id}>
                      {"ID: " + tx.id + " - " + tx.scientificName}{" "}
                      {tx.commonName && " (" + tx.commonName + ")"}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxonPicker;
