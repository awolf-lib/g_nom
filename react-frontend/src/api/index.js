export default class API {
  // USER AUTHENTIFCATION
  async login(username, password) {
    return fetch("http://localhost:3002/login", {
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
  async fetchAllUsers() {
    return fetch("http://localhost:3002/fetchAllUsers")
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== DELETE USER BY USER ID ===== //
  async deleteUserByUserID(userID) {
    return fetch("http://localhost:3002/deleteUserByUserID?userID=" + userID)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== UPDATE USER ROLE BY USER ID ===== //
  async updateUserRoleByUserID(userID, role) {
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
  async fetchAssemblyInformationByAssemblyID(id, userID) {
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
  async fetchPossibleImports(types = undefined) {
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

  // ===== FETCH ONE TAXON BY NCBI TAXON ID ===== //
  async fetchTaxonByNCBITaxonID(taxonID) {
    return fetch(
      "http://localhost:3002/fetchTaxonByNCBITaxonID?taxonID=" + taxonID
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
  async removeImageByTaxonID(taxonID, userID) {
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
  async fetchGeneralInfosByID(level, id) {
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
  async addGeneralInfo(level, id, key, value) {
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
  async updateGeneralInfoByID(level, id, key, value) {
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
  async removeGeneralInfoByID(level, id) {
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
  async addNewAssembly(taxonID, name, path, userID, additionalFilesPath = "") {
    return fetch(
      "http://localhost:3002/addNewAssembly?taxonID=" +
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
    return fetch("http://localhost:3002/removeAssemblyByAssemblyID?id=" + id)
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ASSEMBLIES BY TAXON ID ===== //
  async fetchAssembliesByTaxonID(taxonID) {
    return fetch(
      "http://localhost:3002/fetchAssembliesByTaxonID?taxonID=" + taxonID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== RENAME ASSEMBLY ===== //
  async renameAssembly(id, name, userID) {
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
  async addNewAnnotation(id, name, path, userID, additionalFilesPath = "") {
    return fetch(
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
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD NEW MAPPING ===== //
  async addNewAnalysis(id, name, path, userID, additionalFilesPath = "") {
    return fetch(
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
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD NEW BOOKMARK ===== //
  async addNewBookmark(userID, assemblyID) {
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
  async removeBookmark(userID, assemblyID) {
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
}
