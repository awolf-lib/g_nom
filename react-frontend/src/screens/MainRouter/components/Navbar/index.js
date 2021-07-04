import React, { Component } from "react";
import "../../../../App.css";
import { Link } from "react-router-dom";

import TBGLogo from "../../../../images/TBGLogo.svg";
import BlankProfilePicture from "../../../../images/blankProfilePicture.png";
import Button from "../../../../components/Button";

class Navbar extends Component {
  constructor(props) {
    super();
    this.state = {
      profileDropdownVisible: false,
      mobileMenuDropdownVisible: false,
    };

    this.setProfileDropdownVisible = this.setProfileDropdownVisible.bind(this);
    this.setMobileMenuDropdownVisible = this.setMobileMenuDropdownVisible.bind(
      this
    );
  }

  setProfileDropdownVisible() {
    this.setState({
      profileDropdownVisible: !this.state.profileDropdownVisible,
    });
  }

  setMobileMenuDropdownVisible() {
    this.setState({
      mobileMenuDropdownVisible: !this.state.mobileMenuDropdownVisible,
    });
  }

  render() {
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
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link to="/g-nom/dashboard">
                    <Button label="Dashboard" color="nav" />
                  </Link>
                  <Link to="/g-nom/assemblies">
                    <Button label="Assemblies" color="nav" />
                  </Link>
                  <Link to="/g-nom/tools">
                    <Button label="Tools" color="nav" />
                  </Link>
                  <a
                    href="http://localhost:5003/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button label="Downloads" color="nav" />
                  </a>
                </div>
              </div>
            </div>

            {/* BELL & PROFILEPICTURE */}
            <div className="hidden lg:block">
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
                      onClick={() => this.setProfileDropdownVisible()}
                    >
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={BlankProfilePicture}
                        alt=""
                      />
                    </button>
                  </div>

                  {/* PROFILEPICTURE DROPDOWN */}
                  {this.state.profileDropdownVisible && (
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
                        onClick={() => this.setProfileDropdownVisible()}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/g-nom/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => this.setProfileDropdownVisible()}
                      >
                        Settings
                      </Link>
                      <Link
                        to="/logout"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => this.setProfileDropdownVisible()}
                      >
                        Sign out
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MOBILE MENU DROPDOWN BUTTON */}
            <div className="-mr-2 flex md:hidden">
              <button
                type="button"
                className="bg-gray-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => this.setMobileMenuDropdownVisible()}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className="hidden h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE NAVBAR DROPDOWN */}
        <div className="lg:hidden" id="mobile-menu">
          {this.state.mobileMenuDropdownVisible && (
            <div className="flex justify-around py-4">
              <Link to="/g-nom/dashboard">
                <Button label="Dashboard" color="nav" />
              </Link>
              <Link to="/g-nom/assemblies">
                <Button label="Assemblies" color="nav" />
              </Link>
              <Link to="/g-nom/tools">
                <Button label="Tools" color="nav" />
              </Link>
              <a href="http://localhost:5003/" target="_blank" rel="noreferrer">
                <Button label="Downloads" color="nav" />
              </a>
            </div>
          )}

          {/* MOBILE MENU PROFILE PICTURE + NAME + EMAIL */}
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full cursor-pointer"
                  src={BlankProfilePicture}
                  alt=""
                  onClick={() => this.setProfileDropdownVisible()}
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-gray-600">
                  User
                </div>
                <div className="text-sm font-medium leading-none text-gray-500">
                  user@example.com
                </div>
              </div>
            </div>

            {/* MOBILE MENU PROFILEPICTURE DROPDOWN */}
            {this.state.profileDropdownVisible && (
              <div className="flex justify-around pt-4">
                <Link
                  to="/g-nom/profile"
                  role="menuitem"
                  onClick={() => this.setProfileDropdownVisible()}
                >
                  <Button label="Profile" color="nav" />
                </Link>
                <Link
                  to="/g-nom/settings"
                  role="menuitem"
                  onClick={() => this.setProfileDropdownVisible()}
                >
                  <Button label="Settings" color="nav" />
                </Link>
                <Link
                  to="/logout"
                  role="menuitem"
                  onClick={() => this.setProfileDropdownVisible()}
                >
                  <Button label="Sign out" color="nav" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
