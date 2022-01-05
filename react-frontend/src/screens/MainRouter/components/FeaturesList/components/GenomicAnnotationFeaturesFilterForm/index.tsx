import { Search, StatusGood } from "grommet-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  fetchFeatureAttributeKeys,
  fetchTaxaWithAssemblies,
  FilterFeatures,
  INcbiTaxon,
  ITargetAttribute,
  NotificationObject,
} from "../../../../../../api";
import Button from "../../../../../../components/Button";
import Input from "../../../../../../components/Input";
import { useNotification } from "../../../../../../components/NotificationProvider";

const GenomicAnnotationFeaturesFilterForm = ({
  search,
  setSearch,
  filter,
  setFilter,
  isFilterOpen,
}: {
  setSearch: (search: string) => void;
  search: string;
  setFilter: Dispatch<SetStateAction<FilterFeatures>>;
  filter: FilterFeatures;
  isFilterOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [toggleFilterSelection, setToggleFilterSelection] = useState<boolean>(false);

  const [taxa, setTaxa] = useState<INcbiTaxon[]>([]);
  const [filteredTaxa, setFilteredTaxa] = useState<INcbiTaxon[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [filteredAttributes, setFilteredAttributes] = useState<string[]>([]);
  const [targetAttributes, setTargetAttributes] = useState<ITargetAttribute[]>([]);
  const [triggerSetFilter, setTriggerSetFilter] = useState<boolean>(false);

  const [taxonSearch, setTaxonSearch] = useState<string>("");
  const [attributeSearch, setAttributeSearch] = useState<string>("");

  useEffect(() => {
    if (search === "") {
      setSearch("");
    }
  }, [search]);

  useEffect(() => {
    loadTaxa();
  }, [toggleFilterSelection]);

  useEffect(() => {
    loadAttributes();
  }, [toggleFilterSelection]);

  useEffect(() => {
    if (triggerSetFilter) {
      if (targetAttributes?.length) {
        setFilter((prevState) => {
          return {
            ...prevState,
            featureAttributes: targetAttributes.filter(
              (element) => element.target && element.operator && element.value
            ),
          };
        });
      } else {
        setFilter((prevState) => {
          delete prevState.featureAttributes;
          return { ...prevState };
        });
      }
      setTriggerSetFilter(false);
    }
  }, [triggerSetFilter, targetAttributes]);

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

  const loadAttributes = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token)
      await fetchFeatureAttributeKeys(userID, token).then((response) => {
        if (response?.payload) {
          setAttributes(response.payload);
          setFilteredAttributes(response.payload);
        }

        if (response?.notification) {
          response.notification.forEach((n) => handleNewNotification(n));
        }
      });
  };

  const handleSelectTaxa = (taxa: HTMLOptionsCollection) => {
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

  const handleSelectAttributes = (attributes: HTMLOptionsCollection) => {
    var values: ITargetAttribute[] = targetAttributes.filter((element) => {
      for (var i = 0, l = attributes.length; i < l; i++) {
        if (attributes[i].selected && attributes[i].value === element.target) {
          return true;
        }
      }
      return false;
    });

    for (var i = 0, l = attributes.length; i < l; i++) {
      if (attributes[i].value === "-1" && attributes[i].selected) {
        values = [];
        break;
      }
      if (
        attributes[i].selected &&
        !values.find((element) => element.target === attributes[i].value)
      ) {
        values.push({ target: attributes[i].value });
      }
    }
    setTargetAttributes(values);
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

  const handleChangeAttributeSearch = (search: string) => {
    if (search) {
      setFilteredAttributes((prevState) =>
        prevState.filter(
          (attribute) =>
            attribute.includes(search) ||
            targetAttributes.find((element) => element.target === attribute)
        )
      );
    } else {
      setFilteredAttributes(attributes);
    }
  };

  const handleToggleFilterSelection = () => {
    if (isFilterOpen) {
      isFilterOpen(!toggleFilterSelection);
    }
    setToggleFilterSelection((prevState) => !prevState);
  };

  const handleChangeTargetAttribute = (
    target: string,
    operator?: string,
    value?: string | number
  ) => {
    let targets: ITargetAttribute[] = targetAttributes.map((attr) => {
      if (attr.target === target) {
        if (operator) {
          if (value) {
            setTriggerSetFilter(true);
            return { target: target, operator: operator, value: value };
          } else {
            return { target: target, operator: operator };
          }
        } else {
          return { target: target };
        }
      } else {
        return { ...attr };
      }
    });

    setTargetAttributes(targets);
  };

  const numberOperators = ["=", "!=", "<", ">", ">=", "<="];
  const stringOperators = ["contains", "is", "is not"];

  const checkAttributeFilterStatus = (attr: ITargetAttribute) => {
    if (filter.featureAttributes?.length) {
      let index = filter.featureAttributes?.findIndex((element) => attr.target === element.target);

      if (index !== -1) {
        return true;
      } else {
        return false;
      }
    }
  };

  const handleFilterReset = () => {
    setSearch("");
    setFilter({});
    setTargetAttributes([]);
    setFilteredAttributes(attributes);
    setFilteredTaxa(taxa);
    setTaxonSearch("");
    setAttributeSearch("");
  };

  return (
    <div>
      <div className="w-full h-10 flex justify-around items-center">
        <div className="w-96 flex items-center">
          <div className="w-full px-2">
            <Input
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
              value={search}
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
          <Button
            label="Reset filter"
            color="secondary"
            size="sm"
            onClick={() => handleFilterReset()}
          />
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
                value={taxonSearch}
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
            Attributes
            <hr className="shadow border-gray-300 -mx-2" />
            <div className="flex mt-2">
              <div>
                <div className="w-48">
                  <Input
                    size="sm"
                    placeholder="Search..."
                    onChange={(e) => handleChangeAttributeSearch(e.target.value)}
                    value={attributeSearch}
                  />
                </div>
                <select
                  multiple
                  className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
                  onChange={(e) => handleSelectAttributes(e.target.options)}
                >
                  <option value="-1" className="px-4 py-1 border-b text-sm font-semibold">
                    None
                  </option>
                  {filteredAttributes &&
                    filteredAttributes.length > 0 &&
                    filteredAttributes.map((attribute) => (
                      <option
                        key={attribute}
                        value={attribute}
                        className="px-4 py-1 border-b text-sm font-semibold truncate"
                      >
                        {attribute}
                      </option>
                    ))}
                </select>
              </div>

              {targetAttributes?.length > 0 && (
                <div className="px-4 ">
                  <div>Selected attributes:</div>
                  <hr className="shadow border-gray-300 -mx-2 mb-2 border-dotted" />
                  {targetAttributes.map((attr) => (
                    <div key={attr.target}>
                      <div className="flex items-center py-1">
                        <div className="w-px bg-gray-300 h-4 mr-4" />
                        <div className="w-80 text-sm truncate text-right">{attr.target}</div>
                        <div className="w-px bg-gray-300 h-4 ml-4" />
                        <select
                          className="text-gray-700 text-center w-32 mx-4 text-xs rounded-lg h-6 shadow"
                          onChange={(e) =>
                            handleChangeTargetAttribute(attr.target, e.target.value, attr.value)
                          }
                          value={attr.operator || ""}
                        >
                          <option value="">{"None"}</option>
                          <option value="=">{"="}</option>
                          <option value="!=">{"!="}</option>
                          <option value=">=">{">="}</option>
                          <option value="<=">{"<="}</option>
                          <option value="<">{"<"}</option>
                          <option value=">">{">"}</option>
                          <option value="contains">{"contains"}</option>
                          <option value="is">{"is"}</option>
                          <option value="is_not">{"is not"}</option>
                        </select>
                        {attr.operator &&
                          (numberOperators.includes(attr.operator) ||
                            stringOperators.includes(attr.operator)) && (
                            <div className="w-56 text-sm truncate">
                              <Input
                                size="sm"
                                type={numberOperators.includes(attr.operator) ? "number" : "text"}
                                onChange={(e) =>
                                  handleChangeTargetAttribute(
                                    attr.target,
                                    attr.operator,
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  numberOperators.includes(attr.operator)
                                    ? "Input number..."
                                    : "Input text..."
                                }
                              />
                            </div>
                          )}
                        {checkAttributeFilterStatus(attr) && (
                          <div className="text-green-600 mx-2 flex items-center">
                            <StatusGood className="stroke-current" color="blank" />
                          </div>
                        )}
                      </div>
                      <hr className="shadow border-gray-300 -mx-2 my-2 border-dotted" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenomicAnnotationFeaturesFilterForm;
