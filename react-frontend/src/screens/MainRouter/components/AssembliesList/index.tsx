import { useEffect, useState } from "react";
import { fetchAssemblies, Filter, Pagination, Sorting } from "../../../../api";
import { AssemblyInterface } from "../../../../tsInterfaces/tsInterfaces";
import AssembliesListElement from "./components/AssembliesListElement";
import AssembliesFilterForm from "./components/AssembliesFilterForm";
import { Ascend, CaretNext, CaretPrevious, Descend, Next, Previous } from "grommet-icons";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import { useNotification } from "../../../../components/NotificationProvider";
import classNames from "classnames";
import AssembliesGridElement from "./components/AssembliesGridElement";
import LoadingSpinner from "../../../../components/LoadingSpinner";

const AssembliesList = ({
  title = "All assemblies",
  initialView = "list",
  bookmarks = 0,
}: {
  title?: string;
  initialView?: "list" | "grid";
  bookmarks?: 0 | 1;
}) => {
  const [assemblies, setAssemblies] = useState<AssemblyInterface[]>([]);

  const [view, setView] = useState<"list" | "grid">("list");

  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<Filter>({});
  const [sortBy, setSortBy] = useState<Sorting>({ column: "scientificName", order: true });
  const [offset, setOffset] = useState<number>(0);
  const [range, setRange] = useState<number>(10);
  const [pagination, setPagination] = useState<Pagination>({
    offset: 0,
    range: 10,
    count: 0,
    pages: 0,
  });

  const [loadAssembliesTimeout, setLoadAssembliesTimeout] = useState<any>(null);
  const [loadingAssemblies, setLoadingAssemblies] = useState<boolean>(false);
  const [onLoadingAssembliesTimeout, setOnLoadingAssemblies] = useState<boolean>(false);

  const [fcatMode, setFcatMode] = useState<number>(1);

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    setView(initialView);
    setAssemblies([]);
  }, [initialView]);

  useEffect(() => {
    setOnLoadingAssemblies(true);
    if (loadAssembliesTimeout) {
      clearTimeout(loadAssembliesTimeout);
    }
    setLoadAssembliesTimeout(
      setTimeout(() => {
        loadAssemblies();
        setOnLoadingAssemblies(false);
      }, 1000)
    );
  }, [sortBy, filter, offset, range, bookmarks, search]);

  useEffect(() => {
    setOffset(0);
  }, [filter, sortBy, range]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadAssemblies = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      setLoadingAssemblies(true);
      await fetchAssemblies(userID, token, offset, range, search, filter, sortBy, bookmarks).then(
        (response) => {
          if (response?.payload) {
            setAssemblies(response.payload);
          }
          if (response?.pagination) {
            setPagination(response?.pagination);
          }
          if (response?.notification) {
            response.notification.forEach((n) => handleNewNotification(n));
          }
        }
      );
      setLoadingAssemblies(false);
    }
  };

  const handleRangeChange = (input: number) => {
    if (input < 1) {
      input = 1;
    }
    if (input > 50) {
      input = 50;
    }
    setRange(input);
    setOffset(0);
  };

  const handlePageChange = (input: number) => {
    if (input < 1) {
      input = 1;
    }
    if (input > pagination.pages) {
      input = pagination.pages;
    }
    input -= 1;
    setOffset(input);
  };

  const viewTypeClass = classNames("animate-grow-y", {
    "grid grid-cols-2 2xl:grid-cols-3 p-8 gap-8": view === "grid",
  });

  const headerClass = classNames(
    "bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 flex justify-between font-bold text-xl px-4 py-6 text-white",
    { "items-center": !isFilterOpen, "items-start": isFilterOpen }
  );

  return (
    <div className="mb-16 animate-grow-y">
      <div className="h-1 bg-gradient-to-t from-gray-900 via-gray-500 to-indigo-200" />
      <div className={headerClass}>
        <div className="w-80 flex items-center">
          <div>{title}</div>
          {loadingAssemblies ||
            (onLoadingAssembliesTimeout && (
              <div className="flex h-full px-4">
                <LoadingSpinner label="Loading..." />
              </div>
            ))}
        </div>
        <div className="w-full text-base decoration-default">
          <AssembliesFilterForm
            viewType={view}
            setViewType={setView}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            isFilterOpen={setIsFilterOpen}
          />
        </div>
      </div>
      <hr className="border-gray-400" />
      {view === "list" && (
        <div className="sticky top-16 flex w-full px-4 text-center bg-gray-600 text-white font-semibold py-2 text-xs animate-grow-y">
          <div className="w-16 mr-4 flex items-center justify-center">Image</div>
          <div
            className="w-2/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
            onClick={() =>
              setSortBy((prevState) =>
                prevState.column === "scientificName"
                  ? { ...prevState, order: !prevState.order }
                  : { column: "scientificName", order: true }
              )
            }
          >
            {sortBy.column === "scientificName" && (
              <div className="flex items-center mr-4">
                {sortBy.order ? (
                  <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
                ) : (
                  <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
                )}
              </div>
            )}
            Taxon
          </div>
          <div
            className="w-3/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
            onClick={() =>
              setSortBy((prevState) =>
                prevState.column === "label"
                  ? { ...prevState, order: !prevState.order }
                  : { column: "label", order: true }
              )
            }
          >
            {sortBy.column === "label" && (
              <div className="flex items-center mr-4">
                {sortBy.order ? (
                  <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
                ) : (
                  <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
                )}
              </div>
            )}
            Name/Alias
          </div>
          <div className="w-1/12 flex items-center justify-center">Annotation</div>
          <div className="w-1/12 flex items-center justify-center">Busco</div>
          <div className="w-1/12 flex items-center justify-center">
            <div
              className="py-2 px-1 hover:bg-gray-500 hover:text-white cursor-pointer flex items-center rounded-lg"
              onClick={() => setFcatMode((prevState) => (prevState - 1 < 1 ? 4 : prevState - 1))}
            >
              <CaretPrevious className="stroke-current" color="blank" size="small" />
            </div>
            <div>fCats (M{fcatMode})</div>
            <div
              className="py-2 px-1 hover:bg-gray-500 hover:text-white cursor-pointer flex items-center rounded-lg"
              onClick={(e) => setFcatMode((prevState) => (prevState + 1 > 4 ? 1 : prevState + 1))}
            >
              <CaretNext className="stroke-current" color="blank" size="small" />
            </div>
          </div>
          <div className="w-1/12 flex items-center justify-center">Milts</div>
          <div className="w-1/12 flex items-center justify-center">Repeatmasker</div>
          <div
            className="w-1/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg truncate"
            onClick={() =>
              setSortBy((prevState) =>
                prevState.column === "username"
                  ? { ...prevState, order: !prevState.order }
                  : { column: "username", order: true }
              )
            }
          >
            {sortBy.column === "username" && (
              <div className="flex items-center mr-4">
                {sortBy.order ? (
                  <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
                ) : (
                  <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
                )}
              </div>
            )}
            Added by
          </div>
          <div
            className="w-1/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg truncate"
            onClick={() =>
              setSortBy((prevState) =>
                prevState.column === "addedOn"
                  ? { ...prevState, order: !prevState.order }
                  : { column: "addedOn", order: true }
              )
            }
          >
            {sortBy.column === "addedOn" && (
              <div className="flex items-center mr-4">
                {sortBy.order ? (
                  <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
                ) : (
                  <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
                )}
              </div>
            )}
            Added on
          </div>
        </div>
      )}
      <div className={viewTypeClass}>
        {assemblies && assemblies.length > 0 ? (
          assemblies.map((assembly, index) => {
            if (view === "list") {
              return (
                <div key={assembly.id} className="even:bg-gray-100 odd:bg-white">
                  <AssembliesListElement assembly={assembly} fcatMode={fcatMode} />
                </div>
              );
            }
            if (view === "grid") {
              return (
                <div key={assembly.id} className="">
                  <AssembliesGridElement
                    assembly={assembly}
                    fcatMode={fcatMode}
                    renderDelay={index + 1}
                  />
                </div>
              );
            }
          })
        ) : (
          <div className="w-full flex justify-center items-center border py-8 shadow col-span-3">
            {loadingAssemblies || onLoadingAssembliesTimeout ? (
              <LoadingSpinner label="Loading..." />
            ) : (
              "No assemblies!"
            )}
          </div>
        )}
      </div>
      <div>
        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center items-center mt-4">
            <div className="w-12 mx-4">
              <Button color="nav" onClick={() => handlePageChange(offset)}>
                <Previous color="blank" className="stroke-current" />
              </Button>
            </div>
            <div className="mx-2">
              <div className="flex justify-center items-center">
                <span className="mr-2 text-sm">Page</span>
                <div className="w-24">
                  <Input
                    borderless={true}
                    type="number"
                    size="sm"
                    onChange={(e) => handlePageChange(e.target.value)}
                    value={offset + 1}
                  />
                </div>
                <span className="mx-2 text-sm">of</span>
                <span className="mr-2 text-sm">{pagination.pages}</span>
              </div>
              <hr className="shadow -mx-4 my-1" />
              <label className="flex items-center">
                <span className="mr-2 text-sm">Assemblies/page:</span>
                <div className="w-24">
                  <Input
                    borderless={true}
                    type="number"
                    size="sm"
                    onChange={(e) => handleRangeChange(e.target.value)}
                    value={range}
                  />
                </div>
              </label>
            </div>
            <div className="w-12 mx-4">
              <Button color="nav" onClick={() => handlePageChange(offset + 2)}>
                <Next color="blank" className="stroke-current" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssembliesList;
