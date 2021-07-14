import React, { useState, useEffect } from "react";

import { CaretNext, CaretPrevious, Play, Pause, Up, Down } from "grommet-icons";

import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import Button from "../../../../../../components/Button";

const GeneralInformationCarousel = ({
  generalInfos,
  ncbiTaxonID,
  imageStatus,
}) => {
  const [
    taxonGeneralInfoCarouselIndex,
    setTaxonGeneralInfoCarouselIndex,
  ] = useState(0);
  const [taxonGeneralInfoInterval, setTaxonGeneralInfoInterval] = useState(
    undefined
  );

  useEffect(() => {
    setTaxonGeneralInfoInterval(
      setInterval(() => {
        setTaxonGeneralInfoCarouselIndex((prevState) =>
          prevState + 1 < generalInfos.length ? prevState + 1 : 0
        );
      }, 10000)
    );
    return clearInterval(taxonGeneralInfoInterval);
  }, []);

  const handlePauseTaxonGeneralInfoInterval = () => {
    if (taxonGeneralInfoInterval) {
      clearInterval(taxonGeneralInfoInterval);
      setTaxonGeneralInfoInterval(undefined);
    } else {
      setTaxonGeneralInfoInterval(
        setInterval(() => {
          setTaxonGeneralInfoCarouselIndex((prevState) =>
            prevState + 1 < generalInfos.length ? prevState + 1 : 0
          );
        }, 10000)
      );
    }
  };

  const handleShowAll = () => {
    if (taxonGeneralInfoInterval) {
      clearInterval(taxonGeneralInfoInterval);
      setTaxonGeneralInfoInterval(undefined);
      setTaxonGeneralInfoCarouselIndex(-1);
    } else {
      setTaxonGeneralInfoCarouselIndex(0);
      setTaxonGeneralInfoInterval(
        setInterval(() => {
          setTaxonGeneralInfoCarouselIndex((prevState) =>
            prevState + 1 < generalInfos.length ? prevState + 1 : 0
          );
        }, 10000)
      );
    }
  };
  return (
    <div className="animate-grow-y">
      <div className="relative z-10 flex justify-center mb-6 lg:block lg:mb-0">
        <div className="w-64 h-64 rounded-lg mt-8 mx-8 p-2 border bg-gray-100 shadow-lg transform transition duration-300 hover:scale-110">
          <div className="rounded-lg overflow-hidden">
            <SpeciesProfilePictureViewer
              taxonID={ncbiTaxonID}
              imageStatus={imageStatus}
            />
          </div>
        </div>
      </div>

      <div className="relative items-center lg:-mt-48 border mx-4 lg:mx-16 shadow-lg rounded-lg px-2 lg:px-8 py-16 lg:pl-64 min-h-1/4 bg-indigo-100">
        {generalInfos
          .sort((a, b) => (a.generalInfoLabel < b.generalInfoLabel ? -1 : 0))
          .map((generalInfo, index) => {
            if (
              index === taxonGeneralInfoCarouselIndex ||
              taxonGeneralInfoCarouselIndex === -1
            )
              return (
                <div
                  key={generalInfo.generalInfoLabel + index}
                  className={
                    taxonGeneralInfoCarouselIndex !== -1
                      ? "lg:flex lg:px-4 py-4 rounded-lg w-full min-h-1/4 bg-white lg:shadow"
                      : "lg:flex lg:px-4 py-4 rounded-lg w-full lg:shadow bg-white mb-4"
                  }
                >
                  <div className="w-full text-center lg:text-left lg:w-1/5 h-full text-xs lg:text-base lg:font-semibold lg:border-b animate-fade-in font-bold rounded p-4">
                    {generalInfo.generalInfoLabel}
                  </div>
                  <div className="lg:w-4/5 text-justify flex items-center text-xs lg:text-sm lg:border-l-4 px-8 py-4 rounded-lg lg:border-t lg:border-b animate-grow-y">
                    {generalInfo.generalInfoDescription}
                  </div>
                </div>
              );
          })}
        <div className="z-10 absolute right-0 top-0 flex justify-between shadow rounded-full my-4 mx-8  bg-white h-8 flex items-center">
          <div className="px-2">
            <Button
              color="link"
              onClick={() =>
                setTaxonGeneralInfoCarouselIndex((prevState) =>
                  prevState - 1 > 0 ? prevState - 1 : generalInfos.length - 1
                )
              }
            >
              <CaretPrevious
                size="small"
                color="blank"
                className="stroke-current"
              />
            </Button>
          </div>
          <div className="px-2">
            <Button
              color="link"
              onClick={() => handlePauseTaxonGeneralInfoInterval()}
            >
              {taxonGeneralInfoInterval ? (
                <Pause
                  size="small"
                  color="blank"
                  className="stroke-current animate-grow-y"
                />
              ) : (
                <Play
                  size="small"
                  color="blank"
                  className="stroke-current animate-grow-y"
                />
              )}
            </Button>
          </div>
          <div className="px-2">
            <Button
              color="link"
              onClick={() =>
                setTaxonGeneralInfoCarouselIndex((prevState) =>
                  prevState + 1 < generalInfos.length ? prevState + 1 : 0
                )
              }
            >
              <CaretNext
                size="small"
                color="blank"
                className="stroke-current"
              />
            </Button>
          </div>
        </div>
        <div className="z-10 absolute right-0 bottom-0 flex mb-2 mx-12">
          <div className="px-2">
            <Button color="link" onClick={() => handleShowAll()}>
              {taxonGeneralInfoCarouselIndex !== -1 ? (
                <Down size="small" color="blank" className="stroke-current" />
              ) : (
                <Up size="small" color="blank" className="stroke-current" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformationCarousel;
