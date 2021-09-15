import { Observable, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IPath } from '../screens/MainRouter/components/DataAssistant/components/AssistantProvider/components/CreateAssemblyBundleForm/_interfaces';

// USER AUTHENTIFCATION
export function login(username: string, password: string): Observable<IResponse> {
  return fromFetch("http://localhost:3002/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  }).pipe(
    switchMap(request => request.json()),
    catchError(error => {
      console.error(error);
      return of(error);
    })
  );
}

// ADD NEW USER
export async function addUser(username: string, password: string, role: string): Promise<IResponse> {
  return fetch("http://localhost:3002/addUser", {
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
  return fetch("http://localhost:3002/fetchAllUsers")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE USER BY USER ID ===== //
export async function deleteUserByUserID(userID: number) {
  return fetch("http://localhost:3002/deleteUserByUserID?userID=" + userID)
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE USER ROLE BY USER ID ===== //
export async function updateUserRoleByUserID(userID: number, role: string) {
  return fetch(
    "http://localhost:3002/updateUserRoleByUserID?userID=" +
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
    "http://localhost:3002/fetchAllAssemblies?page=" +
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
export async function fetchAssemblyInformationByAssemblyID(id: string, userID: string) {
  return fetch(
    "http://localhost:3002/fetchAssemblyInformationByAssemblyID?id=" +
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
export async function fetchPossibleImports(types: ("image"|"fasta"|"gff"|"bam"|"analysis")[] | undefined = undefined): Promise<IResponse<IPossibleImports>> {
  return fetch("http://localhost:3002/fetchPossibleImports", {
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

export interface IPossibleImports{
  'fasta': {[key: string]: string[][]};
  'gff': {[key: string]: string[][]};
  'bam': {[key: string]: string[][]};
  'analysis': {[key: string]: string[][]};
}

// ===== FETCH ONE TAXON BY NCBI TAXON ID ===== //
export async function fetchTaxonByNCBITaxonID(taxonID: number): Promise<IResponse<ReadonlyArray<INcbiTaxon>>> {
  return fetch(
    "http://localhost:3002/fetchTaxonByNCBITaxonID?taxonID=" + taxonID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface INcbiTaxon{
  commonName: string;
  id: number;
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
    "http://localhost:3002/fetchAssembliesByTaxonIDs?taxonIDs=" + taxonIDs
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE TAXON IMAGE ===== //
export async function updateImageByTaxonID(taxonID: number, path: string, userID: number) {
  return fetch(
    "http://localhost:3002/updateImageByTaxonID?taxonID=" +
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
    "http://localhost:3002/removeImageByTaxonID?taxonID=" +
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
    "http://localhost:3002/fetchGeneralInfosByID?level=" + level + "&id=" + id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD GENERAL INFO ===== //
export async function addGeneralInfo(level: number, id: number, key: string, value: string) {
  return fetch(
    "http://localhost:3002/addGeneralInfo?level=" +
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
export async function updateGeneralInfoByID(level: number, id: number, key: string, value: string) {
  return fetch(
    "http://localhost:3002/updateGeneralInfoByID?level=" +
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
    "http://localhost:3002/removeGeneralInfoByID?level=" + level + "&id=" + id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== IMPORT NEW ASSEMBLY ===== //
export function addNewAssembly(taxonID: number, name: string, path: IPath, userID: number) {
  return fromFetch(
    "http://localhost:3002/addNewAssembly?taxonID=" +
      taxonID +
      "&name=" +
      name +
      "&path=" +
      path.path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      path.additionalFilesPath ?? ''
  )
    .pipe(
      switchMap(request => request.json()),
      catchError(error => {
        console.error(error);
        return of(error)
      })
    );
}

// ===== REMOVE ASSEMBLY ===== //
export async function removeAssemblyByAssemblyID(id: number) {
  return fetch("http://localhost:3002/removeAssemblyByAssemblyID?id=" + id)
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ASSEMBLIES BY TAXON ID ===== //
export async function fetchAssembliesByTaxonID(taxonID: number) {
  return fetch(
    "http://localhost:3002/fetchAssembliesByTaxonID?taxonID=" + taxonID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// // ===== RENAME ASSEMBLY ===== //
export async function renameAssembly(id: number, name: string, userID: number) {
  return fetch(
    "http://localhost:3002/renameAssembly?id=" +
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
export function addNewAnnotation(id: number, name: string, path: string, userID: number, additionalFilesPath: string = "") {
  return fromFetch(
    "http://localhost:3002/addNewAnnotation?id=" +
      id +
      "&name=" +
      name +
      "&path=" +
      path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath
  ).pipe(
    switchMap(request => request.json()),
    catchError(error => {
      console.error(error);
      return of(error)
    })
  );
}

// ===== ADD NEW MAPPING ===== //
export async function addNewMapping(id: number, name: string, path: string, userID: number, additionalFilesPath: string = "") {
  return fromFetch(
    "http://localhost:3002/addNewMapping?id=" +
      id +
      "&name=" +
      name +
      "&path=" +
      path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath
  ).pipe(
    switchMap(request => request.json()),
    catchError(error => {
      console.error(error);
      return of(error)
    })
  );
}

// ===== FETCH ALL MAPPINGS BY ASSEMBLY ID ===== //
export async function fetchMappingsByAssemblyID(assemblyID: number) {
  return fetch(
    "http://localhost:3002/fetchMappingsByAssemblyID?assemblyID=" + assemblyID
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
    "http://localhost:3002/fetchAnnotationsByAssemblyID?assemblyID=" +
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
    "http://localhost:3002/fetchAnalysesByAssemblyID?assemblyID=" + assemblyID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD NEW ANALYSIS ===== //
export function addNewAnalysis(id: number, name: string, path: string, userID: number, additionalFilesPath: string = "") {
  return fromFetch(
    "http://localhost:3002/addNewAnalysis?id=" +
      id +
      "&name=" +
      name +
      "&path=" +
      path +
      "&userID=" +
      userID +
      "&additionalFilesPath=" +
      additionalFilesPath
  ).pipe(
    switchMap(request => <Promise<IResponse>>request.json()),
    catchError((error: IResponse) => {
      console.error(error);
      return of(error);
    })
  );
}

// ===== REMOVE ANNOTATION BY ID ===== //
export async function removeAnnotationByAnnotationID(id: number) {
  return fetch(
    "http://localhost:3002/removeAnnotationByAnnotationID?id=" + id
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE MAPPING BY ID ===== //
export async function removeMappingByMappingID(id: number) {
  return fetch("http://localhost:3002/removeMappingByMappingID?id=" + id)
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE ANALYSIS BY ID ===== //
export async function removeAnalysisByAnalysisID(id: number) {
  return fetch("http://localhost:3002/removeAnalysisByAnalysisID?id=" + id)
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD NEW BOOKMARK ===== //
export async function addNewBookmark(userID: number, assemblyID: number) {
  return fetch(
    "http://localhost:3002/addNewBookmark?userID=" +
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
    "http://localhost:3002/removeBookmark?userID=" +
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
    "http://localhost:3002/reloadTaxonIDsFromFile?userID=" + userID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE TAXA TREE ===== //
export async function updateTaxonTree() {
  return fetch("http://localhost:3002/updateTaxonTree")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH TAXA TREE ===== //
export async function fetchTaxonTree() {
  return fetch("http://localhost:3002/fetchTaxonTree")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IResponse<T = unknown>{
  payload: T;
  notification: INotification;
}

export interface INotification{
  label: string;
  message: string;
  type: string;
}
