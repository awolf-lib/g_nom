import { useEffect, useState } from "react";
import "../../../../App.css";
import { Link } from "react-router-dom";

import TBGLogo from "../../../../images/TBGLogo.svg";
import BlankProfilePicture from "../../../../images/blankProfilePicture.png";
import Button from "../../../../components/Button";

const Navbar = () => {
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [userRole, setUserRole] = useState("");

  const userRoleStorage = JSON.parse(sessionStorage.getItem("userRole") || "{}");

  useEffect(() => {
    setUserRole(userRoleStorage);
  }, [userRoleStorage]);

  const handleChangeProfileDropdownVisible = () => {
    setProfileDropdownVisible((prevState) => !prevState);
  };

  return (
    <nav className="sticky w-full top-0 bg-gradient-to-b from-indigo-300 to-indigo-200 z-50 shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
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
                <Link to="/g-nom/assemblies">
                  <Button label="Assemblies" color="nav" />
                </Link>
                <a
                  href={process.env.REACT_APP_NEXTCLOUD_DOWNLOAD_ADRESS}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button label="Downloads" color="nav" />
                </a>
                {userRole === "admin" && (
                  <Link to={"/g-nom/assemblies/manage"}>
                    <Button label="Import" color="nav" />
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link to="/g-nom/tools">
                    <Button label="Tools" color="nav" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* BELL & PROFILEPICTURE */}
          <div className="">
            <div className="ml-4 flex items-center md:ml-6">
              {/* PROFILEPICTURE */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-600 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => handleChangeProfileDropdownVisible()}
                  >
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src={BlankProfilePicture} alt="" />
                  </button>
                </div>

                {/* PROFILEPICTURE DROPDOWN */}
                {profileDropdownVisible && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/g-nom/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => handleChangeProfileDropdownVisible()}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/g-nom/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => handleChangeProfileDropdownVisible()}
                    >
                      Settings
                    </Link>
                    <Link
                      to="/logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    </nav>
  );
};

export default Navbar;
