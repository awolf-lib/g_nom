import classNames from "classnames";
import { Trash } from "grommet-icons";
import { ChangeEvent, useEffect, useState } from "react";
import { forkJoin, Observable, of } from "rxjs";
import { defaultIfEmpty, map, switchMap } from "rxjs/operators";
import { addNewAnalysis, addNewAnnotation, addNewAssembly, addNewMapping, fetchPossibleImports, fetchTaxonByNCBITaxonID, Notification, IPossibleImports, fetchAssembliesByTaxonID, IAssemblyByTaxon } from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import { AssembliesEditor } from "./AssembliesEditor";
import { IAssembly, IPathSet } from "./_interfaces";

export function CreateAssemblyBundleForm(props: ICreateAssemblyProps): JSX.Element {
    const [taxons, setTaxons] = useState<ITaxon[]>([]);
    const [draftTaxonId, setDraftTaxonId] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [possibleImports, setPossibleImports] = useState<IPossibleImports>({fasta: {}, gff: {}, bam: {}, analysis: {}});
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        async function loadFiles(types: ("image"|"fasta"|"gff"|"bam"|"analysis")[] | undefined = undefined) {
            setFetching(true);
            const response = await fetchPossibleImports(types);
            if (response && response.payload) {
                setPossibleImports(response.payload);
            }
    
            if (response && response.notification) {
                handleNewNotification(response.notification);
            }
            setFetching(false);
        };
        loadFiles(["image", "fasta", "gff", "bam", "analysis"]);
    }, []);

    const Dispatch: (n: Notification) => void = useNotification();

    function handleNewNotification(notification: Notification){
        Dispatch(notification);
    }

    function mapAssemblyPayload(assemblies: IAssemblyByTaxon[]): IAssembly[] {
        return assemblies.map(assembly => ({
            assemblyId: assembly.id,
            name: assembly.name,
            path: {
                path: assembly.path,
                additionalFilesPath: assembly.additionalFilesPath
            },
            analysis: null,
            annotation: null,
            mapping: null
        }));
    }

    function selectAdditionalTaxon(){
        setFetching(true);
        fetchTaxonByNCBITaxonID(draftTaxonId)
            .pipe(switchMap(taxonResponse => 
                fetchAssembliesByTaxonID(
                    taxonResponse.payload[0].id
                ).pipe(map(assemblyResponse => [taxonResponse.payload[0], assemblyResponse.payload] as [typeof taxonResponse.payload[0], typeof assemblyResponse.payload]))
            ))
            .subscribe(([taxonPayload, assembliesPayload]) => {
                const addedAssembly = defaultAssembly(draftTaxonId, taxonPayload.id, taxonPayload.scientificName);
                addedAssembly.assemblies = mapAssemblyPayload(assembliesPayload);
                setTaxons([...taxons, defaultAssembly(draftTaxonId, taxonPayload.id, taxonPayload.scientificName)]);
                setSelected(taxons.length);
                setDraftTaxonId(0);
                setFetching(false);
            });
    }

    function defaultAssembly(ncbiTaxonId: number, taxonId: number, title: string): ITaxon {
        return {
            ncbiTaxonId,
            taxonId,
            title,
            assemblies: [],
        }
    }

    function assemblyClassName(assemblyIdx: number): string {
        return classNames("animate-grow-y shadow p-4 rounded-lg w-64 cursor-pointer", {
            "bg-green-200": selected === assemblyIdx
        });
    }

    function updatePathSet(set: IPathSet | null, key: AssemblyKeys){
        if(selected !== null){
            const assems = [...taxons];
            assems.splice(selected, 1, {
                ...taxons[selected],
                [key]: set
            });
            setTaxons(assems);
        }
    }

    function allAssembliesValid(): boolean {
        return false
        // return taxons.every(a =>
        //     (a.assemblies.every(assembly => assembly !== null && (assembly.name.length > 0 && assembly.path !== null))) ||
        //     (a.analysis !== null && (a.analysis.name.length > 0 && a.analysis.path !== null)) ||
        //     (a.mapping !== null && (a.mapping.name.length > 0 && a.mapping.path !== null)) ||
        //     (a.annotation !== null && (a.annotation.name.length > 0 && a.annotation.path !== null))
        // )
    }

    function checkTaxon(): boolean {
        return false
    }

    function checkAssembly(assemblies: IAssembly[]): boolean {
        return assemblies.every(a => a.name.length > 0 && a.mapping !== null)
    }

    function uploadAssemblies() {
        setSelected(null);
        setFetching(true);

        const mapAssembly = (assemblyId: number | null, assembly: IAssembly) => {
            return assemblyId !== null ? forkJoin([
                assembly.mapping !== null && assembly.mapping.path !== null ?
                    addNewMapping(assemblyId, assembly.mapping.name, assembly.mapping.path.path, 1) :
                    null,
                assembly.analysis !== null && assembly.analysis.path !== null ?
                    addNewAnalysis(assemblyId, assembly.analysis.name, assembly.analysis.path.path, 1) :
                    null,
                assembly.annotation !== null && assembly.annotation.path !== null ?
                    addNewAnnotation(assemblyId, assembly.annotation.name, assembly.annotation.path.path, 1) :
                    null
            ]).pipe(defaultIfEmpty(of(null))) : of(null)
        }

        const uploadAssembly = (taxon: ITaxon, assembly: IAssembly) => {
            return assembly.assemblyId !== null && assembly.path !== null ?
                addNewAssembly(taxon.taxonId, assembly.name, assembly.path, 1).pipe(switchMap(a => mapAssembly(a.payload.assemblyId, assembly))) :
                of(null).pipe(switchMap(a => mapAssembly(assembly.assemblyId, assembly)))
        }

        const $uploads = taxons.reduce<Observable<unknown>[]>((array, taxon) => [
            ...array,
            ...taxon.assemblies.map(assembly =>
                uploadAssembly(taxon, assembly)
            )
        ], []);
        forkJoin($uploads).subscribe({next: _ => {
            setTaxons([]);
        }, error: () => setFetching(false), complete: () => setFetching(false)});
    }

    function removeAssembly(idx: number) {
        if(selected !== null) {
            if(idx > selected) {
                setSelected(selected-1);
            } else if (idx === selected) {
                setSelected(null);
            }
        }
        setTaxons(taxons.filter((_, i) => idx !== i))
    }

    return (<div className="relative">
        { fetching ? <div className="absolute bottom-0 left-0 top-0 right-0 bg-gray-100 opacity-50 flex content-center justify-center">
            <LoadingSpinner label="Fetching..." />
        </div> : null}
        <div className="flex flex-col space-y-4">
            <div className="flex space-x-4 relative">
                <ul className="flex-2 space-y-4">
                    {taxons.map((assembly, idx) => {
                        return (<li className={assemblyClassName(idx)} onClick={() => setSelected(idx)} key={`assembly_${idx}`}>
                            <div className="flex items-center justify-between space-x-2" title={`${assembly.title} (${assembly.ncbiTaxonId})`}>
                                <span className="truncate">{assembly.title}</span>
                                <span>({assembly.ncbiTaxonId})</span>
                                <button onClick={() => removeAssembly(idx)} title="remove taxon data bundle">
                                    <Trash color="red" className="stroke-current" />
                                </button>
                            </div>
                        </li>)
                    })}
                    <li className="animate-grow-y shadow p-4 rounded-lg w-64 space-y-4" key="draft">
                        <Input type="number" placeholder="taxonId" value={[`${draftTaxonId}`]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftTaxonId(parseInt(e.target.value))}></Input>
                        <div>
                            <Button onClick={() => selectAdditionalTaxon()}>Select Taxon</Button>
                        </div>
                    </li>
                </ul>
                { selected !== null && taxons[selected] ? (
                <div className="flex-1">
                    <AssembliesEditor
                        assemblies={taxons[selected].assemblies}
                        onChange={(as) => setTaxons(taxons.map((t, ti) => ti === selected ? ({...t, assemblies: [...as]}) : t))}
                        possibleImports={possibleImports}
                    ></AssembliesEditor>
                </div>
                )  : null}
            </div>
            <div className="flex justify-end">
                <div className="max-w-sm">
                    <Button onClick={() => uploadAssemblies()} size="md" disabled={!allAssembliesValid()}>Process</Button>
                </div>
            </div>
        </div>
    </div>);
}

export default CreateAssemblyBundleForm;

CreateAssemblyBundleForm.defaultProps = {}

export type ICreateAssemblyProps = {}

interface ITaxon{
    ncbiTaxonId: number;
    taxonId: number;
    title: string;
    assemblies: IAssembly[];
}

type AssemblyKeys = 'assembly' | 'annotation' | 'mapping' | 'analysis';