import { NotificationType } from "../components/Notification";
import { AssemblyInterface, AssemblyTagInterface } from "../tsInterfaces/tsInterfaces";

import { Observable, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, switchMap } from "rxjs/operators";

// =============================== users =============================== //
// USER AUTHENTIFCATION
export function login(username: string, password: string): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// USER AUTHENTIFCATION
export function logout(userID: number, token: string): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID: userID, token: token }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ADD NEW USER
export async function addUser(
  username: string,
  password: string,
  role: string,
  userID: number,
  token: string
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
      userID: userID,
      token: token,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL USERS ===== //
export async function fetchUsers(userID: number, token: string): Promise<IResponse<IUser[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/fetchUsers?userID=" + userID + "&token=" + token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IUser {
  id: number;
  username: string;
  userRole?: string;
  activeToken?: string;
  tokenCreationTime?: Date;
}

// ===== DELETE USER BY USER ID ===== //
export async function deleteUserByUserID(
  id: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteUserByUserID?id=" +
      id +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE USER ROLE BY USER ID ===== //
export async function updateUserRoleByUserID(
  id: number,
  role: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateUserRoleByUserID?id=" +
      id +
      "&role=" +
      role +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD NEW BOOKMARK ===== //
export async function addBookmark(
  userID: number,
  assemblyID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/addBookmark?userID=" +
      userID +
      "&assemblyID=" +
      assemblyID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE BOOKMARK ===== //
export async function removeBookmark(
  userID: number,
  assemblyID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeBookmark?userID=" +
      userID +
      "&assemblyID=" +
      assemblyID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =============================== assemblies =============================== //

// ===== IMPORT NEW ASSEMBLY ===== //
export async function validateFileInfo(
  fileInfo: IImportFileInformation,
  userID: number,
  token: string
): Promise<IResponse<IImportValidation>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/validateFileInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileInfo: fileInfo,
      userID: userID,
      token: token,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IImportValidation {
  sequence?: Dataset[];
  annotation?: Dataset[];
  mapping?: Dataset[];
  busco?: Dataset[];
  fcat?: Dataset[];
  milts: Dataset[];
  repeatmasker?: Dataset[];
}

export type DatasetTypes =
  | "sequence"
  | "annotation"
  | "mapping"
  | "busco"
  | "fcat"
  | "milts"
  | "repeatmasker";

export interface Dataset {
  main_file: IImportFileInformation;
  additional_files: IImportFileInformation[];
}

export interface TreeNode extends IImportFileInformation {
  isOpen?: boolean;
}

// ===== IMPORT NEW ASSEMBLY ===== //
export async function importAssembly(
  taxon: INcbiTaxon,
  dataset: Dataset,
  userID: number,
  token: string
): Promise<IResponse<number>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/import_assembly", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxon: taxon,
      dataset: dataset,
      userID: userID,
      token: token,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE ASSEMBLY BY ASSEMBLY ID ===== //
export async function deleteAssemblyByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteAssemblyByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL GENERAL INFORMATION FOR SPECIFIC ASSEMBLY ===== //
export async function fetchAssemblyGeneralInformationByAssemblyID(
  id: number,
  userID: number,
  token: string
): Promise<IResponse<[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssemblyGeneralInformationByAssemblyID?id=" +
      id +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD ASSEMBLY GENERAL INFORMATION ===== //
export async function addAssemblyGeneralInformation(
  id: number,
  key: string,
  value: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/addAssemblyGeneralInformation?id=" +
      id +
      "&key=" +
      key +
      "&value=" +
      value +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =====  UPDATE ASSEMBLY GENERAL INFORMATION ===== //
export async function updateAssemblyGeneralInformationByID(
  id: number,
  key: string,
  value: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateAssemblyGeneralInformationByID?id=" +
      id +
      "&key=" +
      key +
      "&value=" +
      value +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE ASSEMBLY GENERAL INFORMATION ===== //
export async function deleteAssemblyGeneralInformationByID(
  id: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteAssemblyGeneralInformationByID?id=" +
      id +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ASSEMBLIES ===== //
export async function fetchAssemblies(
  userID: number,
  token: number,
  offset = 0,
  range = 10,
  search = "",
  filter: Filter = {},
  sortBy: Sorting = { column: "scientificName", order: true },
  onlyBookmarked: 1 | 0 = 0
): Promise<IResponse<AssemblyInterface[]>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchAssemblies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: userID,
      token: token,
      offset: offset,
      range: range,
      search: search,
      filter: filter,
      sortBy: sortBy,
      onlyBookmarked: onlyBookmarked,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface Filter {
  userIDs?: number[];
  tags?: string[];
  taxonIDs?: number[];
  hasAnnotation?: boolean;
  hasMapping?: boolean;
  hasBusco?: boolean;
  hasFcat?: boolean;
  hasMilts?: boolean;
  hasRepeatmasker?: boolean;
  minBuscoComplete?: number;
  minFcatSimilar?: { mode: number; value: number };
  sequenceHeader?: string[];
  featureAttribute?: any[]; // TODO: add feature attribute search
}

export interface Sorting {
  column: string;
  order: boolean;
}

// ===== FETCH ALL ASSEMBLIES FOR SPECIFIC TAXON ===== //
export async function fetchAssembliesByTaxonID(
  taxonID: number,
  userID: number,
  token: string
): Promise<IResponse<AssemblyInterface[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssembliesByTaxonID?taxonID=" +
      taxonID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH MULTIPLE ASSEMBLIES BY TAXON ID ===== //
export async function fetchAssembliesByTaxonIDs(
  taxonIDs: number[],
  userID: number,
  token: string
): Promise<IResponse<AssemblyInterface>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssembliesByTaxonIDs?taxonIDs=" +
      taxonIDs +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ONE ASSEMBLY BY ASSEMBLY ID ===== //
export async function fetchAssemblyByAssemblyID(
  assemblyID: number,
  userID: string,
  token: string
): Promise<IResponse<AssemblyInterface>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssemblyByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD ASSEMBLY TAG ===== //
export async function addAssemblyTag(
  assemblyID: number,
  tag: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/addAssemblyTag?assemblyID=" +
      assemblyID +
      "&tag=" +
      tag +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== REMOVE ASSEMBLY TAG ===== //
export async function removeAssemblyTagbyTagID(
  tagID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeAssemblyTagbyTagID?tagID=" +
      tagID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ASSEMBLY TAGS ===== //
export async function fetchAssemblyTags(
  userID: number,
  token: string
): Promise<IResponse<string[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/fetchAssemblyTags?userID=" + userID + "&token=" + token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ASSEMBLY TAGS BY ASSEMBLY ID ===== //
export async function fetchAssemblyTagsByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<AssemblyTagInterface[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssemblyTagsByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE ASSEMBLY LABEL BY ASSEMBLY ID ===== //
export async function updateAssemblyLabel(
  assemblyID: number,
  label: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateAssemblyLabel?assemblyID=" +
      assemblyID +
      "&label=" +
      label +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE ASSEMBLY LABEL BY ASSEMBLY ID ===== //
export async function fetchAssemblySequenceHeaders(
  assemblyID: number,
  number: number,
  offset: number,
  search: string,
  userID: number,
  token: string
): Promise<IResponse<IAssemblySequenceHeader[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAssemblySequenceHeaders?assemblyID=" +
      assemblyID +
      "&number=" +
      number +
      "&search=" +
      search +
      "&offset=" +
      offset +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IAssemblySequenceHeader {
  assemblyID: number;
  gcPercentLocal: number;
  gcPercentMaskedLocal: number;
  header: string;
  headerIdx: number;
  id: number;
  sequenceLength: number;
}

// =============================== taxa =============================== //
// ===== RELOAD TAXA DATABASE ===== //
export async function reloadTaxonIDsFromFile(userID: number, token: string): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/reloadTaxonIDsFromFile?userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE TAXA TREE ===== //
export async function updateTaxonTree(): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/updateTaxonTree")
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH TAXA TREE ===== //
export async function fetchTaxonTree(userID: number, token: string): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/fetchTaxonTree?userID=" + userID + "&token=" + token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== IMPORT NEW IMAGE ===== //
export async function importImage(data: FormData): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/import_image", {
    method: "POST",
    body: data,
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH TAXON IMAGE BY TAXON ID ===== //
export function fetchTaxonImageByTaxonID(
  taxonID: number,
  userID: number,
  token: string
): Promise<any> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxonImageByTaxonID?userID=" +
      userID +
      "&token=" +
      token +
      "&taxonID=" +
      taxonID
  );
}

// ===== FETCH TAXON IMAGE BY TAXON ID ===== //
export function removeImageByTaxonID(
  taxonID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/removeImageByTaxonID?userID=" +
      userID +
      "&token=" +
      token +
      "&taxonID=" +
      taxonID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ONE TAXON BY TAXON ID ===== //
export function fetchTaxonByTaxonID(
  taxonID: number,
  userID: number,
  token: string
): Promise<IResponse<INcbiTaxon>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxonByTaxonID?userID=" +
      userID +
      "&token=" +
      token +
      "&taxonID=" +
      taxonID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ONE TAXON BY TAXON ID ===== //
export function fetchTaxonBySearch(
  search: string,
  userID: number,
  token: string
): Promise<IResponse<INcbiTaxon[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxonBySearch?userID=" +
      userID +
      "&token=" +
      token +
      "&search=" +
      search
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ONE TAXON BY NCBI TAXON ID ===== //
export function fetchTaxonByNCBITaxonID(
  userID: number,
  token: string,
  ncbiTaxonID: number
): Promise<IResponse<INcbiTaxon[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxonByNCBITaxonID?userID=" +
      userID +
      "&token=" +
      token +
      "&taxonID=" +
      ncbiTaxonID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface INcbiTaxon {
  commonName: string;
  id: number; // taxonId
  imagePath: string;
  lastUpdatedBy: number;
  lastUpdatedOn: string; // TimeString
  ncbiTaxonID: number;
  parentNcbiTaxonID: number;
  scientificName: string;
  taxonRank: string;
}

// ===== FETCH ONE TAXON BY NCBI TAXON ID ===== //
export function fetchTaxaWithAssemblies(
  userID: number,
  token: string
): Promise<IResponse<INcbiTaxon[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxaWithAssemblies?userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL GENERAL INFORMATION FOR SPECIFIC TAXON ===== //
export async function fetchTaxonGeneralInformationByTaxonID(
  id: number,
  userID: number,
  token: string
): Promise<IResponse<[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaxonGeneralInformationByTaxonID?id=" +
      id +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== ADD TAXON GENERAL INFORMATION ===== //
export async function addTaxonGeneralInformation(
  id: number,
  key: string,
  value: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/addTaxonGeneralInformation?id=" +
      id +
      "&key=" +
      key +
      "&value=" +
      value +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =====  UPDATE TAXON GENERAL INFORMATION ===== //
export async function updateTaxonGeneralInformationByID(
  id: number,
  key: string,
  value: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateTaxonGeneralInformationByID?id=" +
      id +
      "&key=" +
      key +
      "&value=" +
      value +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE TAXON GENERAL INFORMATION ===== //
export async function deleteTaxonGeneralInformationByID(
  id: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteTaxonGeneralInformationByID?id=" +
      id +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IGeneralInformation {
  id: number;
  generalInfoLabel: string;
  generalInfoDescription: string;
}

// =============================== annotations =============================== //
// ===== IMPORT NEW ANNOTATION ===== //
export async function importAnnotation(
  taxon: INcbiTaxon,
  dataset: Dataset,
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/import_annotation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxon: taxon,
      dataset: dataset,
      assemblyID: assemblyID,
      userID: userID,
      token: token,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE ANNOTATION BY ANNOTATION ID ===== //
export async function deleteAnnotationByAnnotationID(
  annotationID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteAnnotationByAnnotationID?annotationID=" +
      annotationID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ANNOTATIONS BY ASSEMBLY ID ===== //
export async function fetchAnnotationsByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<IAnnotation[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAnnotationsByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IAnnotation {
  addedBy: number;
  addedOn: Date;
  assemblyID: number;
  id: number;
  name: string;
  path: string;
  featureCount: string;
  username: string;
  label?: string;
}

// ===== UPDATE ANNOTATION LABEL BY ANNOTATION ID ===== //
export async function updateAnnotationLabel(
  annotationID: number,
  label: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateAnnotationLabel?annotationID=" +
      annotationID +
      "&label=" +
      label +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL FEATURES ===== //
export async function fetchFeatures(
  offset = 0,
  range = 10,
  search = "",
  filter: FilterFeatures = {},
  sortBy: Sorting = { column: "seqID", order: true },
  userID: number,
  token: string,
  assemblyID = -1
): Promise<IResponse<IGenomicAnnotationFeature[]>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchFeatures", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assemblyID: assemblyID,
      userID: userID,
      token: token,
      offset: offset,
      range: range,
      search: search,
      filter: filter,
      sortBy: sortBy,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface FilterFeatures {
  featureTypes?: string[];
  featureAttributes?: ITargetAttribute[];
  taxonIDs?: number[];
  featureSeqIDs?: string[];
}

export interface ITargetAttribute {
  target: string;
  operator?: string;
  value?: string | number;
}

export interface IGenomicAnnotationFeature {
  annotationID: number;
  assemblyID: number;
  attributes: any;
  end: number;
  id: number;
  label?: string;
  name: string;
  phase?: string;
  scientificName: string;
  score?: number;
  seqID: string;
  source?: string;
  start: number;
  strand?: string;
  taxonID: number;
  type: string;
}

// ===== FETCH ALL UNIQUE FEATURE SEQ IDS IN DB ===== //
export async function fetchFeatureSeqIDs(
  userID: number,
  token: string,
  assemblyID: number,
  taxonIDs: number[]
): Promise<IResponse<string[]>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchFeatureSeqIDs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: userID,
      token: token,
      assemblyID: assemblyID,
      taxonIDs: taxonIDs,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL UNIQUE FEATURE TYPES IN DB ===== //
export async function fetchFeatureTypes(
  userID: number,
  token: string,
  assemblyID: number,
  taxonIDs: number[],
  seqIDs: string[]
): Promise<IResponse<string[]>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchFeatureTypes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: userID,
      token: token,
      assemblyID: assemblyID,
      taxonIDs: taxonIDs,
      seqIDs: seqIDs,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL KEYS IN ATTRIBUTE SECTION ===== //
export async function fetchFeatureAttributeKeys(
  userID: number,
  token: string,
  assemblyID: number,
  taxonIDs: number[],
  types: string[]
): Promise<IResponse<string[]>> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/fetchFeatureAttributeKeys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: userID,
      token: token,
      assemblyID: assemblyID,
      taxonIDs: taxonIDs,
      types: types,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =============================== mappings =============================== //
// ===== IMPORT NEW MAPPING ===== //
export async function importMapping(
  taxon: INcbiTaxon,
  dataset: Dataset,
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/import_mapping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxon: taxon,
      dataset: dataset,
      assemblyID: assemblyID,
      userID: userID,
      token: token,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE MAPPING BY MAPPING ID ===== //
export async function deleteMappingByMappingID(
  mappingID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteMappingByMappingID?mappingID=" +
      mappingID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL MAPPINGS BY ASSEMBLY ID ===== //
export async function fetchMappingsByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<IMapping[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchMappingsByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IMapping {
  addedBy: number;
  addedOn: Date;
  assemblyID: number;
  id: number;
  name: string;
  path: string;
  username: string;
  label?: string;
}

// ===== UPDATE MAPPING LABEL BY MAPPING ID ===== //
export async function updateMappingLabel(
  mappingID: number,
  label: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateMappingLabel?mappingID=" +
      mappingID +
      "&label=" +
      label +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =============================== ANALYSES =============================== //
// ===== IMPORT NEW ANALYSES ===== //
export async function importAnalyses(
  taxon: INcbiTaxon,
  dataset: Dataset,
  assemblyID: number,
  analysesType: DatasetTypes,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/import_analyses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxon: taxon,
      dataset: dataset,
      assemblyID: assemblyID,
      analysesType: analysesType,
      userID: userID,
      token: token,
    }),
  })
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== DELETE ANNOTATION BY ANNOTATION ID ===== //
export async function deleteAnalysesByAnalysesID(
  analysisID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/deleteAnalysesByAnalysesID?analysisID=" +
      analysisID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IBuscoAnalysis {
  addedBy: number;
  addedOn: Date;
  analysisID: number;
  assemblyID: number;
  buscoMode: string;
  completeDuplicated: number;
  completeDuplicatedPercent: number;
  completeSingle: number;
  completeSinglePercent: number;
  dataset: string;
  fragmented: number;
  fragmentedPercent: number;
  id: number;
  missing: number;
  missingPercent: number;
  name: string;
  path: string;
  targetFile: string;
  total: number;
  type: "busco";
  label?: string;
  username: string;
}

export interface IFcatAnalysis {
  addedBy: number;
  addedOn: Date;
  analysisID: number;
  assemblyID: number;
  genomeID: string;
  id: number;
  m1_dissimilar: number;
  m1_dissimilarPercent: number;
  m1_duplicated: number;
  m1_duplicatedPercent: number;
  m1_ignored: number;
  m1_ignoredPercent: number;
  m1_missing: number;
  m1_missingPercent: number;
  m1_similar: number;
  m1_similarPercent: number;
  m2_dissimilar: number;
  m2_dissimilarPercent: number;
  m2_duplicated: number;
  m2_duplicatedPercent: number;
  m2_ignored: number;
  m2_ignoredPercent: number;
  m2_missing: number;
  m2_missingPercent: number;
  m2_similar: number;
  m2_similarPercent: number;
  m3_dissimilar: number;
  m3_dissimilarPercent: number;
  m3_duplicated: number;
  m3_duplicatedPercent: number;
  m3_ignored: number;
  m3_ignoredPercent: number;
  m3_missing: number;
  m3_missingPercent: number;
  m3_similar: number;
  m3_similarPercent: number;
  m4_dissimilar: number;
  m4_dissimilarPercent: number;
  m4_duplicated: number;
  m4_duplicatedPercent: number;
  m4_ignored: number;
  m4_ignoredPercent: number;
  m4_missing: number;
  m4_missingPercent: number;
  m4_similar: number;
  m4_similarPercent: number;
  name: string;
  path: string;
  total: number;
  type: "fcat";
  label?: string;
  username: string;
}

export interface IMiltsAnalysis {
  addedBy: number;
  addedOn: Date;
  analysisID: number;
  assemblyID: number;
  id: number;
  name: string;
  path: string;
  type: "milts";
  label?: string;
  username: string;
}

export interface IRepeatmaskerAnalysis {
  addedBy: number;
  addedOn: Date;
  analysisID: number;
  assemblyID: number;
  dna_elements: number;
  dna_elements_length: number;
  id: number;
  lines: number;
  lines_length: number;
  low_complexity: number;
  low_complexity_length: number;
  ltr_elements: number;
  ltr_elements_length: number;
  name: string;
  numberN: number;
  path: string;
  percentN: number;
  rolling_circles: number;
  rolling_circles_length: number;
  satellites: number;
  satellites_length: number;
  simple_repeats: number;
  simple_repeats_length: number;
  sines: number;
  sines_length: number;
  small_rna: number;
  small_rna_length: number;
  total_non_repetitive_length: number;
  total_repetitive_length: number;
  type: "repeatmasker";
  unclassified: number;
  unclassified_length: number;
  label?: string;
  username: string;
}

export type IAnalyses = IBuscoAnalysis | IFcatAnalysis | IMiltsAnalysis | IRepeatmaskerAnalysis;

// ===== FETCH ALL ANALYSES BY ASSEMBLY ID ===== //
export async function fetchAnalysesByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchAnalysesByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH BUSCO ANALYSES BY ASSEMBLY ID ===== //
export async function fetchBuscoAnalysesByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<IBuscoAnalysis[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchBuscoAnalysesByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH FCAT ANALYSES BY ASSEMBLY ID ===== //
export async function fetchFcatAnalysesByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<IFcatAnalysis[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchFcatAnalysesByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH MILTS ANALYSES BY ASSEMBLY ID ===== //
export async function fetchMiltsAnalysesByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<IMiltsAnalysis[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchMiltsAnalysesByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH ALL ANALYSES BY ASSEMBLY ID ===== //
export async function fetchRepeatmaskerAnalysesByAssemblyID(
  assemblyID: number,
  userID: number,
  token: string
): Promise<IResponse<IRepeatmaskerAnalysis[]>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchRepeatmaskerAnalysesByAssemblyID?assemblyID=" +
      assemblyID +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== UPDATE MAPPING LABEL BY MAPPING ID ===== //
export async function updateAnalysisLabel(
  analysisID: number,
  label: string,
  userID: number,
  token: string
): Promise<IResponse> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/updateAnalysisLabel?analysisID=" +
      analysisID +
      "&label=" +
      label +
      "&userID=" +
      userID +
      "&token=" +
      token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// =============================== IMPORTS =============================== //
// ===== FETCH IMPORT DIRECTORY ===== //
export async function fetchImportDirectory(
  userID: number,
  token: string
): Promise<IResponse<IImportFileInformation>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS + "/fetchImportDirectory?userID=" + userID + "&token=" + token
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface IImportFileInformation {
  id: string;
  children?: IImportFileInformation[];
  dirType?: string;
  additionalFilesType?: string;
  type?: string;
  mainFile?: string;
  additionalFiles?: string[];
  name: string;
  path: string;
  size?: number;
}

// ===== IMPORT COMBINED ===== //
export function importDataset(
  taxon: INcbiTaxon,
  assembly: Dataset[],
  annotations: Dataset[],
  mappings: Dataset[],
  buscos: Dataset[],
  fcats: Dataset[],
  milts: Dataset[],
  repeatmaskers: Dataset[],
  userID: number,
  token: string,
  assemblyID: number | undefined = undefined
): Observable<IResponse<ITask>> {
  return fromFetch(process.env.REACT_APP_API_ADRESS + "/import_dataset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxon: taxon,
      assembly: assembly,
      annotations: annotations,
      mappings: mappings,
      buscos: buscos,
      fcats: fcats,
      milts: milts,
      repeatmaskers: repeatmaskers,
      userID: userID,
      token: token,
      assemblyID: assemblyID,
    }),
  }).pipe(
    switchMap((request) => request.json()),
    catchError((error) => {
      console.error(error);
      return of(error);
    })
  );
}

// =============================== FILES =============================== //
// ===== Reindex Fileserver ===== //
export async function scanFiles(userID: number, token: string): Promise<IResponse> {
  return fetch(process.env.REACT_APP_API_ADRESS + "/scanFiles?userID=" + userID + "&token=" + token)
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

// ===== FETCH TAXON IMAGE BY TAXON ID ===== //
export function fetchFileByPath(path: string, userID: number, token: string): Promise<any> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchFileByPath?userID=" +
      userID +
      "&token=" +
      token +
      "&path=" +
      path
  );
}

// ===== FETCH TASK STATUS TASK ID ===== //
export function fetchTaskStatus(
  userID: number,
  token: string,
  taskID: string
): Promise<IResponse<ITask>> {
  return fetch(
    process.env.REACT_APP_API_ADRESS +
      "/fetchTaskStatus?userID=" +
      userID +
      "&token=" +
      token +
      "&taskID=" +
      taskID
  )
    .then((request) => request.json())
    .then((data) => data)
    .catch((error) => {
      console.error(error);
    });
}

export interface ITask {
  id: string;
  status: "running" | "done" | "aborted";
  startTime: Date;
  updateTime?: Date;
  endTime?: Date;
  targetTaxon?: number;
  targetAssembly?: number;
  progress?: number;
}

export type Response<T = unknown> = IResponse<T> | IErrorResponse;

export interface IResponse<T = unknown> {
  payload: T;
  notification: IInfoNotification[] | ISuccessNotification[];
  pagination?: Pagination;
}

export interface Pagination {
  offset: number;
  range: number;
  count: number;
  pages: number;
}

interface IErrorResponse {
  payload: 0;
  notification: IErrorNotification[];
}

interface INotification {
  id?: string;
  label: string;
  message: string;
  tyoe: NotificationType;
}

export type Notification = IInfoNotification | ISuccessNotification | IErrorNotification;

interface IInfoNotification extends INotification {
  type: "info";
}

interface ISuccessNotification extends INotification {
  type: "success";
}

interface IErrorNotification extends INotification {
  type: "error";
}

export interface NotificationObject {
  id?: string;
  label: string;
  message: string;
  type: string;
}
