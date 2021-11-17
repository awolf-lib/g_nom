import { Observable, of, pipe, UnaryFunction } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, map, switchMap } from "rxjs/operators";

// USER AUTHENTIFCATION
export function login(
  username: string,
  password: string
): Observable<IResponse> {
  return fromFetch(process.env.REACT_APP_API_ADRESS + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  }).pipe(
    switchMap((request) => request.json()),
    catchError((error) => {
      console.error(error);
      return of(error);
    })
  );
}

// ADD NEW USER
export async function addUser(
  username: string,
  password: string,
  role: string
): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/addUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
      role: role,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL USERS ===== //
export async function fetchAllUsers() {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchAllUsers")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE USER BY USER ID ===== //
export async function deleteUserByUserID(userID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/deleteUserByUserID?userID=" + userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE USER ROLE BY USER ID ===== //
export async function updateUserRoleByUserID(userID: number, role: string) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateUserRoleByUserID?userID=" +
      userID +
      "&role=" +
      role
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ASSEMBLIES ===== //
export async function fetchAllAssemblies(
  page = 1,
  range = 10,
  search = "",
  link = "",
  userID = 0
) {
  if (link) {
    return fetch(link)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAllAssemblies?page=" +
      page +
      "&range=" +
      range +
      "&search=" +
      search +
      "&userID=" +
      userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ONE ASSEMBLY ===== //
export async function fetchAssemblyInformationByAssemblyID(
  id: string,
  userID: string
) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssemblyInformationByAssemblyID?id=" +
      id +
      "&userID=" +
      userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH POSSIBLE IMPORT IN IMPORT DIRECTORY ===== //
export async function fetchPossibleImports(
  types:
    | ("image" | "fasta" | "gff" | "bam" | "analysis")[]
    | undefined = undefined
): Promise<IResponse<IPossibleImports>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchPossibleImports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ types: types }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IPossibleImports {
  fasta: { [key: string]: string[][] };
  gff: { [key: string]: string[][] };
  bam: { [key: string]: string[][] };
  analysis: { [key: string]: string[][] };
}

// ===== FETCH IMPORT DIRECTORY ===== //
export async function fetchImportDirectory() {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchImportDirectory")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ONE TAXON BY NCBI TAXON ID ===== //
export function fetchTaxonByNCBITaxonID(ncbiTaxonID: number) {
  return fromFetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxonByNCBITaxonID?taxonID=" +
      ncbiTaxonID
  ).pipe(mapError<ReadonlyArray<INcbiTaxon>>());
}

export interface INcbiTaxon {
  commonName: string;
  id: number; // taxonId
  imageStatus: number;
  lastUpdatedBy: number;
  lastUpdatedOn: string; // TimeString
  ncbiTaxonID: number;
  parentNcbiTaxonID: number;
  scientificName: string;
  taxonRank: "species";
}

// ===== FETCH MULTIPLE ASSEMBLIES BY TAXON ID ===== //
export async function fetchAssembliesByTaxonIDs(taxonIDs: number[]) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssembliesByTaxonIDs?taxonIDs=" +
      taxonIDs
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE TAXON IMAGE ===== //
export async function updateImageByTaxonID(
  taxonID: number,
  path: string,
  userID: number
) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateImageByTaxonID?taxonID=" +
      taxonID +
      "&path=" +
      path +
      "&userID=" +
      userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE TAXON IMAGE ===== //
export async function removeImageByTaxonID(taxonID: number, userID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeImageByTaxonID?taxonID=" +
      taxonID +
      "&userID=" +
      userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL GENERAL INFOS OF SPECIFIC LEVEL ===== //
export async function fetchGeneralInfosByID(level: number, id: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchGeneralInfosByID?level=" +
      level +
      "&id=" +
      id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD GENERAL INFO ===== //
export async function addGeneralInfo(
  level: number,
  id: number,
  key: string,
  value: string
) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/addGeneralInfo?level=" +
      level +
      "&id=" +
      id +
      "&key=" +
      key +
      "&value=" +
      value
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =====  UPDATE GENERAL INFO ===== //
export async function updateGeneralInfoByID(
  level: number,
  id: number,
  key: string,
  value: string
) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateGeneralInfoByID?level=" +
      level +
      "&id=" +
      id +
      "&key=" +
      key +
      "&value=" +
      value
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE GENERAL INFO ===== //
export async function removeGeneralInfoByID(level: number, id: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeGeneralInfoByID?level=" +
      level +
      "&id=" +
      id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== IMPORT NEW ASSEMBLY ===== //
export function addNewAssembly(
  taxonID: number,
  name: string,
  path: string[],
  userID: number,
  additionalFilesPath: string[]
) {
  return fromFetch(
    process.env.REACT_APP_API_ADRESS +
      "/addNewAssembly?taxonID=" +
      taxonID +
      "&name=" +
      name +
      "&path=" +
      path.join("/") +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath.join("/") ?? ""
  ).pipe(mapError<IAssemblyAdded>());
}

export interface IAssemblyAdded {
  assemblyId: number;
  taxonID: number;
  name: string;
  path: string;
  additionalFilesPath: string;
}

// ===== REMOVE ASSEMBLY ===== //
export async function removeAssemblyByAssemblyID(id: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/removeAssemblyByAssemblyID?id=" + id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ASSEMBLIES BY TAXON ID ===== //
export function fetchAssembliesByTaxonID(taxonID: number) {
  return fromFetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssembliesByTaxonID?taxonID=" +
      taxonID
  ).pipe(mapError<IAssemblyByTaxon[]>());
}

export interface IAssemblyByTaxon {
  addedBy: number; // user_id
  addedByUsername: string;
  addedOn: string; // Date
  additionalFilesPath: null;
  id: number;
  lastUpdatedBy: 1; //user_id
  lastUpdatedByUsername: string;
  lastUpdatedOn: string; // Date
  name: string;
  path: string;
  taxonID: number;
}

// // ===== RENAME ASSEMBLY ===== //
export async function renameAssembly(id: number, name: string, userID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/renameAssembly?id=" +
      id +
      "&name=" +
      name +
      "&userID=" +
      userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD NEW ANNOTATION ===== //
export function addNewAnnotation(
  assemblyId: number,
  name: string,
  path: string,
  userID: number,
  additionalFilesPath = ""
): Observable<IResponse<IAnnotionationAdded>> {
  return fromFetch(
    process.env.REACT_APP_API_ADRESS +
      "/addNewAnnotation?id=" +
      assemblyId +
      "&name=" +
      name +
      "&path=" +
      path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath
  ).pipe(mapError<IAnnotionationAdded>());
}

export interface IAnnotionationAdded {
  assemblyID: number;
  name: string;
  path: string;
  additionalFilesPath: string;
}

// ===== ADD NEW MAPPING ===== //
export function addNewMapping(
  assemblyId: number,
  name: string,
  path: string,
  userID: number,
  additionalFilesPath = ""
): Observable<IResponse<IMappingAdded>> {
  return fromFetch(
    process.env.REACT_APP_API_ADRESS +
      "/addNewMapping?id=" +
      assemblyId +
      "&name=" +
      name +
      "&path=" +
      path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath
  ).pipe(mapError<IMappingAdded>());
}

export interface IMappingAdded {
  assemblyID: number;
  name: string;
  path: string;
  additionalFilesPath: string;
}

// ===== FETCH ALL MAPPINGS BY ASSEMBLY ID ===== //
export async function fetchMappingsByAssemblyID(assemblyID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchMappingsByAssemblyID?assemblyID=" +
      assemblyID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ANNOTATIONS BY ASSEMBLY ID ===== //
export async function fetchAnnotationsByAssemblyID(assemblyID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAnnotationsByAssemblyID?assemblyID=" +
      assemblyID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ANALYSIS BY ASSEMBLY ID ===== //
export async function fetchAnalysesByAssemblyID(assemblyID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAnalysesByAssemblyID?assemblyID=" +
      assemblyID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD NEW ANALYSIS ===== //
export function addNewAnalysis(
  assemblyId: number,
  name: string,
  path: string,
  userID: number,
  additionalFilesPath = ""
): Observable<IResponse<IAnalysisAdded>> {
  return fromFetch(
    process.env.REACT_APP_API_ADRESS +
      "/addNewAnalysis?id=" +
      assemblyId +
      "&name=" +
      name +
      "&path=" +
      path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath
  ).pipe(mapError<IAnalysisAdded>());
}

interface IAnalysisAdded {
  assemblyID: number;
  name: string;
  path: string;
  additionalFilesPath: string;
}

// ===== REMOVE ANNOTATION BY ID ===== //
export async function removeAnnotationByAnnotationID(id: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeAnnotationByAnnotationID?id=" +
      id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE MAPPING BY ID ===== //
export async function removeMappingByMappingID(id: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/removeMappingByMappingID?id=" + id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE ANALYSIS BY ID ===== //
export async function removeAnalysisByAnalysisID(id: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/removeAnalysisByAnalysisID?id=" + id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD NEW BOOKMARK ===== //
export async function addNewBookmark(userID: number, assemblyID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/addNewBookmark?userID=" +
      userID +
      "&assemblyID=" +
      assemblyID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE BOOKMARK ===== //
export async function removeBookmark(userID: number, assemblyID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeBookmark?userID=" +
      userID +
      "&assemblyID=" +
      assemblyID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== RELOAD TAXA DATABASE ===== //
export async function reloadTaxonIDsFromFile(userID: number) {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/reloadTaxonIDsFromFile?userID=" +
      userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE TAXA TREE ===== //
export async function updateTaxonTree() {
  return fetch(process.env.REACT_APP_API_ADRESS + "/updateTaxonTree")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH TAXA TREE ===== //
export async function fetchTaxonTree() {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchTaxonTree")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// IMPORT
export async function importFiles(importInformation: any): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/importFiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ importJson: importInformation }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

function mapError<T>(): UnaryFunction<
  Observable<globalThis.Response>,
  Observable<IResponse<T>>
> {
  return pipe(
    switchMap((request) => request.json() as Promise<Response<T>>),
    map((output) => {
      if (output.notification.type === "error") {
        throw output.notification;
      } else {
        return output as IResponse<T>;
      }
    })
  );
}

export type Response<T = unknown> = IResponse<T> | IErrorResponse;

interface IResponse<T = unknown> {
  payload: T;
  notification: IInfoNotification | ISuccessNotification;
}

interface IErrorResponse {
  payload: 0;
  notification: IErrorNotification;
}

interface INotification {
  label: string;
  message: string;
}

export type Notification =
  | IInfoNotification
  | ISuccessNotification
  | IErrorNotification;

interface IInfoNotification extends INotification {
  type: "info";
}

interface ISuccessNotification extends INotification {
  type: "success";
}

interface IErrorNotification extends INotification {
  type: "error";
}
