import classNames from "classnames";
import { IPath } from "./_interfaces";

export function PathSelector(props: IPathSelectorProps){

    const getDirectoryClass = (index: number, pathArray: string[]) => {
        const baseClasses = "hover:text-blue-600 cursor-pointer";
        const currentFile = filePath(pathArray, index);
        if(props.value !== null) {
            return classNames(baseClasses, {
                "text-blue-600 font-bold":
                  index === pathArray.length - 1 && props.value.path === currentFile.path,
                "text-green-600 font-semibold":
                  props.value.additionalFilesPath !== null && index >= props.value.additionalFilesPath.length-1 && props.value.path === currentFile.path
              })
        } else {
            return baseClasses
        }
    }

    const filePath = (path: string[], idx: number): IPath => ({
        path: `./${path.join('/')}`,
        additionalFilesPath: idx === path.length-1 ? null : path.slice(0, idx+1)
    });

    const select = (path: string[], idx: number) => {
        const next_path_set = filePath(path, idx);
        if(
          props.value &&
          props.value.additionalFilesPath === next_path_set.additionalFilesPath && 
          props.value.path === next_path_set.path
        ){
          props.onSelect(null);
        } else {
          props.onSelect(next_path_set);
        }
    }

    return <div className="ml-4">{props.pathArray.length}
    {props.pathArray.map((dir, dirIndex, path) => {
      return (
        <span
          onClick={() => select(path, dirIndex)}
          key={`${dir}_${dirIndex}`}
          className={getDirectoryClass(
            dirIndex,
            props.pathArray
          )}
        >
          /{dir}
        </span>
      );
    })}
  </div>
}

interface IPathSelectorProps{
    value: IPath | null;
    pathArray: string[];
    onSelect: (path: IPath | null) => void;
}

