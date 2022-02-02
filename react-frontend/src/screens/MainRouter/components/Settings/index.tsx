import { Down, Up } from "grommet-icons";
import { useState } from "react";
import AddUserForm from "./components/AddUserForm";
import ManageUserForm from "./components/ManageUserForm";

const Settings = () => {
  const [toggleSection, setToggleSection] = useState(0);

  const userRole = JSON.parse(sessionStorage.getItem("userRole") || "");

  return (
    <div className="mb-16">
      <div>
        {userRole === "admin" && (
          <div>
            <div
              onClick={() => setToggleSection(toggleSection === 1 ? 0 : 1)}
              className="m-4 p-4 rounded-lg bg-gray-700 flex justify-between items-center text-white hover:bg-gray-600 hover:text-gray-200 cursor-pointer transition duration-500"
            >
              <div className="font-bold text-xl select-none">Manage users...</div>
              {toggleSection !== 1 ? (
                <Down color="blank" className="stroke-current" />
              ) : (
                <Up color="blank" className="stroke-current" />
              )}
            </div>
            {toggleSection === 1 && (
              <div className="animate-grow-y">
                <hr className="mx-8 my-4 shadow" />
                <div className="p-4 grid grid-cols-3 gap-8">
                  <AddUserForm />
                  <div className="mt-0 col-span-2">
                    <ManageUserForm />
                  </div>
                </div>
              </div>
            )}
            <hr className="mx-8 my-4 shadow" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
