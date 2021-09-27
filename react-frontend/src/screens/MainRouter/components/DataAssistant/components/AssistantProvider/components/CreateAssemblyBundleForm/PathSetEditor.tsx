import classNames from "classnames";
import { Add, Close } from "grommet-icons";
import { ChangeEvent, useState } from "react";
import Button from "../../../../../../../../components/Button";
import Input from "../../../../../../../../components/Input";
import { PathEditor } from "./PathEditor";
import { IPathSet } from "./_interfaces";

export function PathSetEditor(props: IPathSetEditorProps){
    const [draftName, setDraftName] = useState("");

    function updateName(set: IPathSet, name: string){
        props.onChange({
            ...set,
            name
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
            <PathEditor
                path={set.path}
                onChange={path => props.onChange({...set, path})}
                possibleImports={props.possibleImports}
            />
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