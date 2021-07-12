import React, { useEffect, useState } from "react";
import "../../App.css";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Add, Next, Previous } from "grommet-icons";

import API from "../../api";

import Button from "../Button";
import LoadingSpinner from "../LoadingSpinner";
import AssemblyInfoCard from "../AssemblyInfoCard";
import { useNotification } from "../NotificationProvider";
import AssemblyInfoListItem from "../AssemblyInfoListItem";
import Input from "../Input";

const AssembliesTable = ({ label, userID }) => {
  const [assemblies, setAssemblies] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [mounted, setMounted] = useState(true);
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
  const [viewType, setViewType] = useState(userID ? "grid" : "list");

  const api = new API();

  useEffect(() => {
    loadData();

    return cleanUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanUp = () => {
    setMounted(false);
    clearTimeout(searchTimeout);
    clearTimeout(changeRangeTimeout);
    clearTimeout(changePageTimeout);
  };

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

    const response = await api.fetchAllAssemblies(
      page,
      range,
      search,
      link,
      userID
    );

    if (!mounted) {
      return 0;
    }

    if (response && response.payload) {
      setAssemblies(response.payload);
    }

    if (response && response.pagination) {
      setPagination(response.pagination);
      setRange(response.pagination.range);
      setPage(response.pagination.currentPage);
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
    <div className="mb-8">
      {/* HEADER */}
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              {label}
            </h1>
            {!userID && (
              <Link to={"/g-nom/assemblies/manage"}>
                <div className="ml-2 md:ml-8 p-1 bg-gray-600 text-white flex items-center rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300 hover:animate-wiggle">
                  <Add color="blank" className="stroke-current" />
                </div>
              </Link>
            )}
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
            <Input
              onChange={(e) => {
                handleSearchChange(e.target.value);
              }}
              type="search"
              name="search"
              placeholder="Search..."
            />
          </div>
        </div>
      </header>

      {/* LIST */}
      <main className="mb-8 animate-grow-y">
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
                        imageStored={assembly.imageStored}
                        key={assembly.id}
                      />
                    ) : (
                      <AssemblyInfoListItem
                        id={assembly.id}
                        scientificName={assembly.scientificName}
                        taxonID={assembly.taxonID}
                        assemblyName={assembly.name}
                        types={assembly.types}
                        imageStored={assembly.imageStored}
                        key={assembly.id}
                      />
                    );
                  })
                ) : (
                  <div className="my-2 py-4 px-2 text-center shadow rounded-lg lg:col-span-2 xl:col-span-3">
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
            <hr className="shadow mt-8" />

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
                    <Input
                      type="number"
                      size="sm"
                      max={pagination.pages || 0}
                      min={1}
                      onChange={(e) => handlePageChange(e.target.value)}
                      value={page || 0}
                    />
                    <span className="mx-2 text-sm">of</span>
                    <span className="mr-2 text-sm">
                      {pagination.pages || 0}
                    </span>
                  </div>
                  <hr className="shadow -mx-4 my-1" />
                  <label>
                    <span className="mr-2 text-sm">Assemblies/page:</span>
                    <Input
                      type="number"
                      size="sm"
                      max={100}
                      min={5}
                      step={5}
                      onChange={(e) => handleRangeChange(e.target.value)}
                      value={range}
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

export default AssembliesTable;

AssembliesTable.defaultProps = {
  label: "All assemblies",
  userID: 0,
};

AssembliesTable.propTypes = {
  label: PropTypes.string,
  userID: PropTypes.number,
};
