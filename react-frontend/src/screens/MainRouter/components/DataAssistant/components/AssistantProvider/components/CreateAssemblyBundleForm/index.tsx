import classNames from "classnames";
import { Trash } from "grommet-icons";
import { ChangeEvent, useEffect, useState } from "react";
import { forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { addNewAnalysis, addNewAnnotation, addNewAssembly, addNewMapping, fetchPossibleImports, fetchTaxonByNCBITaxonID, INotification, IPossibleImports } from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import { PathSetEditor } from "./PathSetEditor";
import { IPathSet } from "./_interfaces";

export function CreateAssemblyBundleForm(props: ICreateAssemblyProps): JSX.Element {
    const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
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

    const Dispatch: (n: INotification) => void = useNotification();

    function handleNewNotification(notification: INotification){
        Dispatch(notification);
    }

    function addDraftAssembly(){
        setFetching(true);
        from(fetchTaxonByNCBITaxonID(draftTaxonId)).subscribe(next => {
            if(next?.payload?.length > 0){
                setAssemblies([...assemblies, defaultAssembly(draftTaxonId, next.payload[0].scientificName)]);
                setSelected(assemblies.length-1);
                setDraftTaxonId(0);
            } else {
                handleNewNotification(next.notification);
            }
            setFetching(false);
        });
    }

    function defaultAssembly(taxonId: number, title: string): IAssembly {
        return {
            taxonId,
            title,
            assembly: null,
            annotation: null,
            mapping: null,
            analysis: null,
        }
    }

    function assemblyClassName(assemblyIdx: number): string {
        return classNames("animate-grow-y shadow p-4 rounded-lg w-64 cursor-pointer", {
            "bg-green-200": selected === assemblyIdx
        });
    }

    function updatePathSet(set: IPathSet | null, key: AssemblyKeys){
        if(selected !== null){
            const assems = [...assemblies];
            assems.splice(selected, 1, {
                ...assemblies[selected],
                [key]: set
            });
            setAssemblies(assems);
        }
    }

    function allAssembliesValid(): boolean {
        return assemblies.every(a =>
            (a.analysis !== null && (a.analysis.name.length > 0 && a.analysis.path !== null)) ||
            (a.assembly !== null && (a.assembly.name.length > 0 && a.assembly.path !== null)) ||
            (a.mapping !== null && (a.mapping.name.length > 0 && a.mapping.path !== null)) ||
            (a.annotation !== null && (a.annotation.name.length > 0 && a.annotation.path !== null))
        )
    }

    function uploadAssemblies() {
        setSelected(null);
        setFetching(true);
        const $uploads = assemblies.map(assembly => {
            return assembly.assembly !== null && assembly.assembly.path !== null ? addNewAssembly(
                assembly.taxonId,
                assembly.assembly.name,
                assembly.assembly.path,
                1
            ).pipe(
                switchMap(_ => forkJoin([
                    assembly.annotation !== null && assembly.annotation.path !== null ? addNewAnnotation(
                        assembly.taxonId,
                        assembly.annotation.name,
                        assembly.annotation.path.path,
                        1,
                        assembly.annotation.path.additionalFilesPath || ''
                    ) : null,
                    assembly.mapping !== null && assembly.mapping.path !== null ? addNewMapping(
                        assembly.taxonId,
                        assembly.mapping.name,
                        assembly.mapping.path.path,
                        1,
                        assembly.mapping.path.additionalFilesPath || ''
                    ) : null,
                    assembly.analysis !== null && assembly.analysis.path !== null ? addNewAnalysis(
                        assembly.taxonId,
                        assembly.analysis.name,
                        assembly.analysis.path.path,
                        1,
                        assembly.analysis.path.additionalFilesPath || ''
                    ) : null
                ].filter(x => x)))
            ) : null
        }).filter(x => x);
        forkJoin($uploads).subscribe({next: _ => {
            setAssemblies([]);
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
        setAssemblies(assemblies.filter((_, i) => idx !== i))
    }

    return (<div className="relative">
        { fetching ? <div className="absolute bottom-0 left-0 top-0 right-0 bg-gray-100 opacity-50 flex content-center justify-center">
            <LoadingSpinner label="Fetching..." />
        </div> : null}
        <div className="flex flex-col space-y-4">
            <div className="flex space-x-4 relative">
                <ul className="flex-2 space-y-4">
                    {assemblies.map((assembly, idx) => {
                        return (<li className={assemblyClassName(idx)} onClick={() => setSelected(idx)} key={`assembly_${idx}`}>
                            <div className="flex items-center justify-between space-x-2" title={`${assembly.title} (${assembly.taxonId})`}>
                                <span className="truncate">{assembly.title}</span>
                                <span>({assembly.taxonId})</span>
                                <button onClick={() => removeAssembly(idx)} title="remove taxon data bundle">
                                    <Trash color="red" className="stroke-current" />
                                </button>
                            </div>
                        </li>)
                    })}
                    <li className="animate-grow-y shadow p-4 rounded-lg w-64 space-y-4" key="draft">
                        <Input type="number" placeholder="taxonId" value={[`${draftTaxonId}`]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftTaxonId(parseInt(e.target.value))}></Input>
                        <div>
                            <Button onClick={() => addDraftAssembly()}>Add additional Assembly</Button>
                        </div>
                    </li>
                </ul>
                { selected !== null && assemblies[selected] ? (
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                    {<PathSetEditor value={assemblies[selected].assembly} onChange={(set) => updatePathSet(set, 'assembly')} title="Assembly" possibleImports={possibleImports.fasta} />}
                    {<PathSetEditor value={assemblies[selected].annotation} onChange={(set) => updatePathSet(set, 'annotation')} title="Annotations" possibleImports={possibleImports.gff} />}
                    {<PathSetEditor value={assemblies[selected].mapping} onChange={(set) => updatePathSet(set, 'mapping')} title="Mapping" possibleImports={possibleImports.bam} />}
                    {<PathSetEditor value={assemblies[selected].analysis} onChange={(set) => updatePathSet(set, 'analysis')} title="Analysis" possibleImports={possibleImports.analysis} />}
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

interface IAssembly{
    taxonId: number;
    title: string;
    assembly: IPathSet | null;
    annotation:IPathSet | null;
    mapping: IPathSet | null;
    analysis: IPathSet | null;
}

type AssemblyKeys = 'assembly' | 'annotation' | 'mapping' | 'analysis';