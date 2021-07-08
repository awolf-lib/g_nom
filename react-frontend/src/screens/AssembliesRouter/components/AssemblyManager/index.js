import React, { useEffect, useState } from "react";
import API from "../../../../api";
import { useNotification } from "../../../../components/NotificationProvider";
import { New, Add, Edit, Trash } from "grommet-icons";

import LoadingSpinner from "../../../../components/LoadingSpinner";
import Button from "../../../../components/Button";

const AssemblyManager = () => {
  const [actionsHeader, setActionHeader] = useState(
    "What would you like to do?"
  );
  const [possibleImports, setPossibleImports] = useState([]);
  const [fetching, setFetching] = useState(false);

  const api = new API();

  useEffect(() => {
    //loadFiles();
  }, []);

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadFiles = async () => {
    setFetching(true);
    const response = await api.fetchPossibleImports();
    if (response && response.payload) {
      setPossibleImports(response.payload);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setFetching(false);
  };

  return (
    <div className="mb-8 animate-grow-y">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              Assembly Manager
            </h1>
          </div>
        </div>
      </header>

      <div>
        <div className="mt-8 lg:mx-32">
          <label className="w-full flex justify-center font-bold text-lg">
            {actionsHeader}
          </label>
          <hr className="mt-4 mb-8 shadow" />
          <div className="flex justify-around">
            <div className="w-48 text-white mx-1 sm:mx-4">
              <Button label="Create new">
                <New color="blank" className="stroke-current" />
              </Button>
            </div>
            <div className="w-48 text-white mx-1 sm:mx-4">
              <Button label="Add to">
                <Add color="blank" className="stroke-current" />
              </Button>
            </div>
            <div className="w-48 text-white mx-1 sm:mx-4">
              <Button label="Modify">
                <Edit color="blank" className="stroke-current" />
              </Button>
            </div>
            <div className="w-48 text-white mx-1 sm:mx-4">
              <Button label="Delete">
                <Trash color="blank" className="stroke-current" />
              </Button>
            </div>
          </div>
        </div>

        {!fetching ? (
          <div>
            {possibleImports &&
              Object.keys(possibleImports).length > 0 &&
              Object.keys(possibleImports).map((filetype) => {
                return (
                  <div className="mb-8">
                    <div className="font-bold px-4 py-2">{filetype}</div>
                    <div className="border p-4">
                      {Object.keys(possibleImports[filetype]).length > 0 &&
                        Object.keys(possibleImports[filetype]).map(
                          (extension) => {
                            return (
                              <div className="border p-4">
                                {extension}
                                {possibleImports[filetype][extension].map(
                                  (path) => {
                                    return (
                                      <div className="flex">
                                        {path &&
                                          path.length > 0 &&
                                          path.map((directory) => {
                                            return (
                                              <div className="flex">
                                                <div className="hover:text-green-600">
                                                  {directory + "/"}
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            );
                          }
                        )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div>
            <LoadingSpinner label="Fetching possible imports..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssemblyManager;
