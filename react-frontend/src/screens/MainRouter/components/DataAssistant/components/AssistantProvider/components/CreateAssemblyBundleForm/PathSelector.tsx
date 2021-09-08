import classNames from "classnames";

export function PathSelector(props: IPathSelectorProps){

    const getDirectoryClass = (index: number, pathArray: string[]) => {
        const baseClasses = "hover:text-blue-600 cursor-pointer";
        const currentFile = filePath(pathArray, index);
        if(props.value !== null) {
            return classNames(baseClasses, {
                "text-blue-600 font-bold":
                  index === pathArray.length - 1 && props.value.path === currentFile.path,
                "text-green-600 font-semibold": // TODO probably breaks at paths creater 1
                  index < pathArray.length - 1 && props.value.path === currentFile.path && props.value.additionalFilesPath !== null
              })
        } else {
            return baseClasses
        }
    }

    const filePath = (path: string[], idx: number) => ({
        path: `./${path.join('/')}`,
        additionalFilesPath: idx === path.length-1 ? null : additionFilesFrom(path.slice(0, idx+1))
    });

    const select = (path: string[], idx: number) => {
        const file = path[path.length-1];
        if(file !== props.value?.path) {
            props.onSelect(filePath(path, idx))
        } else {
            props.onSelect(null)
        }
    }

    const additionFilesFrom = (path: string[]): string => `./${path.join('/')}/*`

    return <div className="ml-4">
    {props.pathArray.map((dir, dirIndex, path) => {
      return (
        <span
          onClick={() => select(path, dirIndex)}
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

export interface IPath{
    path: string;
    additionalFilesPath: string | null;
}