import { createViewState, JBrowseLinearGenomeView } from "@jbrowse/react-linear-genome-view";
import "@fontsource/roboto";
import { useEffect, useState } from "react";
import { Expand } from "grommet-icons";
import { AssemblyInterface } from "../../../../../../tsInterfaces/tsInterfaces";
import { IAnnotation, IMapping } from "../../../../../../api";

const GenomeViewer = ({
  assemblyDetails,
  annotations,
  mappings,
  location = "",
}: {
  assemblyDetails: AssemblyInterface;
  annotations: IAnnotation[];
  mappings: IMapping[];
  location?: string;
}) => {
  const [assembly, setAssembly] = useState<any>({});
  const [tracks, setTracks] = useState<any[]>([]);
  const [defaultSession, setDefaultSession] = useState<any>({});
  const [configuration, setConfiguration] = useState<any>({});
  const [aggregateTextSearchAdapters, setAggregateTextSearchAdapters] = useState<any[]>([]);

  const [locationState, setLocationState] = useState<string>("");

  useEffect(() => {
    setLocationState(location);
  }, [location]);

  useEffect(() => {
    setAssembly({
      name: assemblyDetails.name,
      active: true,
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

    setTracks([...annotationsTracks, ...mappingTracks]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, mappings]);

  useEffect(() => {
    const annotationsTracks = annotations.map((annotation) => {
      return {
        type: "FeatureTrack",
        configuration: "track_annotation_" + annotation.id,
        displays: [
          {
            type: "LinearBasicDisplay",
            height: 150,
            configuration: "track_annotation_" + annotation.id + "-LinearBasicDisplay",
          },
        ],
      };
    });
    setDefaultSession({
      name: "My session",
      view: {
        id: "linearGenomeView",
        type: "LinearGenomeView",
        tracks: [
          {
            type: "ReferenceSequenceTrack",
            configuration: assemblyDetails.name + "-ReferenceSequenceTrack",
            displays: [
              {
                type: "LinearReferenceSequenceDisplay",
                height: 140,
                configuration:
                  assemblyDetails.name + "-ReferenceSequenceTrack-LinearReferenceSequenceDisplay",
              },
            ],
          },
          ...annotationsTracks,
        ],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assemblyDetails]);

  useEffect(() => {
    setConfiguration({
      theme: {
        palette: {
          primary: {
            main: "#3b82f6",
          },
          secondary: {
            main: "#464957",
          },
          tertiary: {
            main: "#c7d2fe",
          },
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assemblyDetails]);

  useEffect(() => {
    setAggregateTextSearchAdapters([
      {
        type: "TrixTextSearchAdapter",
        textSearchAdapterId: "text_search_adapter_annotation_" + assemblyDetails.id,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assemblyDetails]);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight - 800);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSession.name, locationState]);

  return (
    <div className="relative -mx-1">
      {assemblyDetails?.id && defaultSession.name && configuration.theme && (
        <JBrowseLinearGenomeView
          viewState={createViewState({
            assembly: assembly,
            tracks: tracks,
            configuration: configuration,
            defaultSession: defaultSession,
            location: locationState,
            aggregateTextSearchAdapters: aggregateTextSearchAdapters,
          })}
        />
      )}
      <a
        className="absolute bottom-0 right-0 mx-6 my-4 opacity-25 hover:opacity-100 text-gray-600 cursor-pointer z-50"
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
