import { Trash } from "grommet-icons";
import { ChangeEvent, useState } from "react";
import { IPossibleImports } from "../../../../../../../../api";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { AssemblyEditor } from "./AssemblyEditor";
import { IAssembly } from "./_interfaces";

export function AssembliesEditor(props: AssembliesEditorProps){
    const [draftName, setDraftName] = useState("");
    const [selected, setSelected] = useState<number | null>(null);

    function setAssemblyName(idx: number, name: string) {
        props.onChange([...props.assemblies.map((a, i) =>
            i === idx ? {...a, name} : a
        )]);
    }

    return (<div className="flex flex-row space-x-4">
        <div className="space-y-4">
            {props.assemblies.map((assembly, idx) => <div className="p-4 shadow hover:bg-gray-200 rounded-lg" onClick={() => setSelected(idx)}>
                {assembly.assemblyId !== null ?
                    (<div className="flex items-center justify-between space-x-2"><span>{assembly.name}</span></div>):
                    (<div className="flex items-center justify-between space-x-2">
                        <Input
                            placeholder="AssemblyName"
                            value={[assembly.name]}
                            onChange={e => setAssemblyName(idx, e.target.value)}
                        />
                        <button
                            onClick={() => {
                                setSelected(null);
                                props.onChange(props.assemblies.filter((_,i) => i !== idx))
                            }}
                            title="remove taxon data bundle"
                        >
                            <Trash color="red" className="stroke-current" />
                        </button>
                    </div>)
                }
            </div>)}
            <div className="space-y-4 shadow p-4 rounded-lg">
                <Input
                    placeholder="AssemblyName"
                    value={[draftName]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value)}
                />
                <Button
                    onClick={() => {
                        props.onChange([...props.assemblies, {
                            assemblyId: null,
                            name: draftName,
                            path: null,
                            analysis: null,
                            annotation: null,
                            mapping: null,
                        }]);
                        setDraftName("");
                    }}
                    disabled={draftName.length === 0}
                >Add Assembly</Button>
            </div>
        </div>
        <div className="flex-grow">{ selected !== null ?
            <AssemblyEditor
                assembly={props.assemblies[selected]}
                onChange={(assembly) => props.onChange(props.assemblies.map((a,i) => selected === i ? assembly : a))}
                possibleImports={props.possibleImports}
            ></AssemblyEditor> :
            null
        }</div>
    </div>)
}

export interface AssembliesEditorProps{
    assemblies: ReadonlyArray<Readonly<IAssembly>>,
    possibleImports: IPossibleImports;
    onChange: (assemblies: ReadonlyArray<IAssembly>) => void
}