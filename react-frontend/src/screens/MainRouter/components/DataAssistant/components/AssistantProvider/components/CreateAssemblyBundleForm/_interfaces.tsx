export interface IPath{
    path: string;
    additionalFilesPath: string | null;
}

export interface IPathSet{
    name: string;
    path: IPath | null;
}
