import React, { useState } from "react";
import classNames from "classnames";

import Button from "../../../../../../components/Button";
import { addUser } from "../../../../../../api";
import { useNotification } from "../../../../../../components/NotificationProvider";

const AddUserForm = () => {
  const loggedInRole = sessionStorage.getItem("userRole");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const handleSubmitNewUser = async () => {
    setSubmitted(true);
    if (
      username &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      (role === "admin" || role === "user")
    ) {
      const response = await addUser(username, password, role);
      if (response?.notification) {
        handleNewNotification(response.notification);
      }
    } else {
      if (!username) {
        handleNewNotification({
          label: "Missing username",
          message: "Add username before submitting!",
          type: "error",
        });
      }
      if (!password) {
        handleNewNotification({
          label: "Missing password",
          message: "Add password before submitting!",
          type: "error",
        });
      }
      if (password && password !== confirmPassword) {
        handleNewNotification({
          label: "Wrong confirmation",
          message: "Password confirmation does not match password!",
          type: "error",
        });
      }
      if (!role) {
        handleNewNotification({
          label: "Missing role",
          message: "Add role before submitting!",
          type: "error",
        });
      }
    }
  };

  const fieldClass = classNames(
    "flex justify-between text-sm md:text-base my-2 border-1 shadow px-4 py-3 items-center rounded-lg bg-gray-100 hover:text-blue-700 transition duration-300"
  );
  const labelClass = classNames("truncate");
  const inputClass = (submitted, condition) =>
    classNames(
      "border rounded-lg ml-4 px-4 py-1 shadow focus:outline-none w-32 md:w-48 hover:ring-2 transition duration-500 focus:ring-2",
      {
        "border-red-600": submitted && condition,
        "border-green-600": submitted && !condition,
      }
    );
  return (
    loggedInRole === '"admin"' && (
      <div className="border p-6 rounded-lg shadow-lg bg-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Add user:</h1>
          <div>
            <Button
              label="Submit"
              size="sm"
              onClick={() =>
                handleSubmitNewUser(username, password, confirmPassword, role)
              }
            />
          </div>
        </div>
        <hr className="mt-2 mb-8 shadow" />
        <div className="">
          <div className={fieldClass}>
            <label for="username" className={labelClass}>
              Username
            </label>
            <input
              id="username"
              onChange={(e) => {
                setSubmitted(false);
                setUsername(e.target.value);
              }}
              className={inputClass(submitted, username === "")}
            />
          </div>
          <div className={fieldClass}>
            <label for="role" className={labelClass}>
              Role
            </label>
            <select
              id="role"
              onChange={(e) => {
                setSubmitted(false);
                setRole(e.target.value);
              }}
              className={inputClass(submitted, role === "")}
            >
              <option value="">None</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className={fieldClass}>
            <label for="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              onChange={(e) => {
                setSubmitted(false);
                setPassword(e.target.value);
              }}
              className={inputClass(
                submitted,
                password === "" || password !== confirmPassword
              )}
              type="password"
            />
          </div>
          <div className={fieldClass}>
            <label for="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              onChange={(e) => {
                setSubmitted(false);
                setConfirmPassword(e.target.value);
              }}
              className={inputClass(
                submitted,
                confirmPassword === "" || password !== confirmPassword
              )}
              type="password"
            />
          </div>
        </div>
      </div>
    )
  );
};

export default AddUserForm;
