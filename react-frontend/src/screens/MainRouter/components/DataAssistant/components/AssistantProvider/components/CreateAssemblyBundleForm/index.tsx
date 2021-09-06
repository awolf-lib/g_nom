import { ChangeEvent, useState } from "react";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";

export function CreateAssemblyBundleForm(props: ICreateAssemblyProps): JSX.Element {
    const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
    const [draft, setDraft] = useState(defaultAssembly());
    const [selected, setSelected] = useState<number | null>(null);
    
    function addDraftAssembly(){
        if(draft.name || draft.taxonId) {
            setAssemblies([...assemblies, draft]);
            setDraft(defaultAssembly());
        }
    }

    function defaultAssembly(): IAssembly {
        return {
            taxonId: 0,
            name: ""
        }
    }

    return (<div className="flex">
        <ul className="flex-2">
            {
                assemblies.map((assembly, idx) => {
                    return (<li className="mt-4 animate-grow-y shadow p-4 rounded-lg w-64" onClick={() => setSelected(idx)}>
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

        </div>
    </div>);
}

export default CreateAssemblyBundleForm;

CreateAssemblyBundleForm.defaultProps = {}

export type ICreateAssemblyProps = {}

interface IAssembly{
    taxonId: number;
    name: string;
}

