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
    const user = sessionStorage.getItem("userRole");
    const userRole = JSON.parse(user);
    return userRole;
  };
  const getUserName = () => {
    const user = sessionStorage.getItem("userName");
    const userName = JSON.parse(user);
    return userName;
  };

  const [token, setToken] = useState(getToken());
  const [userID, setUserID] = useState(getUserID());
  const [userRole, setUserRole] = useState(getUserRole());
  const [userName, setUserName] = useState(getUserName());

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
  const saveUserName = (userName) => {
    sessionStorage.setItem("userName", JSON.stringify(userName));
    setUserName(userName);
  };

  return {
    setToken: saveToken,
    setUserID: saveUserID,
    setUserRole: saveUserRole,
    setUserName: saveUserName,
    token,
    userID,
    userRole,
    userName,
  };
}
