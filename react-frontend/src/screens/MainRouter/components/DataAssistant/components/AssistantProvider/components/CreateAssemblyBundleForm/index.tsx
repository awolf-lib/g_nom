import { ChangeEvent, useEffect, useState } from "react";
import { forkJoin } from "rxjs";
import { switchMap } from "rxjs/operators";
import API, { IPossibleImports } from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { IPath, PathSelector } from "./PathSelector";

export function CreateAssemblyBundleForm(props: ICreateAssemblyProps): JSX.Element {
    const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
    const [draft, setDraft] = useState(defaultAssembly());
    const [selected, setSelected] = useState<number | null>(null);
    const [possibleImports, setPossibleImports] = useState<IPossibleImports>({fasta: {}, gff: {}, bam: {}, analysis: {}});
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        loadFiles(["image", "fasta", "gff", "bam", "analysis"]);
    }, []);
    
    const api = new API();

    function addDraftAssembly(){
        if(draft.taxonId) {
            const copyDraft = {...draft};
            setDraft(defaultAssembly());
            setAssemblies([...assemblies, copyDraft]);
            setSelected(assemblies.length);
        }
    }

    function defaultAssembly(): IAssembly {
        return {
            taxonId: 0,
            assembly: {name:'', path: null},
            annotation: {name:'', path: null},
            mapping: {name:'', path: null},
            analysis: {name:'', path: null},
        }
    }

    async function loadFiles(types: ("image"|"fasta"|"gff"|"bam"|"analysis")[] | undefined = undefined) {
        setFetching(true);
        const response = await api.fetchPossibleImports(types);
        if (response && response.payload) {
            setPossibleImports(response.payload);
        }

        if (response && response.notification) {
        //   handleNewNotification(response.notification);
        }
        setFetching(false);
    };

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

    function uploadAssemblies() {
        setSelected(null);
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
        forkJoin($uploads).subscribe(_ => {
            setAssemblies([]);
        });
    }

    return (<div className="flex flex-col space-y-4">
        <div className="flex space-x-4">
            <ul className="flex-2 space-y-4">
                {assemblies.map((assembly, idx) => {
                    return (<li className={assemblyClassName(idx)} onClick={() => setSelected(idx)} key={`assembly_${idx}`}>
                        <div className="flex items-center">
                            <span>{assembly.taxonId}</span>
                        </div>
                    </li>)
                })}
                <li className="animate-grow-y shadow p-4 rounded-lg w-64 space-y-4" key="draft">
                    <Input type="number" placeholder="taxonId" value={[`${draft.taxonId}`]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft({...draft, taxonId: parseInt(e.target.value)})}></Input>
                    
                    <div>
                        <Button onClick={() => addDraftAssembly()}>Add additional Assembly</Button>
                    </div>
                </li>
            </ul>
            { selected !== null ? (
            <div className="flex-1 grid gap-4 md:grid-cols-2">
                <div>
                    <div className="flex items-center space-x-4">
                        <h3 className="font-bold">Assembly:</h3>
                        <Input value={[assemblies[selected].assembly.name]} onChange={(e: ChangeEvent<HTMLInputElement>) => setNameForSelected(e.target.value, 'assembly')}></Input>
                    </div>
                    {<ul>
                        {Object.entries(possibleImports.fasta).map(([k,v]) => v.map(vs => (<PathSelector
                            value={assemblies[selected].assembly.path}
                            pathArray={vs}
                            onSelect={p => togglePathInSelected(p, 'assembly')}
                        />)))}
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
        <div className="flex content-end">
            <div className="max-w-sm">
                <Button onClick={() => uploadAssemblies()} size="200">Process</Button>
            </div>
        </div>
    </div>);
}

export default CreateAssemblyBundleForm;

CreateAssemblyBundleForm.defaultProps = {}

export type ICreateAssemblyProps = {}

interface IAssembly{
    taxonId: number;
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
