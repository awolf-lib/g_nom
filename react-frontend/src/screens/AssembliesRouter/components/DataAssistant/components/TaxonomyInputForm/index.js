import React from "react";

import Input from "../../../../../../components/Input";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";

const TaxonomyInputForm = (props) => {
  const {
    taxonID,
    handleTaxonIDChange,
    taxa,
    handleChangeSelectedTaxon,
    selectedTaxon,
    view,
    setView,
  } = props;
  return (
    <div className="animate-grow-y">
      <div className="mt-8 lg:mx-32 shadow rounded-lg p-4">
        <div
          className="flex justify-between font-bold text-lg cursor-pointer select-none"
          onClick={() => setView((prevState) => !prevState)}
        >
          <div className="hover:text-blue-600">1. Input NCBI taxonomy ID!</div>
          {selectedTaxon && selectedTaxon.scientificName && (
            <div className="animate-fade-in text-blue-500 flex items-center text-sm truncate">
              {selectedTaxon.ncbiTaxonID +
                " (" +
                selectedTaxon.scientificName +
                ")"}
              {selectedTaxon.imageStored === 1 && (
                <div className="hidden sm:block h-8 w-8 ml-4 animate-fade-in rounded overflow-hidden">
                  <SpeciesProfilePictureViewer
                    taxonID={selectedTaxon.ncbiTaxonID}
                    imageStatus={selectedTaxon.imageStored}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        {view && (
          <div className="animate-grow-y">
            <hr className="mt-4 mb-8 shadow" />
            <div className="py-4 flex justify-around items-center">
              <div className="w-32 md:w-64">
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
  );
};

export default TaxonomyInputForm;

TaxonomyInputForm.defaultProps = {};

TaxonomyInputForm.propTypes = {};
