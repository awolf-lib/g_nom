import { ChangeEvent, useEffect, useState } from "react";
import API from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";

export function CreateAssemblyBundleForm(props: ICreateAssemblyProps): JSX.Element {
    const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
    const [draft, setDraft] = useState(defaultAssembly());
    const [selected, setSelected] = useState<number | null>(null);
    const [possibleImports, setPossibleImports] = useState<{fasta: {[key: string]: string[][]}}>({fasta: {}});
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        loadFiles(["image", "fasta", "gff", "bam", "analysis"]);
    }, []);
    
    const api = new API();

    function addDraftAssembly(){
        if(draft.name || draft.taxonId) {
            setAssemblies([...assemblies, draft]);
            setDraft(defaultAssembly());
        }
    }

    function defaultAssembly(): IAssembly {
        return {
            taxonId: 0,
            name: "",
            files: []
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

    function filesClassName(filePath: string): string {
        if(selected !== null && assemblies[selected].files.some(fp => fp === filePath)) {
            return "text-green-600 font-semibold";
        } else {
            return "";
        }
    }

    function togglePathInSelectedAssembly(filePath: string){
        if(selected !== null) {
            const assems = [...assemblies];
            assems.splice(selected, 1, {
                ...assemblies[selected],
                files: assemblies[selected].files.some(path => filePath === path) ?
                assemblies[selected].files.filter(path => filePath !== path) :
                [...assemblies[selected].files, filePath]
            });
            setAssemblies(assems);
        }
    }

    return (<div className="flex">
        <ul className="flex-2">
            {
                assemblies.map((assembly, idx) => {
                    return (<li className={assemblyClassName(idx)} onClick={() => setSelected(idx)}>
                        <div className="flex items-center">
                            <span>{assembly.name} ({assembly.taxonId})</span>
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
            <li className="mt-4 animate-grow-y shadow p-4 rounded-lg w-64">
                <Input type="number" placeholder="taxonId" value={[`${draft.taxonId}`]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft({...draft, taxonId: parseInt(e.target.value)})}></Input>
                <Input placeholder="assembly name" value={[draft.name]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft({...draft, name: e.target.value})}></Input>
                <Button onClick={() => addDraftAssembly()}>Add additional Assembly</Button>
            </li>
        </ul>
        <div className="flex-1">
            Files - tree with checkmarks:
            {<ul>
                {Object.entries(possibleImports.fasta).map(([k, v]) =>
                    v.map(vs => <li onClick={() => togglePathInSelectedAssembly(vs.join('/'))} className={filesClassName(vs.join('/'))}>{vs.join('/')}</li>)
                )}
            </ul>}
        </div>
    </div>);
}

export default CreateAssemblyBundleForm;

CreateAssemblyBundleForm.defaultProps = {}

export type ICreateAssemblyProps = {}

interface IAssembly{
    taxonId: number;
    name: string;
    files: string[];
}

