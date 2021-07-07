import React, { useEffect, useState } from "react";
import "../../../../App.css";
import classNames from "classnames";
import { Link } from "react-router-dom";

import API from "../../../../api";

import Button from "../../../../components/Button";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import AssemblyInfoCard from "../../../../components/AssemblyInfoCard";

import { useNotification } from "../../../../components/NotificationProvider";
import { Add, Next, Previous } from "grommet-icons";
import AssemblyInfoListItem from "../../../../components/AssemblyInfoListItem";

const AllAssembliesTable = () => {
  const [assemblies, setAssemblies] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(undefined);
  const [range, setRange] = useState(10);
  const [changeRangeTimeout, setChangeRangeTimeout] = useState(undefined);
  const [page, setPage] = useState(1);
  const [changePageTimeout, setChangePageTimeout] = useState(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    range: 10,
    count: 0,
    pages: 0,
    next: "",
    previous: "",
    currentPage: 1,
  });
  const [viewType, setViewType] = useState("grid");

  const api = new API();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadData = async (page = 1, range = 10, search = "", link = "") => {
    setFetching(true);

    const response = await api.fetchAllAssemblies(page, range, search, link);

    if (response && response.payload) {
      setAssemblies(response.payload);
      setPagination(response.pagination);
    }

    if (response && response.paginaton) {
      setPagination(response.pagination);
    }

    if (response && response.notification) {
      handleNewNotification(response.notification);
    }
    setFetching(false);
  };

  const handleSearchChange = (input) => {
    clearTimeout(searchTimeout);
    setSearch(input);
    setSearchTimeout(
      setTimeout(() => {
        loadData(1, range, input);
      }, 2000)
    );
  };

  const handleRangeChange = (input) => {
    clearTimeout(changeRangeTimeout);
    if (input < 1) {
      input = 1;
    }
    if (input > 100) {
      input = 100;
    }

    setRange(input);
    setChangeRangeTimeout(
      setTimeout(() => {
        loadData(1, input, search);
      }, 2000)
    );
  };

  const handlePageChange = (input) => {
    clearTimeout(changePageTimeout);
    if (input < 1) {
      input = 1;
    }
    if (input > pagination.pages) {
      input = pagination.pages;
    }
    setPage(input);
    setChangePageTimeout(
      setTimeout(() => {
        loadData(input, range, search);
      }, 2000)
    );
  };

  const elementsContainerClass = classNames("animate-grow-y", {
    "lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-8 m-4": viewType === "grid",
  });

  return (
    <div className="mb-16">
      {/* HEADER */}
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              All assemblies
            </h1>
            <div className="ml-2 md:ml-8 p-1 bg-gray-600 text-white flex items-center rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300 hover:animate-wiggle">
              <Link to={"/g-nom/assemblies/import"}>
                <Add color="blank" className="stroke-current" />
              </Link>
            </div>
          </div>
          <div className="w-48 lg:w-1/4 lg:flex justify-end">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="mb-2 w-full lg:w-3/5 mr-4 cursor-pointer border border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none focus:ring-2 hover:ring-2 ring-offset-1 transition duration-300"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
            <input
              onChange={(e) => {
                handleSearchChange(e.target.value);
              }}
              className="w-full border border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none focus:ring-2 hover:ring-2 ring-offset-1 transition duration-300"
              type="search"
              name="search"
              placeholder="Search..."
            />
          </div>
        </div>
      </header>

      {/* LIST */}
      <main className="mb-8">
        <div className="mx-auto py-6 sm:px-6 lg:px-8 mt-4">
          <div className="px-4 sm:px-0">
            {/* HEADERS */}
            {viewType !== "grid" && (
              <div className="text-xs md:text-base bg-indigo-200 my-2 py-8 flex shadow font-semibold items-center rounded-lg text-center">
                <div className="hidden sm:block w-1/12 px-4 truncate">
                  Image
                </div>
                <div className="w-3/12 sm:w-3/12 px-4 truncate">Sc. name</div>
                <div className="w-3/12 sm:w-2/12 px-4 truncate">Taxon ID</div>
                <div className="w-3/12 sm:w-3/12 px-4 truncate">
                  Asmbl. name
                </div>
                <div className="w-3/12 sm:w-3/12 px-4 truncate">Analysis</div>
              </div>
            )}

            {/* ELEMENTS */}
            {!fetching ? (
              <div className={elementsContainerClass}>
                {assemblies && assemblies.length > 0 ? (
                  assemblies.map((assembly) => {
                    return viewType === "grid" ? (
                      <AssemblyInfoCard
                        id={assembly.id}
                        scientificName={assembly.scientificName}
                        taxonID={assembly.taxonID}
                        assemblyName={assembly.name}
                        types={assembly.types}
                      />
                    ) : (
                      <AssemblyInfoListItem
                        id={assembly.id}
                        scientificName={assembly.scientificName}
                        taxonID={assembly.taxonID}
                        assemblyName={assembly.name}
                        types={assembly.types}
                      />
                    );
                  })
                ) : (
                  <div className="my-2 py-4 px-2 text-center shadow rounded-lg">
                    {pagination && pagination.count === 0 && !search ? (
                      <Link
                        to="/g-nom/assemblies/manageAssemblies"
                        className="mx-2 text-blue-600 hover:text-blue-400"
                      >
                        Import new assembly...
                      </Link>
                    ) : (
                      <div className="mx-2 text-blue-600 hover:text-blue-400">
                        No results for given search!
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center h-16">
                <LoadingSpinner label="Loading..." />
              </div>
            )}
            <hr className="shadow my-2" />

            {/* Pagination */}
            {pagination && (
              <div className="flex justify-center items-center mt-4">
                <div className="w-12 mx-4">
                  <Button
                    color="nav"
                    onClick={() => {
                      pagination.currentPage > 1 &&
                        loadData(
                          undefined,
                          undefined,
                          undefined,
                          pagination.previous
                        );
                    }}
                  >
                    <Previous color="blank" className="stroke-current" />
                  </Button>
                </div>
                <div className="mx-2">
                  <div className="flex justify-center items-center">
                    <span className="mr-2 text-sm">Page</span>
                    <input
                      type="number"
                      max={pagination.pages}
                      min={1}
                      onChange={(e) => handlePageChange(e.target.value)}
                      value={page || 1}
                      className="transform scale-75 text-center border border-gray-300 bg-white pl-6 pr-2 rounded-lg text-sm font-bold focus:outline-none focus:ring-2"
                    />
                    <span className="mr-2 text-sm">of</span>
                    <span className="mr-2 text-sm">{pagination.pages}</span>
                  </div>
                  <hr className="shadow -mx-4 my-1" />
                  <label>
                    <span className="mr-2 text-sm">Assemblies/page:</span>
                    <input
                      type="number"
                      max={100}
                      min={5}
                      step={5}
                      onChange={(e) => handleRangeChange(e.target.value)}
                      value={range || 10}
                      className="transform scale-75 w-24 text-center border border-gray-300 bg-white pl-6 pr-2 rounded-lg text-sm font-bold focus:outline-none focus:ring-2"
                    />
                  </label>
                </div>
                <div className="w-12 mx-4">
                  <Button
                    color="nav"
                    onClick={() => {
                      pagination.currentPage < pagination.pages &&
                        loadData(
                          undefined,
                          undefined,
                          undefined,
                          pagination.next
                        );
                    }}
                  >
                    <Next color="blank" className="stroke-current" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllAssembliesTable;
