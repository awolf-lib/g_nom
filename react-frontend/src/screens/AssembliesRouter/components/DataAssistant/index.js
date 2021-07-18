import React, { useState } from "react";
import API from "../../../../api";
import { useNotification } from "../../../../components/NotificationProvider";

import TaxonomyInputForm from "./components/TaxonomyInputForm";
import AssistantSelector from "./components/AssistantSelector";
import AssistantProvider from "./components/AssistantProvider";

const DataAssistant = () => {
  // view 1 - states
  const [view1, setView1] = useState(true);
  const [taxonID, setTaxonID] = useState(0);
  const [changeTaxonIDTimeout, setChangeTaxonIDTimeout] = useState(undefined);
  const [taxa, setTaxa] = useState([]);
  const [selectedTaxon, setSelectedTaxon] = useState({});

  // view 2 - states
  const [view2, setView2] = useState(true);
  const [mode, setMode] = useState("");
  const [object, setObject] = useState({});

  // view 3 - states
  const [view3, setView3] = useState(true);

  const api = new API();

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  // view 1
  const handleTaxonIDChange = (inputNcbiTaxonID) => {
    clearTimeout(changeTaxonIDTimeout);
    setView2(true);
    setView3(true);
    setTaxonID(inputNcbiTaxonID);
    setTaxa([]);
    setSelectedTaxon({});
    setMode("");
    setChangeTaxonIDTimeout(
      setTimeout(() => {
        if (inputNcbiTaxonID !== "") {
          loadTaxaByNcbiTaxonID(inputNcbiTaxonID);
        }
      }, 2000)
    );
  };

  const loadTaxaByNcbiTaxonID = async (taxonID) => {
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

  const handleChangeSelectedTaxon = (inputNcbiTaxonID) => {
    setView1(false);
    setView2(true);
    setView3(true);
    setSelectedTaxon(inputNcbiTaxonID);
    setMode("");
  };

  // view 2
  const handleModeChange = (inputMode, object = {}) => {
    setView2(true);
    setView3(true);
    setMode(inputMode);
    setObject(object);
  };

  return (
    <div className="mb-64">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              Data assistant
            </h1>
          </div>
        </div>
      </header>

      {/** View 1 */}
      <TaxonomyInputForm
        taxonID={taxonID}
        handleTaxonIDChange={handleTaxonIDChange}
        taxa={taxa}
        selectedTaxon={selectedTaxon}
        handleChangeSelectedTaxon={handleChangeSelectedTaxon}
        view={view1}
        setView={setView1}
      />

      {/** View 2 */}
      {selectedTaxon && selectedTaxon.id && (
        <AssistantSelector
          mode={mode}
          selectedTaxon={selectedTaxon}
          handleModeChange={handleModeChange}
          view={view2}
          setView={setView2}
        />
      )}

      {/** View 3 */}
      {mode && (
        <AssistantProvider
          selectedTaxon={selectedTaxon}
          setSelectedTaxon={setSelectedTaxon}
          mode={mode}
          handleModeChange={handleModeChange}
          view={view3}
          setView={setView3}
          object={object}
        />
      )}
    </div>
  );
};

export default DataAssistant;
