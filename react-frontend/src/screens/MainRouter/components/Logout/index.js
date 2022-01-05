import { useEffect } from "react";
import { Navigate } from "react-router";
import { logout } from "../../../../api";
import { useNotification } from "../../../../components/NotificationProvider";

export default function Logout({ setToken }) {
  useEffect(() => {
    handleLogout();

    sessionStorage.removeItem("userID");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("token");

    setToken("");
  });

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleLogout = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    await logout(userID, token).then((response) => {
      if (response?.notification) {
        response.notification.forEach((not) => handleNewNotification(not));
      }
    });
  };

  return <Navigate to="/" />;
}
