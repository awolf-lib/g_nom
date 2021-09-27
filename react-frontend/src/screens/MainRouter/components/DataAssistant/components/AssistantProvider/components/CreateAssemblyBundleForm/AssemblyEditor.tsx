import { useState } from "react";
import { IPossibleImports } from "../../../../../../../../api";
import { PathEditor } from "./PathEditor";
import { PathSetEditor } from "./PathSetEditor";
import Tabs from "./Tabs";
import { IAssembly } from "./_interfaces";

export function AssemblyEditor(props: IAssemblyEditorProps) {
    const [selected, setSelected] = useState(0);

    function updateAssembly(update: Partial<IAssembly>){
        props.onChange({
            ...props.assembly,
            ...update
        });
    }

    return (<Tabs selected={selected} onChange={id => setSelected(id)}>
        <div title="Assembly" className="p-4">
            <PathEditor
                path={props.assembly.path}
                onChange={(path) => updateAssembly({path})}
                possibleImports={props.possibleImports.fasta}
            />
        </div>
        <div title="Annotation">
            <PathSetEditor
                value={props.assembly.annotation}
                onChange={(set) => updateAssembly({annotation: set})}
                title="Annotations"
                possibleImports={props.possibleImports.gff}
            />   
        </div>
        <div title="Mapping">
            <PathSetEditor
                value={props.assembly.mapping}
                onChange={(set) => updateAssembly({mapping: set})}
                title="Mapping"
                possibleImports={props.possibleImports.bam}
            />
        </div>
        <div title="Analysis">
            <PathSetEditor
                value={props.assembly.analysis}
                onChange={(set) => updateAssembly({analysis: set})}
                title="Analysis"
                possibleImports={props.possibleImports.analysis}
            />
        </div>
    </Tabs>)
}

export interface IAssemblyEditorProps{
    assembly: IAssembly;
    possibleImports: IPossibleImports;
    onChange: (assembly: IAssembly) => void;
}