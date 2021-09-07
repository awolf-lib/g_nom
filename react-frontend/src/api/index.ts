import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { catchError, map, switchMap } from 'rxjs/operators';

export default class API {
  constructor() {
    this.adress = process.env.REACT_APP_API_ADRESS;
  }

  // USER AUTHENTIFCATION
  login(username: string, password: string) {
    return fromFetch(this.adress + "/login", {
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
  async addUser(username: string, password: string, role: string) {
    return fetch(this.adress + "/addUser", {
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
  async fetchAllUsers() {
    return fetch(this.adress + "/fetchAllUsers")
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== DELETE USER BY USER ID ===== //
  async deleteUserByUserID(userID: number) {
    return fetch(this.adress + "/deleteUserByUserID?userID=" + userID)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== UPDATE USER ROLE BY USER ID ===== //
  async updateUserRoleByUserID(userID: number, role: string) {
    return fetch(
      this.adress + "/updateUserRoleByUserID?userID=" + userID + "&role=" + role
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL ASSEMBLIES ===== //
  async fetchAllAssemblies(
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
      this.adress +
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
  async fetchAssemblyInformationByAssemblyID(id: string, userID: string) {
    return fetch(
      this.adress +
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
  async fetchPossibleImports(types: ("image"|"fasta"|"gff"|"bam"|"analysis")[] | undefined = undefined) {
    return fetch(this.adress + "/fetchPossibleImports", {
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

  // ===== FETCH ONE TAXON BY NCBI TAXON ID ===== //
  async fetchTaxonByNCBITaxonID(taxonID: number) {
    return fetch(
      this.adress + "/fetchTaxonByNCBITaxonID?taxonID=" + taxonID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH MULTIPLE ASSEMBLIES BY TAXON ID ===== //
  async fetchAssembliesByTaxonIDs(taxonIDs: number[]) {
    return fetch(
      this.adress + "/fetchAssembliesByTaxonIDs?taxonIDs=" + taxonIDs
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== UPDATE TAXON IMAGE ===== //
  async updateImageByTaxonID(taxonID: number, path: string, userID: number) {
    return fetch(
      this.adress +
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
  async removeImageByTaxonID(taxonID: number, userID: number) {
    return fetch(
      this.adress +
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
  async fetchGeneralInfosByID(level: number, id: number) {
    return fetch(
      this.adress + "/fetchGeneralInfosByID?level=" + level + "&id=" + id
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD GENERAL INFO ===== //
  async addGeneralInfo(level: number, id: number, key: string, value: string) {
    return fetch(
      this.adress +
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
  async updateGeneralInfoByID(level: number, id: number, key: string, value: string) {
    return fetch(
      this.adress +
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
  async removeGeneralInfoByID(level: number, id: number) {
    return fetch(
      this.adress + "/removeGeneralInfoByID?level=" + level + "&id=" + id
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== IMPORT NEW ASSEMBLY ===== //
  addNewAssembly(taxonID: number, name: string, path: string, userID: string, additionalFilesPath: string = "") {
    return fromFetch(
      this.adress + "/addNewAssembly?taxonID=" +
        taxonID +
        "&name=" +
        name +
        "&path=" +
        path +
        "&userID=" +
        userID +
        "&additionalFilesPath=" +
        additionalFilesPath
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
  async removeAssemblyByAssemblyID(id: number) {
    return fetch(this.adress + "/removeAssemblyByAssemblyID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ASSEMBLIES BY TAXON ID ===== //
  async fetchAssembliesByTaxonID(taxonID: number) {
    return fetch(
      this.adress + "/fetchAssembliesByTaxonID?taxonID=" + taxonID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // // ===== RENAME ASSEMBLY ===== //
  // async renameAssembly(id, name, userID) {
  //   return fetch(
  //     this.adress + "/renameAssembly?id=" +
  //       id +
  //       "&name=" +
  //       name +
  //       "&userID=" +
  //       userID
  //   )
  //     .then((request) => request.json())
  //     .then((data) => data)
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }

  // ===== ADD NEW ANNOTATION ===== //
  async addNewAnnotation(id: number, name: string, path: string, userID: number, additionalFilesPath: string = "") {
    return fetch(
      this.adress +
        "/addNewAnnotation?id=" +
        id +
        "&name=" +
        name +
        "&path=" +
        path +
        "&userID=" +
        userID +
        "&additionalFilesPath=" +
        additionalFilesPath
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD NEW MAPPING ===== //
  async addNewMapping(id: number, name: string, path: string, userID: number, additionalFilesPath: string = "") {
    return fetch(
      this.adress +
        "/addNewMapping?id=" +
        id +
        "&name=" +
        name +
        "&path=" +
        path +
        "&userID=" +
        userID +
        "&additionalFilesPath=" +
        additionalFilesPath
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL MAPPINGS BY ASSEMBLY ID ===== //
  async fetchMappingsByAssemblyID(assemblyID: number) {
    return fetch(
      this.adress + "/fetchMappingsByAssemblyID?assemblyID=" + assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL ANNOTATIONS BY ASSEMBLY ID ===== //
  async fetchAnnotationsByAssemblyID(assemblyID: number) {
    return fetch(
      this.adress + "/fetchAnnotationsByAssemblyID?assemblyID=" + assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL ANALYSIS BY ASSEMBLY ID ===== //
  async fetchAnalysesByAssemblyID(assemblyID: number) {
    return fetch(
      this.adress + "/fetchAnalysesByAssemblyID?assemblyID=" + assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD NEW ANALYSIS ===== //
  addNewAnalysis(id: number, name: string, path: string, userID: number, additionalFilesPath: string = "") {
    return fromFetch(
      this.adress + "/addNewAnalysis?id=" +
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
  async removeAnnotationByAnnotationID(id: number) {
    return fetch(
      this.adress + "/removeAnnotationByAnnotationID?id=" + id
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE MAPPING BY ID ===== //
  async removeMappingByMappingID(id: number) {
    return fetch(this.adress + "/removeMappingByMappingID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE ANALYSIS BY ID ===== //
  async removeAnalysisByAnalysisID(id: number) {
    return fetch(this.adress + "/removeAnalysisByAnalysisID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD NEW BOOKMARK ===== //
  async addNewBookmark(userID: number, assemblyID: number) {
    return fetch(
      this.adress +
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
  async removeBookmark(userID: number, assemblyID: number) {
    return fetch(
      this.adress +
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
  async reloadTaxonIDsFromFile(userID: number) {
    return fetch(
      this.adress + "/reloadTaxonIDsFromFile?userID=" + userID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== UPDATE TAXA TREE ===== //
  async updateTaxonTree() {
    return fetch(this.adress + "/updateTaxonTree")
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH TAXA TREE ===== //
  async fetchTaxonTree() {
    return fetch(this.adress + "/fetchTaxonTree")
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }
}

export interface IResponse<T = any>{
  payload: T;
  notification: any;
}