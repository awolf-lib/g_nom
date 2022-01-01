import { createViewState, JBrowseLinearGenomeView } from "@jbrowse/react-linear-genome-view";
import "@fontsource/roboto";
import { useEffect, useState } from "react";
import { Expand } from "grommet-icons";

const GenomeViewer = ({ assemblyDetails, annotations, mappings, location = "" }) => {
  const [assembly, setAssembly] = useState({});
  const [tracks, setTracks] = useState([]);
  const [defaultSession, setDefaultSession] = useState({});
  const [configuration, setConfiguration] = useState({});
  const [aggregateTextSearchAdapters, setAggregateTextSearchAdapters] = useState([]);

  const [locationState, setLocationState] = useState("");

  useEffect(() => {
    setLocationState(location);
  }, [location]);

  useEffect(() => {
    setAssembly({
      name: assemblyDetails.name,
      sequence: {
        type: "ReferenceSequenceTrack",
        trackId: assemblyDetails.name + "-ReferenceSequenceTrack",
        adapter: {
          type: "BgzipFastaAdapter",
          fastaLocation: {
            uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${assemblyDetails.name}.fasta.gz`,
            locationType: "UriLocation",
          },
          faiLocation: {
            uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${assemblyDetails.name}.fasta.gz.fai`,
            locationType: "UriLocation",
          },
          gziLocation: {
            uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${assemblyDetails.name}.fasta.gz.gzi`,
            locationType: "UriLocation",
          },
        },
      },
    });
  }, [assemblyDetails]);

  useEffect(() => {
    const annotationsTracks = annotations.map((annotation, index) => {
      const fileBasename = annotation.path.split("/").reverse()[0];
      return {
        type: "FeatureTrack",
        trackId: "track_annotation_" + annotation.id,
        name: annotation.name,
        category: ["annotation"],
        assemblyNames: [assemblyDetails.name],
        adapter: {
          type: "Gff3TabixAdapter",
          gffGzLocation: {
            uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${fileBasename}`,
            locationType: "UriLocation",
          },
          index: {
            location: {
              uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${fileBasename}.tbi`,
              locationType: "UriLocation",
            },
            indexType: "TBI",
          },
        },
      };
    });

    const mappingTracks = mappings.map((mapping, index) => {
      const fileBasename = mapping.path.split("/").reverse()[0];
      return {
        type: "AlignmentsTrack",
        trackId: "track_mapping_" + mapping.id,
        name: mapping.name,
        adapter: {
          type: "BamAdapter",
          bamLocation: {
            uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${fileBasename}`,
            locationType: "UriLocation",
          },
          index: {
            location: {
              uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${fileBasename}.bai`,
              locationType: "UriLocation",
            },
            indexType: "BAI",
          },
          sequenceAdapter: {
            type: "BgzipFastaAdapter",
            fastaLocation: {
              uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${assemblyDetails.name}.fasta.gz`,
              locationType: "UriLocation",
            },
            faiLocation: {
              uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${assemblyDetails.name}.fasta.gz.fai`,
              locationType: "UriLocation",
            },
            gziLocation: {
              uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/${assemblyDetails.name}.fasta.gz.gzi`,
              locationType: "UriLocation",
            },
          },
        },
        category: ["mapping"],
        assemblyNames: [assemblyDetails.name],
      };
    });

    setTracks(annotationsTracks.concat(mappingTracks));
  }, [annotations, mappings]);

  useEffect(() => {
    setDefaultSession({
      name: "Gnom - " + assemblyDetails.name,
      view: {
        type: "linearGenomeView",
      },
    });
  }, [assemblyDetails]);

  useEffect(() => {
    setConfiguration({
      theme: {
        palette: {
          primary: {
            main: "#3b82f6",
          },
          secondary: {
            main: "#c7d2fe",
          },
          tertiary: {
            main: "#c7d2fe",
          },
        },
      },
    });
  }, [assemblyDetails]);

  useEffect(() => {
    setAggregateTextSearchAdapters([
      {
        type: "TrixTextSearchAdapter",
        textSearchAdapterId: "text_search_adapter_annotation_" + annotations.id,
        ixFilePath: {
          uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/trix/${assemblyDetails.name}.ix`,
          locationType: "UriLocation",
        },
        ixxFilePath: {
          uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/trix/${assemblyDetails.name}.ixx`,
          locationType: "UriLocation",
        },
        metaFilePath: {
          uri: `${process.env.REACT_APP_JBROWSE_ADRESS}/assemblies/${assemblyDetails.name}/trix/${assemblyDetails.name}_meta.json`,
          locationType: "UriLocation",
        },
        assemblyNames: [assemblyDetails.name],
      },
    ]);
  }, [assemblyDetails]);

  return (
    <div className="relative mx-8">
      {assemblyDetails?.id && defaultSession.name && configuration.theme && (
        <JBrowseLinearGenomeView
          viewState={createViewState({
            assembly: assembly,
            tracks: tracks,
            configuration: configuration,
            location: locationState,
            aggregateTextSearchAdapters: aggregateTextSearchAdapters,
          })}
        />
      )}
      <a
        className="absolute bottom-0 right-0 mx-4 my-3 opacity-25 hover:opacity-100 text-gray-600"
        target="_blank"
        rel="noopener noreferrer"
        href={`${process.env.REACT_APP_JBROWSE_ADRESS}/index.html?config=assemblies%2F${assemblyDetails.name}%2Fconfig.json&session=session=local-WYqeaO9Fn`}
      >
        <Expand className="stroke-current" color="blank" />
      </a>
    </div>
  );
};

export default GenomeViewer;
