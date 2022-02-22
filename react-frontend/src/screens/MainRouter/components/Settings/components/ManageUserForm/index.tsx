import classNames from "classnames";
import { Save, Trash, Edit, FormClose } from "grommet-icons";
import { useEffect, useState } from "react";
import {
  deleteUserByUserID,
  fetchUsers,
  IUser,
  NotificationObject,
  updateUserRoleByUserID,
} from "../../../../../../api";
import { useNotification } from "../../../../../../components/NotificationProvider";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";

const ManageUserForm = () => {
  const loggedInUserID = parseInt(sessionStorage.getItem("userID") || "");

  const [users, setUsers] = useState<IUser[]>();
  const [userRole, setUserRole] = useState<"admin" | "user" | "viewer" | "">("");
  const [toggleDeleteUserConfirmation, setToggleDeleteUserConfirmation] = useState<number>(-1);
  const [toggleUpdateUserConfirmation, setToggleUpdateUserConfirmation] = useState<number>(-1);
  const [deleteUserConfirmation, setDeleteUserConfirmation] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(false);

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

  const handleDeleteUser = async (id: number, confirmation: string) => {
    if (id !== loggedInUserID) {
      if (confirmation === "REMOVE") {
        const userID = JSON.parse(sessionStorage.getItem("userID") || "");
        const token = JSON.parse(sessionStorage.getItem("token") || "");
        const response = await deleteUserByUserID(id, userID, token);

        if (response && response.notification && response.notification.length > 0) {
          response.notification.map((not) => handleNewNotification(not));
        }

        setToggleDeleteUserConfirmation(-1);
        loadData();
        setDeleteUserConfirmation("");
      }
    }
  };

  const handleSaveNewUserRole = async (id: number) => {
    if (id !== loggedInUserID) {
      const userID = JSON.parse(sessionStorage.getItem("userID") || "");
      const token = JSON.parse(sessionStorage.getItem("token") || "");

      if (id && userID && userRole && token) {
        const response = await updateUserRoleByUserID(id, userRole, userID, token);

        if (response && response.notification && response.notification.length > 0) {
          response.notification.map((not) => handleNewNotification(not));
        }

        loadData();
      }
    }
  };

  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const rowClass = classNames("border hover:text-blue-500 transition duration-300");
  const elementClass = classNames("h-20 truncate");

  const inputClass = classNames(
    "border rounded-lg ml-4 px-4 py-1 shadow focus:outline-none text-center text-xs hover:ring-2 focus:ring-2 transition duration-500"
  );

  return (
    <div className="rounded-lg overflow-y-auto overflow-x-hidden max-h-75 shadow-lg">
      <table className="w-full text-center table-fixed text-xs">
        <thead>
          <tr className="bg-gray-300">
            <th className="px-8 py-4">ID</th>
            <th className="w-full">User</th>
            <th className="w-64">
              <div className="flex justify-center items-center">
                <div>Role</div>
              </div>
            </th>
            <th className="w-96">Options</th>
          </tr>
        </thead>
        <tbody>
          {!fetching && users && users.length > 0 ? (
            users.map((user) => {
              return (
                <tr key={user.id} className={rowClass}>
                  <td>
                    <div className="px-8 py-4 animate-fade-in">{user.id}</div>
                  </td>
                  <td>
                    <div className="w-full animate-fade-in">{user.username}</div>
                  </td>
                  <td>
                    <div className="w-64 animate-fade-in">
                      {toggleUpdateUserConfirmation === user.id ? (
                        <div className="flex justify-center items-center">
                          <select
                            onChange={(e) =>
                              setUserRole(e.target.value as "admin" | "user" | "viewer")
                            }
                            value={userRole || user.userRole}
                            className={inputClass}
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
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
                        <div className="animte-fade-in">{user.userRole}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    {loggedInUserID !== user.id && user.id !== 1 && user.id !== 2 ? (
                      <div className="w-96 animate-fade-in">
                        {toggleDeleteUserConfirmation !== user.id &&
                          toggleUpdateUserConfirmation !== user.id && (
                            <div className="flex justify-center">
                              <div
                                onClick={() => {
                                  setToggleUpdateUserConfirmation(user.id);
                                  setToggleDeleteUserConfirmation(-1);
                                }}
                                className="mx-2 p-2 bg-blue-100 text-blue-600 flex items-center rounded-full hover:bg-blue-600 hover:text-white cursor-pointer transition duration-500"
                              >
                                <Edit size="small" color="blank" className="stroke-current" />
                              </div>
                              <div
                                onClick={() => {
                                  setToggleDeleteUserConfirmation(user.id);
                                  setToggleUpdateUserConfirmation(-1);
                                }}
                                className="mx-2 p-2 bg-red-100 text-red-600 flex items-center rounded-full hover:bg-red-600 hover:text-white cursor-pointer transition duration-500"
                              >
                                <Trash size="small" color="blank" className="stroke-current" />
                              </div>
                            </div>
                          )}
                        {toggleDeleteUserConfirmation === user.id && (
                          <div className="flex justify-center items-center animate-fade-in">
                            <input
                              value={deleteUserConfirmation}
                              placeholder="Type REMOVE..."
                              className={inputClass}
                              onChange={(e) => {
                                setDeleteUserConfirmation(e.target.value);
                                handleDeleteUser(user.id, e.target.value);
                              }}
                            />
                            <div className="ml-2 flex justify-center items-center animate-fade-in">
                              <div
                                className="bg-red-100 text-red-600 flex items-center rounded-full hover:bg-red-600 hover:text-white cursor-pointer transition duration-500"
                                onClick={() => {
                                  setToggleDeleteUserConfirmation(-1);
                                  setDeleteUserConfirmation("");
                                }}
                              >
                                <FormClose
                                  color="blank"
                                  className="stroke-current cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {toggleUpdateUserConfirmation === user.id && (
                          <div className="flex justify-center items-center animate-fade-in">
                            <div
                              className="bg-red-100 text-red-600 flex items-center rounded-full hover:bg-red-600 hover:text-white cursor-pointer transition duration-500"
                              onClick={() => {
                                setToggleUpdateUserConfirmation(-1);
                                setUserRole("");
                              }}
                            >
                              <FormClose color="blank" className="stroke-current cursor-pointer" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-fade-in">Cannot be modified!</div>
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
