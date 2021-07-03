import React, { useState } from "react";
import PropTypes from "prop-types";
import "../../../../App.css";

import Button from "../../../../components/Button";

import API from "../../../../api/genomes";

import treeOfLife from "../../../../images/loginToL.jpg";

export default function Login({ setToken, setUserID, setUserRole }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  let api = new API();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await api.login(username, password);
    if (response && response.payload && response.payload.token) {
      setToken(response.payload.token);
      setUserID(response.payload.userID);
      sessionStorage.setItem("userName", JSON.stringify(username));
      setUserRole(response.payload.role);
    } else {
      setToken("");
    }
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
          <input
            className="w-full border rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username..."
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="mr-8 font-semibold text-center lg:text-left py-2 lg:py-0 w-32">
            Password:
          </div>
          <input
            className=" w-full border rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
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
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};
