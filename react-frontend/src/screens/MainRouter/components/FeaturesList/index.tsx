import { useEffect, useState } from "react";
import {
  fetchFeatures,
  Filter,
  IGenomicAnnotationFeature,
  NotificationObject,
  Pagination,
  Sorting,
} from "../../../../api";
import GenomicAnnotationFeaturesFilterForm from "./components/GenomicAnnotationFeaturesFilterForm";
import { Ascend, Descend, Expand, Next, Previous } from "grommet-icons";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import { useNotification } from "../../../../components/NotificationProvider";
import classNames from "classnames";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import FeaturesListElement from "./components/FeaturesListElement";
import { useSearchParams } from "react-router-dom";

const FeaturesList = ({
  title = "Parent features",
  assemblyID,
}: {
  title?: string;
  assemblyID?: number;
}) => {
  const [features, setFeatures] = useState<IGenomicAnnotationFeature[]>([]);
  const [featureTimeout, setFeatureTimeout] = useState<any>();
  const [featureTimeoutWaiting, setFeatureTimeoutWaiting] = useState<boolean>(false);

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

  const [loadingFeatures, setLoadingFeatures] = useState<boolean>(false);

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [expandAttributes, setExpandAttributes] = useState<boolean>(false);

  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const filterURL = JSON.parse(searchParams.get("filter") || "null");
    const sortByURL = JSON.parse(searchParams.get("sortBy") || "null");
    const rangeURL = Number(searchParams.get("range") || "null");
    const offsetURL = Number(searchParams.get("offset") || "null");
    const searchURL = JSON.parse(searchParams.get("search") || "null");

    if (initialLoad) {
      if (sortByURL) {
        setSortBy(sortByURL);
      }
      if (rangeURL) {
        setRange(rangeURL);
      }
      if (offsetURL) {
        setOffset(offsetURL);
      }
      if (filterURL) {
        setFilter(filterURL);
      }
      if (searchURL) {
        setSearch(searchURL);
      }
    }
    setInitialLoad(false);
  }, [searchParams]);

  useEffect(() => {
    setOffset(0);
  }, [filter, sortBy, range]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("filter", JSON.stringify(filter));
    setSearchParams(newSearchParams);
  }, [filter]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("sortBy", JSON.stringify(sortBy));
    setSearchParams(newSearchParams);
  }, [sortBy]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("range", JSON.stringify(range));
    setSearchParams(newSearchParams);
  }, [range]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("offset", JSON.stringify(offset));
    setSearchParams(newSearchParams);
  }, [offset]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("search", JSON.stringify(search));
    setSearchParams(newSearchParams);
  }, [search]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  useEffect(() => {
    clearTimeout(featureTimeout);
    setFeatureTimeoutWaiting(true);
    setFeatureTimeout(
      setTimeout(() => {
        if (Object.keys(filter).length || search || assemblyID) {
          loadFeatures();
        }
        setFeatureTimeoutWaiting(false);
      }, 2000)
    );
  }, [sortBy, range, offset, filter, search]);

  const loadFeatures = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token) {
      setLoadingFeatures(true);
      if (!assemblyID) {
        await fetchFeatures(offset, range, search, filter, sortBy, userID, token).then(
          (response) => {
            if (response?.payload) {
              setFeatures(response.payload);
            }
            if (response?.pagination) {
              setPagination(response?.pagination);
            }
            if (response?.notification) {
              response.notification.forEach((n) => handleNewNotification(n));
            }
            setLoadingFeatures(false);
          }
        );
      } else {
        await fetchFeatures(offset, range, search, filter, sortBy, userID, token, assemblyID).then(
          (response) => {
            if (response?.payload) {
              setFeatures(response.payload);
            }
            if (response?.pagination) {
              setPagination(response?.pagination);
            }
            if (response?.notification) {
              response.notification.forEach((n) => handleNewNotification(n));
            }
            setLoadingFeatures(false);
          }
        );
      }
    }
  };

  const handleRangeChange = (input: number) => {
    if (input < 1) {
      input = 1;
    }
    if (input > 50) {
      input = 50;
    }
    setRange(Number(input));
    setOffset(0);
  };

  const handlePageChange = (input: number) => {
    if (input <= 1) {
      input = 1;
    }
    if (input >= pagination.pages) {
      input = pagination.pages;
    }
    input -= 1;
    setOffset(Number(input));
  };

  const headerClass = classNames(
    "bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-600 flex justify-between font-bold text-xl px-4 py-6 text-white",
    { "items-center": !isFilterOpen, "items-start": isFilterOpen }
  );

  return (
    <div className="mb-16 animate-grow-y">
      <div className="h-1 bg-gradient-to-t from-gray-900 via-gray-500 to-gray-200" />
      <div className={headerClass}>
        <div className="w-full text-base decoration-default">
          <GenomicAnnotationFeaturesFilterForm
            title={title}
            loading={loadingFeatures || featureTimeoutWaiting}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            isFilterOpen={setIsFilterOpen}
            assemblyID={assemblyID}
          />
        </div>
      </div>
      <hr className="border-gray-400" />
      <div className="sticky top-16 flex w-full px-4 text-center bg-gray-600 text-white font-semibold py-2 text-xs animate-grow-y">
        {!assemblyID && (
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
        )}
        {!assemblyID && (
          <div
            className="w-2/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
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
            Assembly
          </div>
        )}
        <div
          className="w-3/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
          onClick={() =>
            setSortBy((prevState) =>
              prevState.column === "seqID"
                ? { ...prevState, order: !prevState.order }
                : { column: "seqID", order: true }
            )
          }
        >
          {sortBy.column === "seqID" && (
            <div className="flex items-center mr-4">
              {sortBy.order ? (
                <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
              ) : (
                <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
              )}
            </div>
          )}
          SeqID
        </div>
        <div
          className="w-2/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
          onClick={() =>
            setSortBy((prevState) =>
              prevState.column === "type"
                ? { ...prevState, order: !prevState.order }
                : { column: "type", order: true }
            )
          }
        >
          {sortBy.column === "type" && (
            <div className="flex items-center mr-4">
              {sortBy.order ? (
                <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
              ) : (
                <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
              )}
            </div>
          )}
          Type
        </div>
        <div
          className="w-1/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
          onClick={() =>
            setSortBy((prevState) =>
              prevState.column === "start"
                ? { ...prevState, order: !prevState.order }
                : { column: "start", order: true }
            )
          }
        >
          {sortBy.column === "start" && (
            <div className="flex items-center mr-4">
              {sortBy.order ? (
                <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
              ) : (
                <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
              )}
            </div>
          )}
          Start
        </div>
        <div
          className="w-1/12 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
          onClick={() =>
            setSortBy((prevState) =>
              prevState.column === "end"
                ? { ...prevState, order: !prevState.order }
                : { column: "end", order: true }
            )
          }
        >
          {sortBy.column === "end" && (
            <div className="flex items-center mr-4">
              {sortBy.order ? (
                <Ascend className="stroke-current animate-grow-y" color="blank" size="small" />
              ) : (
                <Descend className="stroke-current animate-grow-y" color="blank" size="small" />
              )}
            </div>
          )}
          End
        </div>
        <div
          onClick={() => setExpandAttributes((prevState) => !prevState)}
          className={
            assemblyID
              ? "w-1/2 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
              : "w-2/3 flex items-center justify-center cursor-pointer hover:bg-gray-500 rounded-lg"
          }
        >
          <div className="flex items-center mr-4">
            <Expand className="stroke-current" color="blank" size="small" />
          </div>
          Attributes
        </div>
        <div onClick={() => setExpandAttributes((prevState) => !prevState)} className="w-40">
          Options
        </div>
      </div>
      <div className="min-h-1/4">
        {features && features.length > 0 ? (
          features.map((feature) => (
            <div key={feature.id} className="odd:bg-white even:bg-gray-100">
              <FeaturesListElement
                feature={feature}
                noAssemblyDetails={assemblyID || 0}
                showAllAttributes={expandAttributes}
              />
            </div>
          ))
        ) : (
          <div className="w-full flex justify-center items-center border py-8 shadow col-span-3">
            {loadingFeatures || featureTimeoutWaiting ? (
              <LoadingSpinner label="Loading..." />
            ) : (
              "No features! Change search/filters..."
            )}
          </div>
        )}
      </div>
      <hr className="shadow my-2" />
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
                    withoutborder={true}
                    type="number"
                    size="sm"
                    onChange={(e) => handlePageChange(e.target.value)}
                    value={offset + 1}
                  />
                </div>
                <span className="mx-2 text-sm">of</span>
                <span className="mr-2 text-sm">{pagination.pages || 1}</span>
              </div>
              <hr className="shadow -mx-4 my-1" />
              <label className="flex items-center">
                <span className="mr-2 text-sm">Features/page:</span>
                <div className="w-24">
                  <Input
                    withoutborder={true}
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

export default FeaturesList;
