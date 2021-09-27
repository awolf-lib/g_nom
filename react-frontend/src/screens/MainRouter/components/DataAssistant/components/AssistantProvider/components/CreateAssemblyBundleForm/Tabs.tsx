import classNames from "classnames";

export function Tabs(props: ITabProps){
    function tabHeaderClasses(id: number) {
        return classNames("p-2 pt-1 rounded-t-md hover:bg-gray-400", {
            "bg-gray-300": id === props.selected,
            "bg-gray-200": id !== props.selected,
        });
    }

    return <div>
        <div className="flex flex-row space-x-4 px-4">{props.children.filter(ele => ele !== undefined).map((ele, idx) =>
            <span className={tabHeaderClasses(idx)} onClick={() => props.onChange(idx)}>{props.getTitle(ele as JSX.Element)}</span>
        )}</div>
        <div className="shadow rounded-lg">
            {props.children[props.selected]}
        </div>
    </div>
}

export default Tabs;

Tabs.defaultProps = {
    getTitle: (ele: React.ReactElement<{title: String}> | undefined) => ele?.props.title
}

export interface ITabProps{
    children: (JSX.Element | undefined)[];
    getTitle: (ele: JSX.Element) => String;
    selected: number;
    onChange: (selectedId: number) => void;
}