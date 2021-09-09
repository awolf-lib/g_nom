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

    function setNameForSelectedAssemblySet(name: string, key: AssemblyKeys){
        if(selected !== null){
            setAssemblies({
                ...assemblies,
                [key]: {
                    ...assemblies[selected][key],
                    name
                }
            });
        }
    }

    function toggleInSelectedAssembly(path: IPath | null, key: AssemblyKeys){
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
                    assembly.analysis.path !== null ? api.addNewAnalysis(assembly.taxonId,
                        assembly.analysis.name,
                        assembly.analysis.path.path,
                        1,
                        assembly.analysis.path.additionalFilesPath || ''
                    ) : null
                ].filter(x => x)))
            ) : null
        }).filter(x => x);
        forkJoin($uploads).subscribe(_ => {
            //clear assemblies
        });
    }

    return (<div className="flex">
        <ul className="flex-2">
            {
                assemblies.map((assembly, idx) => {
                    return (<li className={assemblyClassName(idx)} onClick={() => setSelected(idx)} key={`assembly_${idx}`}>
                        <div className="flex items-center">
                            <span>{assembly.taxonId}</span>
                            {/* files */}
                            {/* <div className="w-64 font-semibold">New assembly name:</div>
                            <Input
                            placeholder="max. 400 characters"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAssemblyName(e.target.value)}
                            /> */}
                        </div>
                    </li>)
                })
            }
            <li className="mt-4 animate-grow-y shadow p-4 rounded-lg w-64" key="draft">
                <Input type="number" placeholder="taxonId" value={[`${draft.taxonId}`]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft({...draft, taxonId: parseInt(e.target.value)})}></Input>
                
                <div className="mt-4">
                    <Button onClick={() => addDraftAssembly()}>Add additional Assembly</Button>
                </div>
            </li>
        </ul>
        <span>{selected}</span>
        { selected !== null ? (
        <div className="flex-1 grid gap-4 md:grid-cols-2">
            <div>
                <h4>Annotations</h4>
                {<ul>
                    {Object.entries(possibleImports.fasta).map(([k,v]) => v.map(vs => (<PathSelector
                        value={assemblies[selected].assembly.path}
                        pathArray={vs}
                        onSelect={p => toggleInSelectedAssembly(p, 'assembly')}
                    />)))}
                </ul>}
            </div>
            <div>
                <h4>Annotations</h4>
                {<ul>
                    {Object.entries(possibleImports.gff).map(([k,v]) => v.map(vs => (<PathSelector
                        value={assemblies[selected].annotation.path}
                        pathArray={vs}
                        onSelect={p => toggleInSelectedAssembly(p, 'annotation')}
                    />)))}
                </ul>}
            </div>
            <div>
                <h4>Mapping</h4>
                {<ul>
                    {Object.entries(possibleImports.bam).map(([k,v]) => v.map(vs => (<PathSelector
                        value={assemblies[selected].mapping.path}
                        pathArray={vs}
                        onSelect={p => toggleInSelectedAssembly(p, 'mapping')}
                    />)))}
                </ul>}
            </div>
            <div>
                <h4>Analysis</h4>
                {<ul>
                    {Object.entries(possibleImports.analysis).map(([k,v]) => v.map(vs => (<PathSelector
                        value={assemblies[selected].analysis.path}
                        pathArray={vs}
                        onSelect={p => toggleInSelectedAssembly(p, 'analysis')}
                    />)))}
                </ul>}
            </div>
        </div>
        )  : null}
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
