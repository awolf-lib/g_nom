import { useEffect, useState, useRef } from "react";
import "../../../../App.css";
import { Link } from "react-router-dom";
import { Down } from "grommet-icons";

import TBGLogo from "../../../../images/TBGLogo.svg";
import Button from "../../../../components/Button";

const Navbar = () => {
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  const userRoleStorage = JSON.parse(sessionStorage.getItem("userRole") || "");
  const userNameStorage = JSON.parse(sessionStorage.getItem("userName") || "");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserRole(userRoleStorage);
  }, [userRoleStorage]);

  useEffect(() => {
    setUserName(userNameStorage);
  }, [userNameStorage]);

  useEffect(() => {
    document.addEventListener("mousedown", (e) => handleClickOutside(e));
    return document.removeEventListener("mousedown", (e) => handleClickOutside(e));
  }, []);

  const handleChangeProfileDropdownVisible = () => {
    setProfileDropdownVisible((prevState) => !prevState);
  };

  const handleClickOutside = (event: any) => {
    if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setProfileDropdownVisible(false);
    }
  };

  return (
    <nav className="sticky w-full top-0 bg-gradient-to-b from-gray-400 to-gray-100 z-40 shadow">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* LOGO */}
            <div className="flex-shrink-0">
              <img className="w-48" src={TBGLogo} alt="TBG Logo" />
            </div>

            {/* NAVBAR */}
            <div className="">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/g-nom/dashboard">
                  <Button label="Dashboard" color="nav" />
                </Link>
                <Link to="/g-nom/assemblies/list">
                  <Button label="Assemblies" color="nav" />
                </Link>
                <Link to="/g-nom/features">
                  <Button label="Features" color="nav" />
                </Link>
                {(userRole === "admin" || userRole === "user") && (
                  <Link to={"/g-nom/assemblies/data"}>
                    <Button label="Data" color="nav" />
                  </Link>
                )}
                {(userRole === "admin" || userRole === "user") && (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={process.env.REACT_APP_FILE_SERVER_ADRESS}
                  >
                    <Button label="Downloads" color="nav" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="" ref={dropdownRef}>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div>
                  <Button
                    color="link"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => handleChangeProfileDropdownVisible()}
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="rounded-full flex items-center">
                      {userName || "User"}
                      <div className="px-1 flex items-center">
                        <Down size="small" className="stroke-current" color="blank" />
                      </div>
                    </span>
                  </Button>

                  {/* PROFILEPICTURE DROPDOWN */}
                  {profileDropdownVisible && (
                    <div
                      className="animate-grow-y origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      {userRole === "admin" && (
                        <Link
                          to="/g-nom/settings"
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => handleChangeProfileDropdownVisible()}
                        >
                          Settings
                        </Link>
                      )}
                      <Link
                        to="/logout"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => handleChangeProfileDropdownVisible()}
                      >
                        Sign out
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
