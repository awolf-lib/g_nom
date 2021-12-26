import classNames from "classnames";
import { Save, Trash, Edit, FormClose } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteUserByUserID,
  fetchAllUsers,
  fetchUsers,
  updateUserRoleByUserID,
} from "../../../../../../api";
import { useNotification } from "../../../../../../components/NotificationProvider";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";

const ManageUserForm = () => {
  const loggedInUserID = parseInt(sessionStorage.getItem("userID"));

  const [users, setUsers] = useState();
  const [toggleSelectRole, setToggleSelectRole] = useState(false);
  const [userRole, setUserRole] = useState(false);
  const [toggleDeleteUserConfirmation, setToggleDeleteUserConfirmation] = useState(false);
  const [deleteUserConfirmation, setDeleteUserConfirmation] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setFetching(true);
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    const response = await fetchUsers(userID, token);

    if (response && response.payload) {
      setUsers(response.payload);
    }

    if (response && response.notification && response.notification.length > 0) {
      response.notification.map((not) => handleNewNotification(not));
    }
    setTimeout(() => setFetching(false), 750);
  };

  const handleDeleteUser = async (id, confirmation) => {
    if (id !== loggedInUserID) {
      if (confirmation === "REMOVE") {
        const userID = JSON.parse(sessionStorage.getItem("userID") || "");
        const token = JSON.parse(sessionStorage.getItem("token") || "");
        const response = await deleteUserByUserID(id, userID, token);

        if (response && response.notification && response.notification.length > 0) {
          response.notification.map((not) => handleNewNotification(not));
        }

        setToggleDeleteUserConfirmation(0);
        loadData();
      }
    }
  };

  const handleSaveNewUserRole = async (id) => {
    if (id !== loggedInUserID) {
      const userID = JSON.parse(sessionStorage.getItem("userID") || "");
      const token = JSON.parse(sessionStorage.getItem("token") || "");
      const response = await updateUserRoleByUserID(id, userRole, userID, token);

      if (response && response.notification && response.notification.length > 0) {
        response.notification.map((not) => handleNewNotification(not));
      }

      loadData();
    }
  };

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const rowClass = classNames("border hover:text-blue-500 transition duration-300");
  const elementClass = classNames("h-20 truncate");

  const inputClass = classNames(
    "min-w-min border rounded-lg ml-4 px-4 py-1 shadow focus:outline-none text-center text-xs hover:ring-2 focus:ring-2 transition duration-500"
  );

  return (
    <div className="rounded-lg overflow-hidden max-h-50 shadow-lg">
      <table className="w-full text-center table-auto text-xs md:text-base">
        <thead>
          <tr className="bg-indigo-200">
            <th className={"hidden md:table-cell w-16 " + elementClass}>ID</th>
            <th className={"pl-4 md:pl-0 " + elementClass}>User</th>
            <th className={elementClass}>
              <div className="flex justify-center items-center">
                <div
                  onClick={() => setToggleSelectRole(!toggleSelectRole)}
                  className="p-1 bg-indigo-100 border border-gray-700 border-dashed text-gray-700 flex items-center rounded-lg hover:bg-gray-600 hover:text-white cursor-pointer mr-4 transition duration-300"
                >
                  <Edit size="small" color="blank" className="stroke-current" />
                </div>
                <div>Role</div>
              </div>
            </th>
            <th className={elementClass}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {!fetching && users?.length > 0 ? (
            users.map((user) => {
              return (
                <tr key={user.id} className={rowClass}>
                  <td className={"hidden md:table-cell w-16 " + elementClass}>{user.id}</td>
                  <td className={"pl-4 md:pl-0 " + elementClass}>{user.username}</td>
                  <td className={elementClass}>
                    {toggleSelectRole ? (
                      <div className="flex justify-center items-center">
                        <select
                          onChange={(e) => setUserRole(e.target.value)}
                          value={userRole || user.userRole}
                          className={inputClass}
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                        <div
                          onClick={() => {
                            if (user.id !== loggedInUserID) {
                              handleSaveNewUserRole(user.id);
                            } else {
                              handleNewNotification({
                                label: "Error",
                                message: "You cannot update the role of the current user!",
                                type: "error",
                              });
                            }
                          }}
                          className="flex bg-green-100 hover:bg-green-600 p-2 rounded-full justify-center items-center text-green-600 hover:text-green-200 cursor-pointer ml-4 transition duration-500"
                        >
                          <Save size="small" color="blank" className="stroke-current" />
                        </div>
                      </div>
                    ) : (
                      <div>{user.userRole}</div>
                    )}
                  </td>
                  <td className={elementClass}>
                    {toggleDeleteUserConfirmation !== user.id ? (
                      <div className="flex justify-center">
                        <div className="">
                          <div
                            onClick={() => {
                              if (user.id !== loggedInUserID) {
                                setToggleDeleteUserConfirmation(user.id);
                              } else {
                                handleNewNotification({
                                  label: "Error",
                                  message: "You cannot delete the current user!",
                                  type: "error",
                                });
                              }
                            }}
                            className="p-2 bg-red-100 text-red-600 flex items-center rounded-full hover:bg-red-600 hover:text-white cursor-pointer transition duration-500"
                          >
                            <Trash size="small" color="blank" className="stroke-current" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <input
                          value={deleteUserConfirmation}
                          placeholder="Type REMOVE..."
                          className={inputClass}
                          onChange={(e) => {
                            setDeleteUserConfirmation(e.target.value);
                            handleDeleteUser(user.id, e.target.value);
                          }}
                        />
                        <FormClose
                          color="blank"
                          className="ml-1 md:ml-4 stroke-current cursor-pointer text-gray-700 hover:text-red-600"
                          onClick={() => setToggleDeleteUserConfirmation(0)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className={rowClass}>
              <td className={elementClass} colSpan={4}>
                {fetching ? (
                  <div className="flex justify-center items-center">
                    <LoadingSpinner label="Fetching users..." />
                  </div>
                ) : (
                  "No items!"
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUserForm;
