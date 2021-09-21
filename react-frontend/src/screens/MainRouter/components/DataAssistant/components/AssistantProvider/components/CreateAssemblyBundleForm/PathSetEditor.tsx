import classNames from "classnames";
import { Add, Close } from "grommet-icons";
import { ChangeEvent, useState } from "react";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { PathSelector } from "./PathSelector";
import { IPath, IPathSet } from "./_interfaces";

export function PathSetEditor(props: IPathSetEditorProps){
    const [draftName, setDraftName] = useState("");

    function updateName(set: IPathSet, name: string){
        props.onChange({
            ...set,
            name
        });
    }

    function togglePathInSelected(set: IPathSet, path: IPath | null) {
        props.onChange({
            ...set,
            path
        });
    }

    function addNewSet() {
        if(draftName !== '') {
            props.onChange({
                name: draftName,
                path: null
            });
            setDraftName("");
        }
    }

    function getClassNames() {
        return classNames(
            "h-full flex justify-center items-center shadow rounded-lg p-4",
            {"bg-green-100": props.value && props.value.name.length > 0 && props.value.path !== null}
        );
    }

    function renderSet(set: IPathSet): JSX.Element {
        return (<div className="flex-grow space-y-4">
            <div className="flex items-center space-x-4">
                <h3 className="font-bold">{props.title}:</h3>
                <Input value={[set.name]} onChange={(e: ChangeEvent<HTMLInputElement>) => updateName(set, e.target.value)}></Input>
                <div>
                    <Button color="cancel" onClick={() => props.onChange(null)}>
                        <div className="flex items-center space-x-2">
                            <Close color="white"/>
                            <span>Remove</span>
                        </div>
                    </Button>
                </div>
            </div>
            <div className="flex flex-col">
                <span><span className="font-bold">main path:</span> {set.path === null ? (<span className="italic">None</span>): set.path.path}</span>
                <span><span className="font-bold">additional:</span> {set.path?.additionalFilesPath !== null ? `./${set.path?.additionalFilesPath}/*` : (<span className="italic">None</span>)}</span>
            </div>
            {<ul className="h-40 overflow-y-auto border rounded-lg border-gray-300 px-3 py-2 bg-white">
                {Object.entries(props.possibleImports).map(([k,v], idx) => (<ul><li className="font-bold" key={`fasta_${idx}`}>{k}</li>{v.map(vs => (<PathSelector
                    value={set.path}
                    pathArray={vs}
                    onSelect={p => togglePathInSelected(set, p)}
                />))}</ul>))}
            </ul>}
        </div>);
    }

    function renderEmpty(): JSX.Element {
        return (<div className="font-bold flex items-center flex-row space-x-4">
            <Input placeholder={props.title} value={[draftName]} onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value)} />
            <Button onClick={() => addNewSet()} disabled={draftName.length === 0}><Add color="white"/><span> Add</span></Button>
        </div>);
    }

    return (<div className={getClassNames()}>
        {props.value !== null ? renderSet(props.value) : renderEmpty()}
    </div>);
}

export interface IPathSetEditorProps{
    title: string;
    value: IPathSet | null;
    possibleImports: {[key: string]: string[][]};
    onChange: (set: IPathSet | null) => void;
}