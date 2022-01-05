import { Book, Bookmark, Close, Contract, Down, LinkTop, Up } from "grommet-icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  addBookmark,
  fetchAnnotationsByAssemblyID,
  fetchAssemblyByAssemblyID,
  fetchAssemblyGeneralInformationByAssemblyID,
  fetchAssemblySequenceHeaders,
  fetchAssemblyTagsByAssemblyID,
  fetchBuscoAnalysesByAssemblyID,
  fetchFcatAnalysesByAssemblyID,
  fetchMappingsByAssemblyID,
  fetchMiltsAnalysesByAssemblyID,
  fetchRepeatmaskerAnalysesByAssemblyID,
  fetchTaxonByTaxonID,
  fetchTaxonGeneralInformationByTaxonID,
  IAnnotation,
  IAssemblySequenceHeader,
  IBuscoAnalysis,
  IFcatAnalysis,
  IGeneralInformation,
  IMapping,
  IMiltsAnalysis,
  INcbiTaxon,
  IRepeatmaskerAnalysis,
  NotificationObject,
  removeBookmark,
} from "../../../../api";
import Button from "../../../../components/Button";
import LoadingSpinner from "../../../../components/LoadingSpinner";

import GeneralInformationViewer from "./components/GeneralInformationViewer";
import GenomeViewer from "./components/GenomeViewer";
import AssemblyStatisticsPlotViewer from "./components/AssemblyStatisticsPlotViewer";
import AssemblyStatisticsTable from "./components/AssemblyStatisticsTable";
import { useNotification } from "../../../../components/NotificationProvider";
import TaxonomicAssignmentViewer from "./components/TaxonomicAssignmentViewer";
import MaskingsViewer from "./components/MaskingsViewer";
import { AssemblyInterface, AssemblyTagInterface } from "../../../../tsInterfaces/tsInterfaces";
import SpeciesProfilePictureViewer from "../../../../components/SpeciesProfilePictureViewer";
import AssemblyAlphabetPlotViewer from "./components/AssemblyAlphabetPlotViewer";
import AssemblySequenceHeaderTable from "./components/AssemblySequenceHeaderTable";
import BuscoViewer from "./components/BuscoViewer";
import FcatViewer from "./components/FcatViewer";
import AssemblyTagList from "./components/AssemblyTagList";
import FeaturesList from "../FeaturesList";
import AnnotationStatisticsPlotViewer from "./components/AnnotationStatisticsPlotViewer";

