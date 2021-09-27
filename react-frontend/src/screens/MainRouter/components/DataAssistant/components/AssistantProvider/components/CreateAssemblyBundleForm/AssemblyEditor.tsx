import { useState } from "react";
import { IPossibleImports } from "../../../../../../../../api";
import { PathSetEditor } from "./PathSetEditor";
import Tabs from "./Tabs";
import { IAssembly } from "./_interfaces";

export function AssemblyEditor(props: IAssemblyEditorProps) {
    const [selected, setSelected] = useState(0);

    function update(update: Partial<IAssembly>){
        props.onChange({
            ...props.assembly,
            ...update
        });
    }

    return (<Tabs selected={selected} onChange={id => setSelected(id)}>
        {/* {<PathSetEditor value={props.assembly} onChange={(set) => update(set, 'assembly')} title="Assembly" possibleImports={possibleImports.fasta} />} */}
        <div title="Annotation">
            <PathSetEditor
                value={props.assembly.annotation}
                onChange={(set) => update({annotation: set})}
                title="Annotations"
                possibleImports={props.possibleImports.gff}
            />   
        </div>
        <div title="Mapping">
            <PathSetEditor
                value={props.assembly.mapping}
                onChange={(set) => update({mapping: set})}
                title="Mapping"
                possibleImports={props.possibleImports.bam}
            />
        </div>
        <div title="Analysis">
            <PathSetEditor
                value={props.assembly.analysis}
                onChange={(set) => update({analysis: set})}
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