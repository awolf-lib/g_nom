import { useEffect } from "react";
import { Navigate } from "react-router";

export default function Logout({ setToken }) {
  useEffect(() => {
    sessionStorage.removeItem("userID");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("token");

    setToken("");
  });

  return <Navigate to="/" />;
}