const AssemblyInformation = () => {
  const [assembly, setAssembly] = useState<AssemblyInterface>();
  const [assemblyHeaders, setAssemblyHeaders] = useState<IAssemblySequenceHeader[]>([]);
  const [assemblyHeadersOffset, setAssemblyHeaderOffset] = useState<number>(0);
  const [tags, setTags] = useState<AssemblyTagInterface[]>([]);
  const [taxon, setTaxon] = useState<INcbiTaxon>();
  const [assemblyGeneralInformation, setAssemblyGeneralInformation] = useState<
    IGeneralInformation[]
  >([]);
  const [taxonGeneralInformation, setTaxonGeneralInformation] = useState<IGeneralInformation[]>([]);
  const [annotations, setAnnotations] = useState<IAnnotation[]>([]);
  const [mappings, setMappings] = useState<IMapping[]>([]);
  const [buscoAnalyses, setBuscoAnalyses] = useState<IBuscoAnalysis[]>([]);
  const [fcatAnalyses, setFcatAnalyses] = useState<IFcatAnalysis[]>([]);
  const [miltsAnalyses, setMiltsAnalyses] = useState<IMiltsAnalysis[]>([]);
  const [repeatmaskerAnalyses, setRepeatmaskerAnalyses] = useState<IRepeatmaskerAnalysis[]>([]);

  const [fetchingTaxon, setFetchingTaxon] = useState<boolean>(false);
  const [fetchingTaxonGeneralInformation, setFetchingTaxonGeneralInformation] =
    useState<boolean>(false);
  const [fetchingAssembly, setFetchingAssembly] = useState<boolean>(true);
  const [fetchingAssemblyHeaders, setFetchingAssemblyHeaders] = useState<boolean>(false);
  const [fetchingAssemblyGeneralInformation, setFetchingAssemblyGeneralInformation] =
    useState<boolean>(false);
  const [fetchingAssemblyTags, setFetchingAssemblyTags] = useState<boolean>(false);
  const [fetchingAnnotations, setFetchingAnnotations] = useState<boolean>(false);
  const [fetchingMappings, setFetchingMappings] = useState<boolean>(false);
  const [fetchingBuscoAnalyses, setFetchingBuscoAnalyses] = useState<boolean>(false);
  const [fetchingFcatAnalyses, setFetchingFcatAnalyses] = useState<boolean>(false);
  const [fetchingMiltsAnalyses, setFetchingMiltsAnalyses] = useState<boolean>(false);
  const [fetchingRepeatmaskerAnalyses, setFetchingRepeatmaskerAnalyses] = useState<boolean>(false);

  const [hoverBookmark, setHoverBookmark] = useState<boolean>(false);

  const [toggleTaxon, setToggleTaxon] = useState<boolean>(true);
  const [toggleAssembly, setToggleAssembly] = useState<boolean>(false);
  const [toggleAnnotations, setToggleAnnotations] = useState<boolean>(false);
  const [toggleBuscoAnalyses, setToggleBuscoAnalyses] = useState<boolean>(false);
  const [toggleFcatAnalyses, setToggleFcatAnalyses] = useState<boolean>(false);
  const [toggleMiltsAnalyses, setToggleMiltsAnalyses] = useState<boolean>(false);
  const [toggleRepeatmaskerAnalyses, setToggleRepeatmaskerAnalyses] = useState<boolean>(false);
  const [toggleGenomeViewer, setToggleGenomeViewer] = useState<boolean>(false);

  const [taxonomicAssignmentLoading, setTaxonomicAssignmentLoading] = useState<boolean>(false);

  const [sequenceHeaderSearch, setSequenceHeaderSearch] = useState<string>("");

  const [location, setLocation] = useState<string>("");

  const [searchParams, setSearchParams] = useSearchParams();
  const assemblyID = searchParams.get("assemblyID");
  const queryLocation = searchParams.get("location");

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    if (toggleAssembly || !assembly?.id) {
      loadAssembly();
    }
  }, [assemblyID, toggleAssembly]);

  useEffect(() => {
    if (toggleAssembly) {
      loadAssemblySequenceHeaders();
    }
  }, [assembly?.id, toggleAssembly, assemblyHeadersOffset, sequenceHeaderSearch]);

  useEffect(() => {
    if (toggleAssembly) {
      loadAssemblyGeneralInformation();
    }
  }, [assembly?.id, toggleAssembly]);

  useEffect(() => {
    if (toggleTaxon) {
      loadTaxon();
    }
  }, [assembly?.taxonID, toggleTaxon]);

  useEffect(() => {
    if (toggleTaxon) {
      loadTaxonGeneralInformation();
    }
  }, [assembly?.taxonID, toggleTaxon]);

  useEffect(() => {
    if (toggleTaxon) {
      loadAssemblyTags();
    }
  }, [assembly?.taxonID, toggleTaxon]);

  useEffect(() => {
    if (toggleAnnotations) {
      loadAnnotations();
    }
  }, [assembly?.id, toggleAnnotations]);

  useEffect(() => {
    if (toggleGenomeViewer) {
      if (!assembly?.id) {
        loadAssembly();
      }
      if (!annotations.length) {
        loadAnnotations();
      }
      if (!mappings.length) {
        loadMappings();
      }
    }
  }, [assembly?.id, toggleGenomeViewer]);

  useEffect(() => {
    if (toggleBuscoAnalyses) {
      loadBuscoAnalyses();
    }
  }, [assembly?.id, toggleBuscoAnalyses]);

  useEffect(() => {
    if (toggleFcatAnalyses) {
      loadFcatAnalysees();
    }
  }, [assembly?.id, toggleFcatAnalyses]);

  useEffect(() => {
    if (toggleMiltsAnalyses) {
      loadMiltsAnalyses();
    }
  }, [assembly?.id, toggleMiltsAnalyses]);

  useEffect(() => {
    if (toggleRepeatmaskerAnalyses) {
      loadRepeatmaskerAnalyses();
    }
  }, [assembly?.id, toggleRepeatmaskerAnalyses]);

  useEffect(() => {
    if (location) {
      setToggleGenomeViewer(true);
    }
  }, [location, assembly?.id]);

  useEffect(() => {
    if (queryLocation) {
      setLocation(queryLocation);
    }
  }, [queryLocation]);

  const loadAssembly = async () => {
    setFetchingAssembly(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token && assemblyID) {
      const id = parseInt(assemblyID.replace(":", ""));
      await fetchAssemblyByAssemblyID(id, userID, token).then((response) => {
        if (response && response.payload) {
          setAssembly(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAssembly(false);
  };

  const loadAssemblySequenceHeaders = async () => {
    setFetchingAssemblyHeaders(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (userID && token && assembly?.id) {
      await fetchAssemblySequenceHeaders(
        assembly.id,
        10,
        assemblyHeadersOffset,
        sequenceHeaderSearch,
        userID,
        token
      ).then((response) => {
        if (response && response.payload) {
          setAssemblyHeaders(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAssemblyHeaders(false);
  };

  const loadAssemblyGeneralInformation = async () => {
    setFetchingAssemblyGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchAssemblyGeneralInformationByAssemblyID(assembly.id, userID, token).then(
        (response) => {
          if (response && response.payload) {
            setAssemblyGeneralInformation(response.payload);
          }
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        }
      );
    }
    setFetchingAssemblyGeneralInformation(false);
  };

  const loadAssemblyTags = async () => {
    setFetchingAssemblyTags(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchAssemblyTagsByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setTags(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAssemblyTags(false);
  };

  const loadTaxon = async () => {
    setFetchingTaxon(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.taxonID && userID && token) {
      await fetchTaxonByTaxonID(assembly.taxonID, userID, token).then((response) => {
        if (response && response.payload) {
          setTaxon(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingTaxon(false);
  };

  const loadTaxonGeneralInformation = async () => {
    setFetchingTaxonGeneralInformation(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.taxonID && userID && token) {
      await fetchTaxonGeneralInformationByTaxonID(assembly.taxonID, userID, token).then(
        (response) => {
          if (response && response.payload) {
            setTaxonGeneralInformation(response.payload);
          }
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        }
      );
    }
    setFetchingTaxonGeneralInformation(false);
  };

  const loadAnnotations = async () => {
    setFetchingAnnotations(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchAnnotationsByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setAnnotations(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingAnnotations(false);
  };

  const loadMappings = async () => {
    setFetchingMappings(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchMappingsByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setMappings(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingMappings(false);
  };

  const loadBuscoAnalyses = async () => {
    setFetchingBuscoAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchBuscoAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setBuscoAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingBuscoAnalyses(false);
  };

  const loadFcatAnalysees = async () => {
    setFetchingFcatAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchFcatAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setFcatAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingFcatAnalyses(false);
  };

  const loadMiltsAnalyses = async () => {
    setFetchingMiltsAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchMiltsAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setMiltsAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingMiltsAnalyses(false);
  };

  const loadRepeatmaskerAnalyses = async () => {
    setFetchingRepeatmaskerAnalyses(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      await fetchRepeatmaskerAnalysesByAssemblyID(assembly.id, userID, token).then((response) => {
        if (response && response.payload) {
          setRepeatmaskerAnalyses(response.payload);
        }
        if (response?.notification) {
          response.notification.forEach((not) => handleNewNotification(not));
        }
      });
    }
    setFetchingRepeatmaskerAnalyses(false);
  };

  const handleBookmarkAssembly = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    if (assembly && assembly.id && userID && token) {
      if (!assembly.bookmarked) {
        await addBookmark(userID, assembly.id, token).then((response) => {
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        });
      } else {
        await removeBookmark(userID, assembly.id, token).then((response) => {
          if (response?.notification) {
            response.notification.forEach((not) => handleNewNotification(not));
          }
        });
      }
    }
  };

  const shrinkAll = () => {
    setToggleTaxon(true);
    setToggleAssembly(false);
    setToggleAnnotations(false);
    setToggleBuscoAnalyses(false);
    setToggleFcatAnalyses(false);
    setToggleMiltsAnalyses(false);
    setToggleRepeatmaskerAnalyses(false);
    setToggleGenomeViewer(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="pb-32 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 text-gray-800">
      {/* Header */}
      <div className="h-1 bg-gradient-to-t from-gray-900 via-gray-500 to-gray-200" />
      <div className="z-20 flex justify-between items-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 text-white sticky top-16 h-16 px-4 text-xl font-bold shadow-lg border-b border-gray-500">
        {taxon?.scientificName ? (
          <div className="flex justify-between items-center">
            <div className="px-2 animate-fade-in">{taxon.scientificName}</div>
            {assembly?.label && assembly?.name && (
              <div className="flex items-center animate-fade-in">
                <div className="px-2">{">"}</div>
                <div className="px-2">{assembly.label}</div>
                <div className="px-2 font-normal">{"(" + assembly.name + ")"}</div>
              </div>
            )}
            {!assembly?.label && assembly?.name && (
              <div className="px-2 animate-fade-in">{"> " + assembly.name}</div>
            )}
          </div>
        ) : (
          <div>
            {fetchingAssembly ||
              (fetchingTaxon ? (
                <div className="animate-fade-in">
                  <LoadingSpinner label="Loading..." />
                </div>
              ) : (
                <div className="animate-fade-in">Data not available!</div>
              ))}
          </div>
        )}
        <div className="flex items-center">
          <div>
            <Button onClick={() => shrinkAll()} color="secondary">
              <Contract className="stroke-current animate-grow-y" color="blank" />
            </Button>
          </div>
          <div className="mx-4">
            <Button onClick={() => window.scrollTo(0, 0)} color="secondary">
              <LinkTop className="stroke-current animate-grow-y" color="blank" />
            </Button>
          </div>
          <div
            onMouseEnter={() => setHoverBookmark(true)}
            onMouseLeave={() => setHoverBookmark(false)}
          >
            <Button onClick={() => handleBookmarkAssembly()} color="secondary">
              {!assembly?.bookmarked ? (
                <Bookmark className="stroke-current animate-grow-y" color="blank" />
              ) : (
                <div>
                  {!hoverBookmark ? (
                    <Book className="stroke-current animate-grow-y" color="blank" />
                  ) : (
                    <Close className="stroke-current animate-grow-y" color="blank" />
                  )}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main information grid */}
      <div className="grid grid-cols-5 gap-4 px-2 py-2">
        <div
          onClick={() => setToggleTaxon((prevState) => !prevState)}
          className="col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Taxon information</div>
          <div className="text-sm">
            {(fetchingTaxon || fetchingTaxonGeneralInformation) && (
              <LoadingSpinner label="Loading assembly data..." />
            )}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleTaxon ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        {/* TAXON IMAGE*/}
        <div className="flex justify-center items-center">
          {toggleTaxon && (
            <div className="w-full shadow animate-fade-in bg-gray-500 overflow-hidden bg-white border-4 border-double border-gray-300">
              {taxon?.id && (
                <SpeciesProfilePictureViewer
                  taxonID={taxon.id}
                  imagePath={taxon?.imagePath}
                  useTimestamp={false}
                />
              )}
            </div>
          )}
        </div>

        {/* TAXON GENERAL INFORMATION*/}
        <div className="flex justify-center col-span-4">
          {toggleTaxon && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {taxon?.id && <GeneralInformationViewer generalInfos={taxonGeneralInformation} />}
            </div>
          )}
        </div>

        <div
          onClick={() => setToggleAssembly((prevState) => !prevState)}
          className="mt-8 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Assembly information</div>
          <div className="text-sm">
            {(fetchingAssemblyGeneralInformation ||
              fetchingAssembly ||
              fetchingAssemblyHeaders ||
              fetchingAssemblyTags) && <LoadingSpinner label="Loading assembly data..." />}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleAssembly ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        {/* ASSEMBLY STATISTICS PLOT */}
        <div className="flex justify-center col-span-3">
          {toggleAssembly && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly && assembly.id && <AssemblyStatisticsPlotViewer assembly={assembly} />}
            </div>
          )}
        </div>

        {/* ASSEMBLY STATISTICS TABLE */}
        <div className="flex justify-center col-span-2">
          {toggleAssembly && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly && assembly.id && <AssemblyStatisticsTable assembly={assembly} />}
            </div>
          )}
        </div>

        {/* ASSEMBLY ALPHABET PLOT */}
        <div className="flex justify-center col-span-2">
          {toggleAssembly && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly?.id && <AssemblyAlphabetPlotViewer assembly={assembly} />}
            </div>
          )}
        </div>

        {/* ASSEMBLY SEQUENCE HEADERS (LARGEST 10) */}
        <div className="flex justify-center col-span-3">
          {toggleAssembly && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly?.id && (
                <AssemblySequenceHeaderTable
                  sequenceHeaders={assemblyHeaders}
                  setSequenceHeaderSearch={setSequenceHeaderSearch}
                  setLocation={setLocation}
                  setOffset={setAssemblyHeaderOffset}
                />
              )}
            </div>
          )}
        </div>

        {/* ASSEMBLY GENERAL INFORMATION*/}
        <div className="flex justify-center col-span-3">
          {toggleAssembly && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly?.id && (
                <GeneralInformationViewer generalInfos={assemblyGeneralInformation} />
              )}
            </div>
          )}
        </div>

        {/* ASSEMBLY TAGS*/}
        <div className="flex justify-center col-span-2">
          {toggleAssembly && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly?.id && <AssemblyTagList tags={tags} />}
            </div>
          )}
        </div>

        <div
          onClick={() => setToggleMiltsAnalyses((prevState) => !prevState)}
          className="mt-8 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Taxonomic assignment</div>
          <div className="text-sm">
            {(fetchingMiltsAnalyses || taxonomicAssignmentLoading) && (
              <LoadingSpinner label="Loading milts data..." />
            )}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleMiltsAnalyses ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        {/* MILTS */}
        <div className="flex justify-center col-span-5">
          {toggleMiltsAnalyses && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {miltsAnalyses && miltsAnalyses.length > 0 ? (
                <TaxonomicAssignmentViewer
                  milts={miltsAnalyses}
                  setTaxonomicAssignmentLoading={setTaxonomicAssignmentLoading}
                />
              ) : (
                <div className="text-center py-4 font-semibold">No taxonomic assignemnt!</div>
              )}
            </div>
          )}
        </div>

        {/* ANNOTATION */}
        <div
          onClick={() => setToggleAnnotations((prevState) => !prevState)}
          className="mt-16 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Annotation information</div>
          <div className="text-sm">
            {fetchingAnnotations && <LoadingSpinner label="Loading annotation data..." />}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleAnnotations ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        <div className="col-span-1" />

        <div className="flex justify-center col-span-3">
          {toggleAnnotations && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {annotations && annotations.length > 0 ? (
                <AnnotationStatisticsPlotViewer annotations={annotations} />
              ) : (
                <div className="text-center py-4 font-semibold">No annotation!</div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-1" />

        <div className="flex justify-center col-span-5">
          {toggleAnnotations && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {assembly?.id && annotations && annotations.length > 0 ? (
                <FeaturesList title="Assembly features" assemblyID={assembly.id} />
              ) : (
                <div className="text-center py-4 font-semibold">No features for this assembly!</div>
              )}
            </div>
          )}
        </div>

        <div
          onClick={() => {
            setToggleBuscoAnalyses((prevState) => !prevState);
            setToggleFcatAnalyses((prevState) => !prevState);
          }}
          className="mt-16 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Annotation completeness</div>
          <div className="text-sm">
            {(fetchingBuscoAnalyses || fetchingFcatAnalyses) && (
              <LoadingSpinner label="Loading busco/fcat data..." />
            )}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleBuscoAnalyses ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        <div className="flex justify-center col-span-4">
          {toggleBuscoAnalyses && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {buscoAnalyses && buscoAnalyses.length > 0 ? (
                <BuscoViewer taxon={taxon} assembly={assembly} busco={buscoAnalyses} />
              ) : (
                <div className="text-center py-4 font-semibold">No busco analyses!</div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-1" />

        <div className="col-span-1" />

        <div className="flex justify-center col-span-4">
          {toggleFcatAnalyses && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {fcatAnalyses && fcatAnalyses.length > 0 ? (
                <FcatViewer taxon={taxon} assembly={assembly} fcat={fcatAnalyses} />
              ) : (
                <div className="text-center py-4 font-semibold">No fCat analyses!</div>
              )}
            </div>
          )}
        </div>

        <div
          onClick={() => setToggleRepeatmaskerAnalyses((prevState) => !prevState)}
          className="mt-12 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Repeatmasking</div>
          <div className="text-sm">
            {fetchingRepeatmaskerAnalyses && (
              <LoadingSpinner label="Loading repeatmasker data..." />
            )}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleRepeatmaskerAnalyses ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        <div className="flex justify-center col-span-5">
          {toggleRepeatmaskerAnalyses && (
            <div className="w-full h-full border-4 border-double border-gray-300 shadow animate-fade-in bg-white overflow-hidden">
              {repeatmaskerAnalyses && repeatmaskerAnalyses.length > 0 ? (
                <MaskingsViewer
                  assembly={assembly}
                  taxon={taxon}
                  repeatmasker={repeatmaskerAnalyses}
                />
              ) : (
                <div className="text-center py-4 font-semibold">No repeatmasker analyses!</div>
              )}
            </div>
          )}
        </div>

        <div
          onClick={() => setToggleGenomeViewer((prevState) => !prevState)}
          className="mt-16 col-span-5 text-white border-b w-full px-4 py-1 font-semibold text-xl flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-lg hover:text-gray-200"
        >
          <div className="w-96">Genome viewer</div>
          <div className="text-sm">
            {(fetchingAnnotations || fetchingMappings || fetchingAssembly) && (
              <LoadingSpinner label="Loading viewer data..." />
            )}
          </div>
          <div className="flex items-center w-96 justify-end">
            {toggleGenomeViewer ? (
              <Down className="stroke-current animate-grow-y" color="blank" />
            ) : (
              <Up className="stroke-current animate-grow-y" color="blank" />
            )}
          </div>
        </div>

        {/* GENOME VIEWER */}
        <div className="flex justify-center col-span-5">
          {toggleGenomeViewer && !fetchingAssembly && !fetchingAnnotations && !fetchingMappings ? (
            <div className="w-full h-full animate-fade-in overflow-hidden">
              {assembly && assembly.id && (
                <GenomeViewer
                  assemblyDetails={assembly}
                  annotations={annotations}
                  mappings={mappings}
                  location={location}
                />
              )}
            </div>
          ) : (
            <div className="w-full flex justify-center items center h-32" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssemblyInformation;
