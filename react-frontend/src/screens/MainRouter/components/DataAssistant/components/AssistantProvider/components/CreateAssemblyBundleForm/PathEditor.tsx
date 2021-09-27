import { PathSelector } from "./PathSelector";
import { IPath } from "./_interfaces";

export function PathEditor(props: IPathEditorProps){
    return <div className="space-y-4">
        <div className="flex flex-col">
            <span><span className="font-bold">main path:</span> {props.path === null ? (<span className="italic">None</span>): props.path.path}</span>
            <span><span className="font-bold">additional:</span> {props.path?.additionalFilesPath !== null ? `./${props.path?.additionalFilesPath}/*` : (<span className="italic">None</span>)}</span>
        </div>
        {<ul className="h-40 overflow-y-auto border rounded-lg border-gray-300 px-3 py-2 bg-white">
            {Object.entries(props.possibleImports).map(([k,v], idx) => (<ul><li className="font-bold" key={`fasta_${idx}`}>{k}</li>{v.map(vs => (<PathSelector
                value={props.path}
                pathArray={vs}
                onSelect={p => props.onChange(p)}
            />))}</ul>))}
        </ul>}
    </div>
}

export interface IPathEditorProps{
    path: IPath | null;
    onChange: (path: IPath | null) => void;
    possibleImports: {[key: string]: string[][]};
}