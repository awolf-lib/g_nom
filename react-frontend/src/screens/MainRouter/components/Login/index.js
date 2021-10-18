import { useState } from "react";
import PropTypes from "prop-types";
import "../../../../App.css";

import Button from "../../../../components/Button";

import {login} from "../../../../api";

import treeOfLife from "../../../../images/loginToL.jpg";
import { useNotification } from "../../../../components/NotificationProvider";
import Input from "../../../../components/Input";

const Login = ({ setToken, setUserID, setUserRole }) => {
  const [username, setUserName] = useState();
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
    login(username, password).subscribe(response => {
      if (response) {
        if (response.payload?.token) {
          setToken(response.payload.token);
          setUserID(response.payload.userID);
          setUserRole(response.payload.role);
        }
        if (response.notification) {
          handleNewNotification(response.notification);
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
    <div className="lg:fixed lg:inset-0 block lg:flex lg:justify-around w-full items-center p-8">
      <div className="hidden lg:block lg:w-4/12 opacity-60 animate-spin-slow rounded-full object-contain">
        <img alt="Login Tree of Life" src={treeOfLife} />
      </div>
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="bg-gradient-to-t lg:w-5/12 from-gray-200 via-white to-white px-16 py-8 rounded-lg shadow-lg border-2"
      >
        <h1 className="font-bold">Login to G-nom ...</h1>
        <hr className="my-4 shadow" />
        <div className="flex justify-between items-center">
          <div className="mr-8 font-semibold text-center lg:text-left py-2 lg:py-0 w-32">
            Username:
          </div>
          <Input
            placeholder="Username..."
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="mr-8 font-semibold text-center lg:text-left py-2 lg:py-0 w-32">
            Password:
          </div>
          <Input
            placeholder="Password..."
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <hr className="my-4 shadow" />
        <div className="lg:flex lg:justify-end w-full">
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
