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

  // ===== CREATE DIRECTORY STRUCTURE FOR ONE ASSEMBLY ===== //
  async createDirectoriesForSpecies(assemblyID) {
    return fetch(
      "http://localhost:3002/createDirectoriesForSpecies?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL POSSIBLE FILES FOR IMPORT ===== //
  async fetchFilesInImportDirectory() {
    return fetch("http://localhost:3002/fetchFilesInImportDirectory")
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE DIRECTORY STRUCTURE FOR ONE ASSEMBLY ===== //
  async removeDirectoriesForSpecies(assemblyID) {
    return fetch(
      "http://localhost:3002/removeDirectoriesForSpecies?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE ASSEMBLY FROM DATABASE ===== //
  async removeAssembly(assemblyID) {
    return fetch(
      "http://localhost:3002/removeAssembly?assemblyID=" + assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD ASSEMBLY ===== //
  async addAssembly(assemblyID, assemblyName, taxonID) {
    return fetch(
      "http://localhost:3002/addAssembly?assemblyID=" +
        assemblyID +
        "&assemblyName=" +
        assemblyName +
        "&taxonID=" +
        taxonID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL ASSEMBLIES ===== //
  async fetchAllAssemblies() {
    return fetch("http://localhost:3002/fetchAllAssemblies")
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH IMAGE FOR TAXON ===== //
  async fetchImageByTaxonID(taxonID) {
    return fetch("http://localhost:3002/fetchImageByTaxonID?taxonID=" + taxonID)
      .then((request) => request.blob())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH SCIENTIFIC NAME BY TAXON ID ===== //
  async fetchScientificNameByTaxonID(taxonID) {
    return fetch(
      "http://localhost:3002/fetchScientificNameByTaxonID?taxonID=" + taxonID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL ASSEMBLIES BY TAXON ID ===== //
  async fetchAssembliesByTaxonID(taxonID) {
    return fetch(
      "http://localhost:3002/fetchAssembliesByTaxonID?taxonID=" + taxonID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ALL GENERAL INFOS BY TAXON ID ===== //
  async fetchGeneralInfosByTaxonID(taxonID) {
    return fetch(
      "http://localhost:3002/fetchGeneralInfosByTaxonID?taxonID=" + taxonID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ASSEMBLY NAME, ID ===== //
  async fetchAssemblyByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchAssemblyByAssemblyID?assemblyID=" + assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH BUSCO DATA ===== //
  async fetchBuscoDataByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchBuscoDataByAssemblyID?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH FCAT DATA ===== //
  async fetchFcatDataByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchFcatDataByAssemblyID?assemblyID=" + assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH REPEATMASKER DATA ===== //
  async fetchRepeatmaskerDataByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchRepeatmaskerDataByAssemblyID?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH MILTS DATA ===== //
  async fetchMiltsDataByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchMiltsDataByAssemblyID?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== IMPORT FILE ===== //
  async importFromFile(assemblyID, path, type, analysisName, directorypath) {
    return fetch(
      "http://localhost:3002/importFromFile?assemblyID=" +
        assemblyID +
        "&filepath=" +
        path +
        "&type=" +
        type +
        "&directorypath=" +
        directorypath +
        "&analysisName=" +
        analysisName
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD GENERAL INFO ===== //
  async addGeneralInfo(taxonID, keyword, info, category = "") {
    return fetch(
      "http://localhost:3002/addGeneralInfo?taxonID=" +
        taxonID +
        "&keyword=" +
        keyword +
        "&info=" +
        info +
        "&category=" +
        category
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE GENERAL INFO ===== //
  async removeGeneralInfo(taxonID, keyword, info, category = "") {
    return fetch(
      "http://localhost:3002/removeGeneralInfo?taxonID=" +
        taxonID +
        "&keyword=" +
        keyword +
        "&info=" +
        info +
        "&category=" +
        category
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ASSEMBLY INFOS ===== //
  async fetchAssemblyInfosByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchAssemblyInfosByAssemblyID?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH ASSEMBLY PLOTS ===== //
  async fetchAssemblyPlotsByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchAssemblyPlotsByAssemblyID?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH IMAGE BY PATH ===== //
  async fetchImageByPath(path) {
    return fetch("http://localhost:3002/fetchImageByPath?path=" + path)
      .then((request) => request.blob())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH PATH TO FULL QUAST REPORT BY ASSEMBLY ID ===== //
  async fetchPathToFullQuastReportByAssemblyID(assemblyID) {
    return fetch(
      "http://localhost:3002/fetchPathToFullQuastReportByAssemblyID?assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH SUBSCRIPTIONS ===== //
  async fetchSubscriptionsByUserID(userID) {
    return fetch(
      "http://localhost:3002/fetchSubscriptionsByUserID?userID=" + userID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== FETCH SUBSCRIPTIONS WITH DETAILS ===== //
  async fetchSubscriptedAssemblyInformationByUserID(userID) {
    return fetch(
      "http://localhost:3002/fetchSubscriptedAssemblyInformationByUserID?userID=" +
        userID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== ADD SUBSCRIPTION ===== //
  async addSubscriptionByAssemblyID(userID, assemblyID) {
    return fetch(
      "http://localhost:3002/addSubscriptionByAssemblyID?userID=" +
        userID +
        "&assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // ===== REMOVE SUBSCRIPTION BY ASSEMBLY ID ===== //
  async removeSubscriptionByAssemblyID(userID, assemblyID) {
    return fetch(
      "http://localhost:3002/removeSubscriptionByAssemblyID?userID=" +
        userID +
        "&assemblyID=" +
        assemblyID
    )
      .then((request) => request.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
