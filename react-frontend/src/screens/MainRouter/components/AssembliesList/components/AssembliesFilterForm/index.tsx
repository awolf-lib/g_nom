import { CaretDown, Search } from "grommet-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  fetchTaxaWithAssemblies,
  fetchUsers,
  Filter,
  INcbiTaxon,
  IUser,
} from "../../../../../../api";
import Button from "../../../../../../components/Button";
import Input from "../../../../../../components/Input";
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
}: {
  viewType: "grid" | "list";
  setViewType: Dispatch<SetStateAction<"grid" | "list">>;
  setSearch: (search: string) => void;
  search: string;
  setFilter: Dispatch<SetStateAction<Filter>>;
  filter: Filter;
  isFilterOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [toggleFilterSelection, setToggleFilterSelection] = useState<boolean>(false);

  const [taxa, setTaxa] = useState<INcbiTaxon[]>([]);
  const [filteredTaxa, setFilteredTaxa] = useState<INcbiTaxon[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [minBuscoComplete, setMinBuscoComplete] = useState<number>(0);
  const [minFcatSimilar, setMinFcatSimilar] = useState<number>(0);
  const [fcatMode, setFcatMode] = useState<1 | 2 | 3 | 4>(1);
  useEffect(() => {
    if (search === "") {
      setSearch("");
    }
  }, [search]);

  useEffect(() => {
    loadTaxa();
  }, [toggleFilterSelection]);

  useEffect(() => {
    loadUsers();
  }, [toggleFilterSelection]);

  useEffect(() => {
    handleSetMinBusco();
  }, [minBuscoComplete]);

  useEffect(() => {
    handleSetMinFcat();
  }, [minFcatSimilar, fcatMode]);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification: any) => {
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
    var values: number[] = [];
    for (var i = 0, l = taxa.length; i < l; i++) {
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

  const handleSelectUsers = (users: any) => {
    var values: number[] = [];
    for (var i = 0, l = users.length; i < l; i++) {
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

  const handleChangeUserSearch = (search: string) => {
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

  return (
    <div>
      <div className="w-full h-10 flex justify-around items-center">
        <label className="flex items-center w-56">
          <span className="text-sm px-2">View type:</span>
          <select
            className="w-32 text-gray-700 text-center rounded-lg shadow border border-gray-300 py-1 text-sm"
            onChange={(e) => setViewType(e.target.value as "list" | "grid")}
            value={viewType}
          >
            <option className="text-sm py-1" value="list">
              List
            </option>
            <option className="text-sm py-1" value="grid">
              Grid
            </option>
          </select>
        </label>
        <div className="w-96 flex items-center">
          <div className="w-full px-2">
            <Input placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
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
          <Button label="Reset filter" color="secondary" size="sm" onClick={() => setFilter({})} />
        </div>
      </div>
      {toggleFilterSelection && <hr className="shadow my-2 border-gray-300 animate-grow-y" />}
      {toggleFilterSelection && (
        <div className="px-4 animate-grow-y pb-4 flex justify-around items-start">
          <div>
            Taxon
            <hr className="shadow border-gray-300 -mx-2" />
            <div className="mt-2 w-48">
              <Input
                size="sm"
                placeholder="Search..."
                onChange={(e) => handleChangeTaxaSearch(e.target.value)}
              />
            </div>
            <select
              multiple
              className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
              onChange={(e) => handleSelectTaxa(e.target.options)}
            >
              <option value={-1} className="px-4 py-1 border-b text-sm font-semibold">
                All
              </option>
              {filteredTaxa &&
                filteredTaxa.length > 0 &&
                filteredTaxa.map((taxon) => (
                  <option
                    key={taxon.id}
                    value={taxon.id}
                    className="px-4 py-1 border-b text-sm font-semibold truncate"
                  >
                    {taxon.scientificName}
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
              />
            </div>
            <select
              multiple
              className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
              onChange={(e) => handleSelectUsers(e.target.options)}
            >
              <option value={-1} className="px-4 py-1 border-b text-sm font-semibold">
                All
              </option>
              {filteredUsers &&
                filteredUsers.length > 0 &&
                filteredUsers.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                    className="px-4 py-1 border-b text-sm font-semibold truncate"
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
              />
              <span className="px-4">has Annotation</span>
            </label>
            <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
              <input
                className="ring-1 ring-white"
                type="checkbox"
                onChange={(e) => handleChangeCheckbox("hasMapping", e.target.checked)}
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
                />
                <span className="px-4">has Busco</span>
              </label>
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasFcat", e.target.checked)}
                />
                <span className="px-4">has fCat</span>
              </label>
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasMilts", e.target.checked)}
                />
                <span className="px-4">has Milts</span>
              </label>
              <label className="flex items-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <input
                  className="ring-1 ring-white"
                  type="checkbox"
                  onChange={(e) => handleChangeCheckbox("hasRepeatmasker", e.target.checked)}
                />
                <span className="px-4">has Repeatmasker</span>
              </label>
              <hr className="shadow border-gray-300 -mx-2 my-4 border-dashed" />
              <label className="flex justify-center text-xs py-1 hover:text-gray-200 cursor-pointer">
                <span className="mr-4 py-1 w-44">Min. complete Busco (%):</span>
                <div className="w-48">
                  <Slider getValue={setMinBuscoComplete} showValues={true} />
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
                    <Slider getValue={setMinFcatSimilar} showValues={true} />
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
