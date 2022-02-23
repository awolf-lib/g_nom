import { useState } from "react";
import PropTypes from "prop-types";
import "../../../../App.css";

import Button from "../../../../components/Button";

import { login } from "../../../../api";

import DNA from "../../../../images/DNA.gif";
import { useNotification } from "../../../../components/NotificationProvider";
import Input from "../../../../components/Input";

const Login = ({ setToken, setUserID, setUserRole, setUserName }) => {
  const [name, setName] = useState();
  const [password, setPassword] = useState();

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(name, password).then((response) => {
      if (response) {
        if (response.payload?.token) {
          setUserID(response.payload.userID);
          setUserRole(response.payload.role);
          setUserName(response.payload.userName);
          setToken(response.payload.token);
        }
        if (response && response.notification && response.notification.length > 0) {
          response.notification.map((not) => handleNewNotification(not));
        }
      } else {
        handleNewNotification({
          label: "Error",
          message: "Something went wrong!",
          type: "error",
        });
        setToken("");
      }
    });
  };

  return (
    <div className="flex justify-center w-full items-center bg-gradient-to-tr from-gray-900 via-gray-500 to-gray-700 h-screen">
      {/* <div
        style={{ maxWidth: "90vh" }}
        className="bg-transparent rounded-full transform rotate-90 overflow-hidden object-contain border-4 border-double border-gray-300"
      >
        <img alt="Login DNA GIF" src={DNA} />
      </div> */}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="bg-gradient-to-tr z-20 w-1/2 from-gray-300 via-gray-100 to-gray-200 px-16 py-8 rounded-lg shadow border-4 border-gray-300 border-double"
      >
        <h1 className="font-bold">Login to G-nom ...</h1>
        <hr className="my-4 shadow" />
        <div className="flex justify-between items-center">
          <div className="mr-8 font-semiboldtext-left py-2 py-0 w-32">Username:</div>
          <Input placeholder="Username..." onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="mr-8 font-semiboldtext-left py-2 py-0 w-32">Password:</div>
          <Input
            placeholder="Password..."
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <hr className="my-4 shadow" />
        <div className="w-full">
          <div>
            <Button label="Login" size="sm" type="submit" />
          </div>
        </div>
      </form>
    </div>
  );
};

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Login;
