export default class API {
  constructor() {
    this.adress = process.env.REACT_APP_API_ADRESS;
  }

  // USER AUTHENTIFCATION
  async login(username, password) {
    return fetch(this.adress + "/login", {
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

  // ADD NEW USER
  async addUser(username, password, role) {
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
  async deleteUserByUserID(userID) {
    return fetch(this.adress + "/deleteUserByUserID?userID=" + userID)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== UPDATE USER ROLE BY USER ID ===== //
  async updateUserRoleByUserID(userID, role) {
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
  async fetchAssemblyInformationByAssemblyID(id, userID) {
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
  async fetchPossibleImports(types = undefined) {
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
  async fetchTaxonByNCBITaxonID(taxonID) {
    return fetch(this.adress + "/fetchTaxonByNCBITaxonID?taxonID=" + taxonID)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH MULTIPLE ASSEMBLIES BY TAXON ID ===== //
  async fetchAssembliesByTaxonIDs(taxonIDs) {
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
  async updateImageByTaxonID(taxonID, path, userID) {
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
  async removeImageByTaxonID(taxonID, userID) {
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
  async fetchGeneralInfosByID(level, id) {
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
  async addGeneralInfo(level, id, key, value) {
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
  async updateGeneralInfoByID(level, id, key, value) {
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
  async removeGeneralInfoByID(level, id) {
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
  async addNewAssembly(taxonID, name, path, userID, additionalFilesPath = "") {
    return fetch(
      this.adress +
        "/addNewAssembly?taxonID=" +
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
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE ASSEMBLY ===== //
  async removeAssemblyByAssemblyID(id) {
    return fetch(this.adress + "/removeAssemblyByAssemblyID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ASSEMBLIES BY TAXON ID ===== //
  async fetchAssembliesByTaxonID(taxonID) {
    return fetch(this.adress + "/fetchAssembliesByTaxonID?taxonID=" + taxonID)
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
  async addNewAnnotation(id, name, path, userID, additionalFilesPath = "") {
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
  async addNewMapping(id, name, path, userID, additionalFilesPath = "") {
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
  async fetchMappingsByAssemblyID(assemblyID) {
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
  async fetchAnnotationsByAssemblyID(assemblyID) {
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
  async fetchAnalysesByAssemblyID(assemblyID) {
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
  async addNewAnalysis(id, name, path, userID, additionalFilesPath = "") {
    return fetch(
      this.adress +
        "/addNewAnalysis?id=" +
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

  // ===== REMOVE ANNOTATION BY ID ===== //
  async removeAnnotationByAnnotationID(id) {
    return fetch(this.adress + "/removeAnnotationByAnnotationID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE MAPPING BY ID ===== //
  async removeMappingByMappingID(id) {
    return fetch(this.adress + "/removeMappingByMappingID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE ANALYSIS BY ID ===== //
  async removeAnalysisByAnalysisID(id) {
    return fetch(this.adress + "/removeAnalysisByAnalysisID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD NEW BOOKMARK ===== //
  async addNewBookmark(userID, assemblyID) {
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
  async removeBookmark(userID, assemblyID) {
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
  async reloadTaxonIDsFromFile(userID) {
    return fetch(this.adress + "/reloadTaxonIDsFromFile?userID=" + userID)
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
