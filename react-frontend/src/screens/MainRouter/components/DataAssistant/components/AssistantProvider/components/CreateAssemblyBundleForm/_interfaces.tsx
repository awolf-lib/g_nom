export interface IPath{
    path: string;
    additionalFilesPath: string | null;
}

export interface IPathSet{
    name: string;
    path: IPath | null;
}

export interface IAssembly{
    assemblyId: number | null; // if exists already uploaded
    name: string;
    path: IPath | null;
    annotation:IPathSet | null;
    mapping: IPathSet | null;
    analysis: IPathSet | null;
}