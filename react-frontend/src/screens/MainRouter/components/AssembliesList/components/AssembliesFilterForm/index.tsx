import classNames from "classnames";
import { Search } from "grommet-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  fetchAssemblyTags,
  fetchTaxaWithAssemblies,
  fetchUsers,
  Filter,
  INcbiTaxon,
  IUser,
  NotificationObject,
} from "../../../../../../api";
import Button from "../../../../../../components/Button";
import Input from "../../../../../../components/Input";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../components/NotificationProvider";
import Slider from "../../../../../../components/Slider";

const AssembliesFilterForm = ({
  viewType,
  setViewType,
  search,
  setSearch,
  filter,
  setFilter,
  isFilterOpen,
  title,
  loading,
}: {
  viewType: "grid" | "list" | "tree";
  setViewType: Dispatch<SetStateAction<"grid" | "list" | "tree">>;
  setSearch: (search: string) => void;
  search: string;
  setFilter: Dispatch<SetStateAction<Filter>>;
  filter: Filter;
  isFilterOpen?: Dispatch<SetStateAction<boolean>>;
  title?: string;
  loading?: boolean;
}) => {
  const [toggleFilterSelection, setToggleFilterSelection] = useState<boolean>(false);

  const [taxa, setTaxa] = useState<INcbiTaxon[]>([]);
  const [filteredTaxa, setFilteredTaxa] = useState<INcbiTaxon[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [minBuscoComplete, setMinBuscoComplete] = useState<number>(0);
  const [minFcatSimilar, setMinFcatSimilar] = useState<number>(0);
  const [fcatMode, setFcatMode] = useState<1 | 2 | 3 | 4>(1);

  const [taxonFilterSearch, setTaxonFilterSearch] = useState<string>("");
  const [tagFilterSearch, setTagFilterSearch] = useState<string>("");
  const [userFilterSearch, setUserFilterSearch] = useState<string>("");

  useEffect(() => {
    if (search === "") {
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    loadTaxa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection]);

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection]);

  useEffect(() => {
    handleSetMinBusco();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minBuscoComplete]);

  useEffect(() => {
    handleSetMinFcat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFcatSimilar, fcatMode]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: NotificationObject) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadTaxa = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token)
      await fetchTaxaWithAssemblies(userID, token).then((response) => {
        if (response?.payload) {
          setTaxa(response.payload);
          setFilteredTaxa(response.payload);
        }

        if (response?.notification) {
          response.notification.forEach((n) => handleNewNotification(n));
        }
      });
  };

  const loadTags = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token)
      await fetchAssemblyTags(userID, token).then((response) => {
        if (response?.payload) {
          setTags(response.payload);
          setFilteredTags(response.payload);
        }

        if (response?.notification) {
          response.notification.forEach((n) => handleNewNotification(n));
        }
      });
  };

  const loadUsers = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token)
      await fetchUsers(userID, token).then((response) => {
        if (response?.payload) {
          setUsers(response.payload);
          setFilteredUsers(response.payload);
        }

        if (response?.notification) {
          response.notification.forEach((n) => handleNewNotification(n));
        }
      });
  };

  const handleSelectTaxa = (taxa: any) => {
    let values: number[] = [];
    for (let i = 0, l = taxa.length; i < l; i++) {
      if (taxa[i].value === "-1" && taxa[i].selected) {
        values = [];
        break;
      }
      if (taxa[i].selected) {
        values.push(parseInt(taxa[i].value));
      }
    }

    if (values.length) {
      setFilter((prevState) => {
        return { ...prevState, taxonIDs: values };
      });
    } else {
      setFilter((prevState) => {
        delete prevState.taxonIDs;
        return { ...prevState };
      });
    }
  };

  const handleSelectTag = (selectedTags: any) => {
    let values: string[] = [];
    for (let i = 0, l = selectedTags.length; i < l; i++) {
      if (selectedTags[i].value === "-1" && selectedTags[i].selected) {
        values = [];
        break;
      }
      if (selectedTags[i].selected) {
        values.push(selectedTags[i].value);
      }
    }

    if (values.length) {
      setFilter((prevState) => {
        return { ...prevState, tags: values };
      });
    } else {
      setFilter((prevState) => {
        delete prevState.tags;
        return { ...prevState };
      });
    }
  };

  const handleSelectUsers = (users: any) => {
    let values: number[] = [];
    for (let i = 0, l = users.length; i < l; i++) {
      if (users[i].value === "-1" && users[i].selected) {
        values = [];
        break;
      }
      if (users[i].selected) {
        values.push(parseInt(users[i].value));
      }
    }

    if (values.length) {
      setFilter((prevState) => {
        return { ...prevState, userIDs: values };
      });
    } else {
      setFilter((prevState) => {
        delete prevState.userIDs;
        return { ...prevState };
      });
    }
  };

  const handleChangeCheckbox = (target: keyof Filter, checked: boolean) => {
    if (checked) {
      setFilter((prevState) => {
        return { ...prevState, [target]: checked };
      });
    } else {
      setFilter((prevState) => {
        delete prevState[target];
        return { ...prevState };
      });
    }
  };

  const handleSetMinBusco = () => {
    if (minBuscoComplete === 0) {
      setFilter((prevState) => {
        delete prevState.minBuscoComplete;
        return { ...prevState };
      });
    } else {
      setFilter((prevState) => {
        return { ...prevState, minBuscoComplete: minBuscoComplete };
      });
    }
  };

  const handleSetMinFcat = () => {
    if (minFcatSimilar === 0) {
      setFilter((prevState) => {
        delete prevState.minFcatSimilar;
        return { ...prevState };
      });
    } else {
      setFilter((prevState) => {
        return { ...prevState, minFcatSimilar: { mode: fcatMode, value: minFcatSimilar } };
      });
    }
  };

  const handleChangeTaxaSearch = (search: string) => {
    setTaxonFilterSearch(search);
    if (search) {
      setFilteredTaxa((prevState) =>
        prevState.filter(
          (taxon) => taxon.scientificName.includes(search) || filter.taxonIDs?.includes(taxon.id)
        )
      );
    } else {
      setFilteredTaxa(taxa);
    }
  };

  const handleChangeTagSearch = (search: string) => {
    setTagFilterSearch(search);
    if (search) {
      setFilteredTags((prevState) =>
        prevState.filter((tag) => tag.toLowerCase().includes(search) || filter.tags?.includes(tag))
      );
    } else {
      setFilteredTags(tags);
    }
  };

  const handleChangeUserSearch = (search: string) => {
    setUserFilterSearch(search);
    if (search) {
      setFilteredUsers((prevState) =>
        prevState.filter(
          (user) => user.username.includes(search) || filter.userIDs?.includes(user.id)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  };

  const handleToggleFilterSelection = () => {
    if (isFilterOpen) {
      isFilterOpen(!toggleFilterSelection);
    }
    setToggleFilterSelection((prevState) => !prevState);
  };

  const handleResetFilter = () => {
    setFilter({});
    setSearch("");
    setFcatMode(1);
    setMinBuscoComplete(0);
    setMinFcatSimilar(0);
  };

  const optionClass = (target: any[], value: any) =>
    classNames("px-2 py-1 border-b text-xs font-semibold truncate text-center", {
      "bg-blue-600 text-white": target.includes(value),
    });

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <div>{title}</div>
        {loading && (
          <div className="flex h-full px-4">
            <LoadingSpinner label="Loading..." />
          </div>
        )}
        <label className="flex items-center w-56">
          <div className="text-sm px-2">View type:</div>
          <select
            className="w-32 text-gray-700 text-center rounded-lg shadow border border-gray-300 text-sm"
            onChange={(e) => setViewType(e.target.value as "list" | "grid" | "tree")}
            value={viewType}
          >
            <option className="text-sm" value="list">
              List
            </option>
            <option className="text-sm" value="grid">
              Grid
            </option>
            <option className="text-sm" value="tree">
              Tree
            </option>
          </select>
        </label>
        <div className="w-96 flex items-center">
          <div className="w-full px-2">
            <Input
              value={search}
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Button color="primary" size="sm" onClick={() => setSearch(search)}>
              <Search
                className="stroke-current transform scale-150 mb-1"
                color="blank"
                size="small"
              />
            </Button>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Button
            label={toggleFilterSelection ? "Hide advanced filters..." : "Show advanced filters..."}
            color="secondary"
            size="sm"
            onClick={() => handleToggleFilterSelection()}
          />
        </div>
        <div className="flex justify-center items-center">
          <Button color="secondary" size="sm" onClick={() => handleResetFilter()}>
            {"Reset filters (" + Object.keys(filter).length + ")"}
          </Button>
        </div>
      </div>
      {toggleFilterSelection && <hr className="shadow my-6 border-gray-300 animate-grow-y" />}
      {toggleFilterSelection && (
        <div className="px-4 animate-grow-y pb-4 flex justify-around items-start">
          {viewType !== "tree" && (
            <div className="animate-fade-in">
              Taxon
              <hr className="shadow border-gray-300 -mx-2" />
              <div className="mt-2 w-48">
                <Input
                  size="sm"
                  placeholder="Search..."
                  onChange={(e) => handleChangeTaxaSearch(e.target.value)}
                  value={taxonFilterSearch}
                />
              </div>
              <select
                multiple
                className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
                onChange={(e) => handleSelectTaxa(e.target.options)}
              >
                <option value={-1} className={optionClass(filter.taxonIDs || [], -1)}>
                  All
                </option>
                {filteredTaxa &&
                  filteredTaxa.length > 0 &&
                  filteredTaxa.map((taxon) => (
                    <option
                      key={taxon.id}
                      value={taxon.id}
                      className={optionClass(filter.taxonIDs || [], taxon.id)}
                    >
                      {taxon.scientificName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            Tags
            <hr className="shadow border-gray-300 -mx-2" />
            <div className="mt-2 w-48">
              <Input
                size="sm"
                placeholder="Search..."
                onChange={(e) => handleChangeTagSearch(e.target.value)}
                value={tagFilterSearch}
              />
            </div>
            <select
              multiple
              className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
              onChange={(e) => handleSelectTag(e.target.options)}
            >
              <option value={-1} className={optionClass(filter.userIDs || [], -1)}>
                All
              </option>
              {filteredTags &&
                filteredTags.length > 0 &&
                filteredTags.map((tag) => (
                  <option key={tag} value={tag} className={optionClass(filter.userIDs || [], tag)}>
                    {tag}
                  </option>
                ))}
            </select>
          </div>

          <div>
            Users
            <hr className="shadow border-gray-300 -mx-2" />
            <div className="mt-2 w-48">
              <Input
                size="sm"
                placeholder="Search..."
                onChange={(e) => handleChangeUserSearch(e.target.value)}
                value={userFilterSearch}
              />
            </div>
            <select
              multiple
              className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
              onChange={(e) => handleSelectUsers(e.target.options)}
            >
              <option value={-1} className={optionClass(filter.userIDs || [], -1)}>
                All
              </option>
              {filteredUsers &&
                filteredUsers.length > 0 &&
                filteredUsers.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                    className={optionClass(filter.userIDs || [], user.id)}
                  >
                    {user.username}
                  </option>
                ))}
            </select>
          </div>

          <div>
            Tracks
            <hr className="shadow border-gray-300 -mx-2 mb-2" />
            <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
              <input
                className="ring-1 ring-white"
                type="checkbox"
                onChange={(e) => handleChangeCheckbox("hasAnnotation", e.target.checked)}
                checked={filter.hasAnnotation ? true : false}
              />
              <span className="px-4">has Annotation</span>
            </label>
            <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
              <input
                className="ring-1 ring-white"
                type="checkbox"
                onChange={(e) => handleChangeCheckbox("hasMapping", e.target.checked)}
                checked={filter.hasMapping ? true : false}
              />
              <span className="px-4">has Mapping</span>
            </label>
          </div>

          <div>
            <div>
              Analyses
              <hr className="shadow border-gray-300 -mx-2 mb-2" />
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasBusco", e.target.checked)}
                  checked={filter.hasBusco ? true : false}
                />
                <span className="px-4">has Busco</span>
              </label>
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasFcat", e.target.checked)}
                  checked={filter.hasFcat ? true : false}
                />
                <span className="px-4">has fCat</span>
              </label>
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasTaxaminer", e.target.checked)}
                  checked={filter.hasTaxaminer ? true : false}
                />
                <span className="px-4">has taXaminer</span>
              </label>
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasRepeatmasker", e.target.checked)}
                  checked={filter.hasRepeatmasker ? true : false}
                />
                <span className="px-4">has Repeatmasker</span>
              </label>
              <hr className="shadow border-gray-300 -mx-2 my-4 border-dashed" />
              <label className="flex justify-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <span className="mr-4 py-1 w-44">Min. complete Busco (%):</span>
                <div className="w-48">
                  <Slider
                    getValue={setMinBuscoComplete}
                    value={minBuscoComplete}
                    showValues={true}
                  />
                </div>
              </label>
              <label className="flex justify-center items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <span className="mr-4 w-44">Min. similar fCat (% / mode):</span>
                <div>
                  <div className="flex justify-between items-center font-thin py-1">
                    <label className="flex justify-between items-center mx-1">
                      M1
                      <input
                        type="radio"
                        className="ml-1"
                        checked={fcatMode === 1}
                        onChange={() => setFcatMode(1)}
                      />
                    </label>
                    <div className="h-4 w-px bg-white mx-1" />
                    <label className="flex justify-between items-center mx-1">
                      M2
                      <input
                        type="radio"
                        className="ml-1"
                        checked={fcatMode === 2}
                        onChange={() => setFcatMode(2)}
                      />
                    </label>
                    <div className="h-4 w-px bg-white mx-1" />
                    <label className="flex justify-between items-center mx-1">
                      M3
                      <input
                        type="radio"
                        className="ml-1"
                        checked={fcatMode === 3}
                        onChange={() => setFcatMode(3)}
                      />
                    </label>
                    <div className="h-4 w-px bg-white mx-1" />
                    <label className="flex justify-between items-center mx-1">
                      M4
                      <input
                        type="radio"
                        className="ml-1"
                        checked={fcatMode === 4}
                        onChange={() => setFcatMode(4)}
                      />
                    </label>
                  </div>
                  <div className="w-48">
                    <Slider getValue={setMinFcatSimilar} value={minFcatSimilar} showValues={true} />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssembliesFilterForm;
