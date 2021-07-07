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
  async fetchAllAssemblies(page = 1, range = 10, search = "", link = "") {
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
        search
    )
      .then((request) => request.json())
      .then((data) => data)
      .catch((error) => {
        console.error(error);
      });
  }
}
