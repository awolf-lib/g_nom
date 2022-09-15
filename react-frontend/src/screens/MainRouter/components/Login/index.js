import { useState } from "react";
import PropTypes from "prop-types";
import "../../../../App.css";
import Button from "../../../../components/Button";
import { login } from "../../../../api";
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

  const DnaLength = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  ];

  return (
    <div className="flex justify-around w-full h-full items-center bg-gradient-to-tr from-gray-900 via-gray-500 to-gray-700 h-screen">
      <div className="hidden lg:block h-2/3 w-1/4 overflow-hidden bg-gradient-to-tr from-gray-300 via-gray-100 to-gray-200 rounded-lg shadow border-4 border-gray-300 border-double">
        <div className="w-full h-full flex justify-center items-center relative bg-gray-300">
          <div className="rotate-45 translate-x-6">
            {DnaLength.map((element) => (
              <div
                className="line"
                style={{
                  marginTop: "15px",
                  animationDelay: element * 0.2 + "s",
                  animationDuration: "2s",
                }}
              ></div>
            ))}
          </div>
          <div className="absolute right-0 bottom-0 mx-4 my-2 border-b border-gray-400 font-semibold">
            from Sequence to Function
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e)}
        className="bg-gradient-to-tr flex justify-center items-center from-gray-300 via-gray-100 to-gray-200 px-16 py-8 rounded-lg shadow border-4 border-gray-300 border-double"
      >
        <div className="w-full">
          <h1 className="font-bold">Login into dev-version</h1>
          <hr className="my-4 shadow" />
          <div className="flex justify-between items-center">
            <div className="hidden xl:block mr-8 font-semiboldtext-left py-2 py-0 w-32">
              Username:
            </div>
            <div className="w-96">
              <Input placeholder="Username..." onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="hidden xl:block mr-8 font-semiboldtext-left py-2 py-0 w-32">
              Password:
            </div>
            <div className="w-96">
              <Input
                placeholder="Password..."
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <hr className="my-4 shadow" />
          <div className="w-full flex justify-end">
            <div className="w-32">
              <Button label="Login" size="sm" type="submit" />
            </div>
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
