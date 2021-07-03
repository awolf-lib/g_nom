import { useState } from "react";

export default function useToken() {
  const getToken = () => {
    const tokenString = sessionStorage.getItem("token");
    const userToken = JSON.parse(tokenString);
    return userToken;
  };
  const getUserID = () => {
    const user = sessionStorage.getItem("userID");
    const userID = JSON.parse(user);
    return userID;
  };
  const getUserRole = () => {
    const user = sessionStorage.getItem("UserRole");
    const UserRole = JSON.parse(user);
    return UserRole;
  };

  const [token, setToken] = useState(getToken());
  const [userID, setUserID] = useState(getUserID());
  const [userRole, setUserRole] = useState(getUserRole());

  const saveToken = (userToken) => {
    sessionStorage.setItem("token", JSON.stringify(userToken));
    setToken(userToken);
  };
  const saveUserID = (userID) => {
    sessionStorage.setItem("userID", JSON.stringify(userID));
    setUserID(userID);
  };
  const saveUserRole = (UserRole) => {
    sessionStorage.setItem("userRole", JSON.stringify(UserRole));
    setUserRole(UserRole);
  };

  return {
    setToken: saveToken,
    setUserID: saveUserID,
    setUserRole: saveUserRole,
    token,
    userID,
    userRole,
  };
}
