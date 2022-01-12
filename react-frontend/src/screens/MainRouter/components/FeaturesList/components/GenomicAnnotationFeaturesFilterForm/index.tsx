import { Search, StatusGood } from "grommet-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  fetchFeatureAttributeKeys,
  fetchFeatureTypes,
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
  assemblyID,
}: {
  setSearch: (search: string) => void;
  search: string;
  setFilter: Dispatch<SetStateAction<FilterFeatures>>;
  filter: FilterFeatures;
  isFilterOpen?: Dispatch<SetStateAction<boolean>>;
  assemblyID?: number;
}) => {
  const [toggleFilterSelection, setToggleFilterSelection] = useState<boolean>(false);

  const [taxa, setTaxa] = useState<INcbiTaxon[]>([]);
  const [filteredTaxa, setFilteredTaxa] = useState<INcbiTaxon[]>([]);
  const [featureTypes, setFeatureTypes] = useState<string[]>([]);
  const [filteredFeatureTypes, setFilteredFeatureTypes] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [filteredAttributes, setFilteredAttributes] = useState<string[]>([]);
  const [targetAttributes, setTargetAttributes] = useState<ITargetAttribute[]>([]);
  const [triggerSetFilter, setTriggerSetFilter] = useState<boolean>(false);

  const [taxonSearch, setTaxonSearch] = useState<string>("");
  const [featureTypeSearch, setFeatureTypeSearch] = useState<string>("");
  const [attributeSearch, setAttributeSearch] = useState<string>("");

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
    loadFeatureTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection, filter.taxonIDs]);

  useEffect(() => {
    loadAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadFeatureTypes = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token)
      await fetchFeatureTypes(userID, token, assemblyID || 0, filter.taxonIDs || []).then(
        (response) => {
          if (response?.payload) {
            setFeatureTypes(response.payload);
            setFilteredFeatureTypes(response.payload);
          }

          if (response?.notification) {
            response.notification.forEach((n) => handleNewNotification(n));
          }
        }
      );
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

  const handleSelectFeatureTypes = (featureTypes: HTMLOptionsCollection) => {
    let values: string[] = [];
    for (let i = 0, l = featureTypes.length; i < l; i++) {
      if (featureTypes[i].value === "-1" && featureTypes[i].selected) {
        values = [];
        break;
      }
      if (featureTypes[i].selected) {
        values.push(featureTypes[i].value);
      }
    }

    if (values.length) {
      setFilter((prevState) => {
        return { ...prevState, featureTypes: values };
      });
    } else {
      setFilter((prevState) => {
        delete prevState.featureTypes;
        return { ...prevState };
      });
    }
  };

  const handleSelectAttributes = (attributes: HTMLOptionsCollection) => {
    let values: ITargetAttribute[] = targetAttributes.filter((element) => {
      for (let i = 0, l = attributes.length; i < l; i++) {
        if (attributes[i].selected && attributes[i].value === element.target) {
          return true;
        }
      }
      return false;
    });

    let index: number;
    let l: number;
    for (index = 0, l = attributes.length; index < l; index++) {
      if (attributes[index].value === "-1" && attributes[index].selected) {
        values = [];
        break;
      }
      if (
        attributes[index].selected &&
        !values.find((element) => element.target === attributes[index].value)
      ) {
        values.push({ target: attributes[index].value });
      }
    }
    setTargetAttributes(values);
  };

  const handleChangeTaxaSearch = (search: string) => {
    setTaxonSearch(search);
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

  const handleChangeFeatureTypeSearch = (search: string) => {
    setFeatureTypeSearch(search);
    if (search) {
      setFilteredFeatureTypes((prevState) =>
        prevState.filter((type) => type.includes(search) || filter.featureTypes?.includes(type))
      );
    } else {
      setFilteredFeatureTypes(featureTypes);
    }
  };

  const handleChangeAttributeSearch = (search: string) => {
    setAttributeSearch(search);
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
    const targets: ITargetAttribute[] = targetAttributes.map((attr) => {
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
      const index = filter.featureAttributes?.findIndex(
        (element) => attr.target === element.target
      );

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
      {toggleFilterSelection && <hr className="shadow my-6 border-gray-300 animate-grow-y" />}
      {toggleFilterSelection && (
        <div className="px-4 animate-grow-y pb-4 flex justify-around items-start">
          {!assemblyID && (
            <div className="mr-4">
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
                className="mt-4 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
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
          )}

          <div className="mx-4">
            Feature types
            <hr className="shadow border-gray-300 -mx-2" />
            <div className="mt-2 w-48">
              <Input
                size="sm"
                placeholder="Search..."
                onChange={(e) => handleChangeFeatureTypeSearch(e.target.value)}
                value={featureTypeSearch}
              />
            </div>
            <select
              multiple
              className="mt-2 text-gray-700 text-sm min-h-1/4 max-h-50 w-48 border-2 border-gray-300 px-1 rounded-lg"
              onChange={(e) => handleSelectFeatureTypes(e.target.options)}
            >
              <option value={-1} className="px-4 py-1 border-b text-sm font-semibold">
                All
              </option>
              {filteredFeatureTypes &&
                filteredFeatureTypes.length > 0 &&
                filteredFeatureTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="px-4 py-1 border-b text-sm font-semibold truncate"
                  >
                    {type}
                  </option>
                ))}
            </select>
          </div>

          <div className="ml-2">
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
                <div className="px-8">
                  <div>Selected attributes:</div>
                  <hr className="shadow border-gray-300 -mx-2 mb-2 border-dotted" />
                  {targetAttributes.map((attr) => (
                    <div key={attr.target}>
                      <div className="flex items-center py-1">
                        <div className="w-px bg-gray-300 h-4 mr-4" />
                        <div className="w-56 text-sm truncate text-right">{attr.target}</div>
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
