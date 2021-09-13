import { Trash } from "grommet-icons";
import { ChangeEvent, useEffect, useState } from "react";
import { forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import API, { INotification, IPossibleImports } from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import LoadingSpinner from "../../../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../../../components/NotificationProvider";
import { IPath, PathSelector } from "./PathSelector";

export function CreateAssemblyBundleForm(props: ICreateAssemblyProps): JSX.Element {
    const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
    const [draftTaxonId, setDraftTaxonId] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [possibleImports, setPossibleImports] = useState<IPossibleImports>({fasta: {}, gff: {}, bam: {}, analysis: {}});
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const api = new API();
        async function loadFiles(types: ("image"|"fasta"|"gff"|"bam"|"analysis")[] | undefined = undefined) {
            setFetching(true);
            const response = await api.fetchPossibleImports(types);
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
    
    const api = new API();

    const Dispatch: (n: INotification) => void = useNotification();

    function handleNewNotification(notification: INotification){
        Dispatch(notification);
    }

    function addDraftAssembly(){
        setFetching(true);
        from(api.fetchTaxonByNCBITaxonID(draftTaxonId)).subscribe(next => {
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
            assembly: {name:'', path: null},
            annotation: {name:'', path: null},
            mapping: {name:'', path: null},
            analysis: {name:'', path: null},
        }
    }

    function assemblyClassName(assemblyIdx: number): string {
        return selected === assemblyIdx ?
            "mt-4 animate-grow-y shadow p-4 rounded-lg w-64 bg-green-200" :
            "mt-4 animate-grow-y shadow p-4 rounded-lg w-64";
    }

    function setNameForSelected(name: string, key: AssemblyKeys){
        if(selected !== null){
            const assems = [...assemblies];
            assems.splice(selected, 1, {
                ...assemblies[selected],
                [key]: {
                    ...assemblies[selected][key],
                    name
                }
            });
            setAssemblies(assems);
        }
    }

    function togglePathInSelected(path: IPath | null, key: AssemblyKeys){
        if(selected !== null) {
            const assems = [...assemblies];
            assems.splice(selected, 1, {
                ...assemblies[selected],
                [key]: {
                    ...assemblies[selected][key],
                    path
                }
            });
            setAssemblies(assems);
        }
    }

    function allAssembliesValid(): boolean {
        return assemblies.every(a =>
            (a.analysis.name.length > 0 && a.analysis.path !== null) ||
            (a.assembly.name.length > 0 && a.assembly.path !== null) ||
            (a.mapping.name.length > 0 && a.mapping.path !== null) ||
            (a.annotation.name.length > 0 && a.annotation.path !== null)
        )
    }

    function uploadAssemblies() {
        setSelected(null);
        setFetching(true);
        const $uploads = assemblies.map(assembly => {
            return assembly.assembly.path !== null ? api.addNewAssembly(
                assembly.taxonId,
                assembly.assembly.name,
                assembly.assembly.path,
                1
            ).pipe(
                switchMap(_ => forkJoin([
                    assembly.annotation.path !== null ? api.addNewAnnotation(
                        assembly.taxonId,
                        assembly.annotation.name,
                        assembly.annotation.path.path,
                        1,
                        assembly.annotation.path.additionalFilesPath || ''
                    ) : null,
                    assembly.mapping.path !== null ? api.addNewMapping(
                        assembly.taxonId,
                        assembly.mapping.name,
                        assembly.mapping.path.path,
                        1,
                        assembly.mapping.path.additionalFilesPath || ''
                    ) : null,
                    assembly.analysis.path !== null ? api.addNewAnalysis(
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

    return (<div className="flex flex-col space-y-4">
        <div className="flex space-x-4 relative">
            { fetching ? <div className="absolute bottom-0 left-0 top-0 right-0 bg-gray-100 opacity-50 flex content-center justify-center">
                <LoadingSpinner label="Fetching..." />
            </div> : null}
            <ul className="flex-2 space-y-4">
                {assemblies.map((assembly, idx) => {
                    return (<li className={assemblyClassName(idx)} onClick={() => setSelected(idx)} key={`assembly_${idx}`}>
                        <div className="flex items-center justify-between">
                            <span>{assembly.title} ({assembly.taxonId})</span>
                            <button onClick={() => removeAssembly(idx)} title="Remove Assembly">
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
                <div>
                    <div className="flex items-center space-x-4">
                        <h3 className="font-bold">Assembly:</h3>
                        <Input value={[assemblies[selected].assembly.name]} onChange={(e: ChangeEvent<HTMLInputElement>) => setNameForSelected(e.target.value, 'assembly')}></Input>
                    </div>
                    {<ul>
                        {Object.entries(possibleImports.fasta).map(([k,v]) => (<ul><li className="font-bold">{k}</li>{v.map(vs => (<PathSelector
                            value={assemblies[selected].assembly.path}
                            pathArray={vs}
                            onSelect={p => togglePathInSelected(p, 'assembly')}
                        />))}</ul>))}
                    </ul>}
                </div>
                <div>
                    <div className="flex items-center space-x-4">
                        <h3 className="font-bold">Annotations:</h3>
                        <Input value={[assemblies[selected].annotation.name]} onChange={(e: ChangeEvent<HTMLInputElement>) => setNameForSelected(e.target.value, 'annotation')}></Input>
                    </div>
                    {<ul>
                        {Object.entries(possibleImports.gff).map(([k,v]) => v.map(vs => (<PathSelector
                            value={assemblies[selected].annotation.path}
                            pathArray={vs}
                            onSelect={p => togglePathInSelected(p, 'annotation')}
                        />)))}
                    </ul>}
                </div>
                <div>
                    <div className="flex items-center space-x-4">
                        <h3 className="font-bold">Mapping:</h3>
                        <Input 
                            value={[assemblies[selected].mapping.name]}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNameForSelected(e.target.value, 'mapping')}
                        ></Input>
                    </div>
                    {<ul>
                        {Object.entries(possibleImports.bam).map(([k,v]) => v.map(vs => (<PathSelector
                            value={assemblies[selected].mapping.path}
                            pathArray={vs}
                            onSelect={p => togglePathInSelected(p, 'mapping')}
                        />)))}
                    </ul>}
                </div>
                <div>
                    <div className="flex items-center space-x-4">
                        <h3 className="font-bold">Analysis:</h3>
                        <Input 
                            value={[assemblies[selected].analysis.name]}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNameForSelected(e.target.value, 'analysis')}
                        ></Input>
                    </div>
                    {<ul>
                        {Object.entries(possibleImports.analysis).map(([k,v]) => v.map(vs => (<PathSelector
                            value={assemblies[selected].analysis.path}
                            pathArray={vs}
                            onSelect={p => togglePathInSelected(p, 'analysis')}
                        />)))}
                    </ul>}
                </div>
            </div>
            )  : null}
        </div>
        <div className="flex justify-end">
            <div className="max-w-sm">
                <Button onClick={() => uploadAssemblies()} size="md" disabled={!allAssembliesValid()}>Process</Button>
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
    assembly: IPathSet;
    annotation:IPathSet;
    mapping: IPathSet;
    analysis: IPathSet;
}

type AssemblyKeys = 'assembly' | 'annotation' | 'mapping' | 'analysis';

interface IPathSet{
    name: string;
    path: IPath | null;
}
