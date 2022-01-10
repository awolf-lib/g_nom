import { useState, useEffect } from "react";
import { IGeneralInformation } from "../../../../../../api";

import {
  CaretNext,
  CaretPrevious,
  Play,
  Pause,
  Up,
  Down,
  Radial,
  RadialSelected,
} from "grommet-icons";

const GeneralInformationViewer = ({ generalInfos }: { generalInfos: IGeneralInformation[] }) => {
  const [taxonGeneralInfoCarouselIndex, setTaxonGeneralInfoCarouselIndex] = useState(0);
  const [taxonGeneralInfoInterval, setTaxonGeneralInfoInterval] = useState<any>(undefined);

  useEffect(() => {
    setTaxonGeneralInfoInterval(
      setInterval(() => {
        setTaxonGeneralInfoCarouselIndex((prevState) =>
          prevState + 1 < generalInfos.length ? prevState + 1 : 0
        );
      }, 10000)
    );
    return () => clearInterval(taxonGeneralInfoInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalInfos.length]);

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
    <div className="w-full h-full bg-gray-500 py-4 px-8 text-gray-700 flex items-center">
      <div className="flex items-center w-full">
        <div className="w-full">
          {generalInfos && generalInfos.length > 0 ? (
            generalInfos
              .sort((a, b) => (a.generalInfoLabel < b.generalInfoLabel ? -1 : 0))
              .map((generalInfo, index) => {
                if (
                  index === taxonGeneralInfoCarouselIndex ||
                  taxonGeneralInfoCarouselIndex === -1
                ) {
                  return (
                    <div className="animate-fade-in-fast" key={generalInfo.id}>
                      <div
                        key={generalInfo.generalInfoLabel + index}
                        className="border-4 border-gray-400 flex rounded-lg w-full bg-white shadow-lg mb-4 items-center animate-slide-left animate-fade-in"
                      >
                        <div className="border-b-2 border-dashed flex items-center text-center h-full text-xl font-bold px-4 py-2">
                          {generalInfo.generalInfoLabel}
                        </div>
                        <div className="flex items-center text-justify text-sm border-l-4 px-8 py-4 min-h-48 rounded-lg">
                          {generalInfo.generalInfoDescription}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return <div key={generalInfo.generalInfoLabel + index} />;
                }
              })
          ) : (
            <div className="border-4 border-gray-400 flex rounded-lg w-full bg-white shadow mb-4 items-center animate-slide-left animate-fade-in">
              <div className="border-b-2 border-dashed flex items-center text-center h-full text-xl font-bold px-4 py-2">
                Empty
              </div>
              <div className="flex items-center text-justify text-sm border-l-4 px-8 py-4 min-h-48 rounded-lg">
                There is currently no general information! You can add general information as admin
                in the data assistant!
              </div>
            </div>
          )}
          <div className="flex justify-between items-center h-8">
            <div className="border-2 border-gray-300 flex items-center justify-center w-full bg-white rounded-full h-8">
              {generalInfos &&
                generalInfos.length > 0 &&
                generalInfos.map((element, index) => {
                  if (
                    index !== taxonGeneralInfoCarouselIndex &&
                    taxonGeneralInfoCarouselIndex !== -1
                  ) {
                    return (
                      <div
                        key={element.id}
                        className="flex items-center opacity-50 transition transform duration-300 px-1 scale-90 hover:scale-110 cursor-pointer"
                        onClick={() => {
                          setTaxonGeneralInfoCarouselIndex(index);
                          clearInterval(taxonGeneralInfoInterval);
                          setTaxonGeneralInfoInterval(
                            setInterval(() => {
                              setTaxonGeneralInfoCarouselIndex((prevState) =>
                                prevState + 1 < generalInfos.length ? prevState + 1 : 0
                              );
                            }, 10000)
                          );
                        }}
                      >
                        <Radial color="blank" className="stroke-current" size="small" />
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={element.id}
                        className="flex items-center opacity-75 transition transform duration-300 px-1 scale-110 cursor-pointer"
                      >
                        <RadialSelected color="blank" className="stroke-current" size="small" />
                      </div>
                    );
                  }
                })}
            </div>
            <div className="border-2 border-gray-300 flex justify-between shadow rounded-full bg-white mx-4 h-8 items-center">
              <div
                className="px-2 flex items-center"
                onClick={() => {
                  setTaxonGeneralInfoCarouselIndex((prevState) =>
                    prevState - 1 >= 0 ? prevState - 1 : generalInfos.length - 1
                  );
                  clearInterval(taxonGeneralInfoInterval);
                  setTaxonGeneralInfoInterval(
                    setInterval(() => {
                      setTaxonGeneralInfoCarouselIndex((prevState) =>
                        prevState + 1 < generalInfos.length ? prevState + 1 : 0
                      );
                    }, 10000)
                  );
                }}
              >
                <CaretPrevious size="small" color="blank" className="stroke-current" />
              </div>
              <div
                className="px-2 flex items-center"
                onClick={() => handlePauseTaxonGeneralInfoInterval()}
              >
                {taxonGeneralInfoInterval ? (
                  <Pause
                    size="small"
                    color="blank"
                    className="stroke-current animate-fade-in-fast"
                  />
                ) : (
                  <Play
                    size="small"
                    color="blank"
                    className="stroke-current animate-fade-in-fast"
                  />
                )}
              </div>
              <div
                className="px-2 flex items-center"
                onClick={() => {
                  setTaxonGeneralInfoCarouselIndex((prevState) =>
                    prevState + 1 < generalInfos.length ? prevState + 1 : 0
                  );
                  clearInterval(taxonGeneralInfoInterval);
                  setTaxonGeneralInfoInterval(
                    setInterval(() => {
                      setTaxonGeneralInfoCarouselIndex((prevState) =>
                        prevState + 1 < generalInfos.length ? prevState + 1 : 0
                      );
                    }, 10000)
                  );
                }}
              >
                <CaretNext size="small" color="blank" className="stroke-current" />
              </div>
            </div>
            <div
              className="border-2 border-gray-300 px-2 flex justify-between items-center h-8 shadow rounded-lg bg-white"
              onClick={() => handleShowAll()}
            >
              {taxonGeneralInfoCarouselIndex !== -1 ? (
                <Down size="small" color="blank" className="stroke-current animate-grow-y" />
              ) : (
                <Up size="small" color="blank" className="stroke-current animate-grow-y" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformationViewer;
