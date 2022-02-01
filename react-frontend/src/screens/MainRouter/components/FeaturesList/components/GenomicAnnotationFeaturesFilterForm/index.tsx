import { Search, StatusGood } from "grommet-icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  fetchFeatureAttributeKeys,
  fetchFeatureSeqIDs,
  fetchFeatureTypes,
  fetchTaxaWithAssemblies,
  FilterFeatures,
  INcbiTaxon,
  ITargetAttribute,
  NotificationObject,
} from "../../../../../../api";
import Button from "../../../../../../components/Button";
import Input from "../../../../../../components/Input";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";
import { useNotification } from "../../../../../../components/NotificationProvider";

const GenomicAnnotationFeaturesFilterForm = ({
  search,
  setSearch,
  filter,
  setFilter,
  isFilterOpen,
  assemblyID,
  loading,
  title,
}: {
  setSearch: (search: string) => void;
  search: string;
  setFilter: Dispatch<SetStateAction<FilterFeatures>>;
  filter: FilterFeatures;
  isFilterOpen?: Dispatch<SetStateAction<boolean>>;
  assemblyID?: number;
  loading: boolean;
  title: string;
}) => {
  const [toggleFilterSelection, setToggleFilterSelection] = useState<boolean>(false);

  const [taxa, setTaxa] = useState<INcbiTaxon[]>([]);
  const [filteredTaxa, setFilteredTaxa] = useState<INcbiTaxon[]>([]);
  const [featureTypes, setFeatureTypes] = useState<string[]>([]);
  const [filteredFeatureTypes, setFilteredFeatureTypes] = useState<string[]>([]);
  const [featureSeqIDs, setFeatureSeqIDs] = useState<string[]>([]);
  const [filteredFeatureSeqIDs, setFilteredFeatureSeqIDs] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [filteredAttributes, setFilteredAttributes] = useState<string[]>([]);
  const [targetAttributes, setTargetAttributes] = useState<ITargetAttribute[]>([]);
  const [triggerSetFilter, setTriggerSetFilter] = useState<boolean>(false);

  const [taxonSearch, setTaxonSearch] = useState<string>("");
  const [featureSeqIDSearch, setFeatureSeqIDSearch] = useState<string>("");
  const [featureTypeSearch, setFeatureTypeSearch] = useState<string>("");
  const [attributeSearch, setAttributeSearch] = useState<string>("");

  const [searchForm, setSearchForm] = useState<string>("");
  const [filterForm, setFilterForm] = useState<FilterFeatures>({});

  useEffect(() => {
    setSearchForm(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setFilterForm(filter);
  }, [filter]);

  useEffect(() => {
    loadTaxa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection]);

  useEffect(() => {
    loadFeatureSeqIDs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection, filterForm.taxonIDs]);

  useEffect(() => {
    loadFeatureTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection, filterForm.taxonIDs, filterForm.featureSeqIDs]);

  useEffect(() => {
    loadAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFilterSelection, filterForm.taxonIDs, filterForm.featureTypes]);

  useEffect(() => {
    if (triggerSetFilter) {
      if (targetAttributes?.length) {
        setFilterForm((prevState) => {
          return {
            ...prevState,
            featureAttributes: targetAttributes.filter(
              (element) => element.target && element.operator && element.value
            ),
          };
        });
      } else {
        setFilterForm((prevState) => {
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

  const loadFeatureSeqIDs = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (
      userID &&
      token &&
      ((filterForm && filterForm.taxonIDs && filterForm.taxonIDs.length === 1) || assemblyID)
    )
      await fetchFeatureSeqIDs(userID, token, assemblyID || 0, filterForm.taxonIDs || []).then(
        (response) => {
          if (response?.payload) {
            setFeatureSeqIDs(response.payload);
            setFilteredFeatureSeqIDs(response.payload);
          }

          if (response?.notification) {
            response.notification.forEach((n) => handleNewNotification(n));
          }
        }
      );
  };

  const loadFeatureTypes = async () => {
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");

    if (userID && token)
      await fetchFeatureTypes(
        userID,
        token,
        assemblyID || 0,
        filterForm.taxonIDs || [],
        filterForm.featureSeqIDs || []
      ).then((response) => {
        if (response?.payload) {
          setFeatureTypes(response.payload);
          setFilteredFeatureTypes(response.payload);
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
      await fetchFeatureAttributeKeys(
        userID,
        token,
        assemblyID || 0,
        filterForm.taxonIDs || [],
        filterForm.featureTypes || []
      ).then((response) => {
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
      setFilterForm((prevState) => {
        return { ...prevState, taxonIDs: values };
      });
    } else {
      setFilterForm((prevState) => {
        delete prevState.taxonIDs;
        return { ...prevState };
      });
    }

    setFilteredFeatureSeqIDs(featureSeqIDs);
    setFilteredFeatureTypes(featureTypes);
  };

  const handleSelectFeatureSeqIDs = (seqIDs: HTMLOptionsCollection) => {
    let values: string[] = [];
    for (let i = 0, l = seqIDs.length; i < l; i++) {
      if (seqIDs[i].value === "-1" && seqIDs[i].selected) {
        values = [];
        break;
      }
      if (seqIDs[i].selected) {
        values.push(seqIDs[i].value);
      }
    }

    if (values.length) {
      setFilterForm((prevState) => {
        return { ...prevState, featureSeqIDs: values };
      });
    } else {
      setFilterForm((prevState) => {
        delete prevState.featureSeqIDs;
        return { ...prevState };
      });
    }

    setFilteredFeatureTypes(featureTypes);
    setFilteredAttributes(attributes);
  };

  const handleSelectFeatureTypes = (types: HTMLOptionsCollection) => {
    let values: string[] = [];
    for (let i = 0, l = types.length; i < l; i++) {
      if (types[i].value === "-1" && types[i].selected) {
        values = [];
        break;
      }
      if (types[i].selected) {
        values.push(types[i].value);
      }
    }

    if (values.length) {
      setFilterForm((prevState) => {
        return { ...prevState, featureTypes: values };
      });
    } else {
      setFilterForm((prevState) => {
        delete prevState.featureTypes;
        return { ...prevState };
      });
    }

    setFilteredAttributes(attributes);
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

  const handleChangeTaxaSearch = (searchString: string) => {
    setTaxonSearch(searchString);
    if (searchString) {
      setFilteredTaxa((prevState) =>
        prevState.filter(
          (taxon) =>
            taxon.scientificName.includes(searchString) || filterForm.taxonIDs?.includes(taxon.id)
        )
      );
    } else {
      setFilteredTaxa(taxa);
    }
  };

  const handleChangeFeatureSeqIDSearch = (searchString: string) => {
    setFeatureSeqIDSearch(searchString);
    if (searchString) {
      setFilteredFeatureSeqIDs((prevState) =>
        prevState.filter(
          (seqID) => seqID.includes(searchString) || filterForm.featureSeqIDs?.includes(seqID)
        )
      );
    } else {
      setFilteredFeatureSeqIDs(featureSeqIDs);
    }
  };

  const handleChangeFeatureTypeSearch = (searchString: string) => {
    setFeatureTypeSearch(searchString);
    if (searchString) {
      setFilteredFeatureTypes((prevState) =>
        prevState.filter(
          (type) => type.includes(searchString) || filterForm.featureTypes?.includes(type)
        )
      );
    } else {
      setFilteredFeatureTypes(featureTypes);
    }
  };

  const handleChangeAttributeSearch = (searchString: string) => {
    setAttributeSearch(searchString);
    if (searchString) {
      setFilteredAttributes((prevState) =>
        prevState.filter(
          (attribute) =>
            attribute.includes(searchString) ||
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
    if (filterForm.featureAttributes?.length) {
      const index = filterForm.featureAttributes?.findIndex(
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
    setSearchForm("");
    setFilter({});
    setFilterForm({});
    setTargetAttributes([]);
    setFeatureSeqIDs(featureSeqIDs);
    setFilteredAttributes(attributes);
    setFilteredTaxa(taxa);
    setFeatureTypes(featureTypes);
    setTaxonSearch("");
    setAttributeSearch("");
    setFeatureSeqIDSearch("");
    setFeatureTypeSearch("");
  };

  return (
    <div>
      <div className="w-full h-10 flex justify-around items-center">
        <div>{title}</div>
        {loading && (
          <div className="flex h-full px-4">
            <LoadingSpinner label="Loading..." />
          </div>
        )}
        <div className="w-96 flex items-center">
          <div className="w-full px-2">
            <Input
              placeholder="Search..."
              onChange={(e) => setSearchForm(e.target.value)}
              value={searchForm}
            />
          </div>
          <div>
            <Button color="primary" size="sm" onClick={() => setSearch(searchForm)}>
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
        <div className="flex justify-center items-center text-xs font-normal min-w-max px-2">
          {Object.keys(filterForm).length + " active filters!"}
        </div>
      </div>
      {toggleFilterSelection && <hr className="shadow my-6 border-gray-300 animate-grow-y" />}
      {toggleFilterSelection && (
        <div>
          <div className="px-4 animate-grow-y pb-4 flex justify-around items-start">
            {!assemblyID && (
              <div className="mr-4 animate-fade-in">
                Taxon
                <hr className="shadow border-gray-300 -mx-2" />
                <div className="mt-2 w-40">
                  <Input
                    size="sm"
                    placeholder="Search..."
                    onChange={(e) => handleChangeTaxaSearch(e.target.value)}
                    value={taxonSearch}
                  />
                </div>
                <select
                  multiple
                  className="mt-2 text-gray-700 min-h-1/4 max-h-50 w-40 border-2 border-gray-300 px-1 rounded-lg"
                  onChange={(e) => handleSelectTaxa(e.target.options)}
                >
                  <option
                    value={-1}
                    className="px-4 py-1 border-b text-xs font-semibold text-center"
                  >
                    All
                  </option>
                  {filteredTaxa &&
                    filteredTaxa.length > 0 &&
                    filteredTaxa.map((taxon) => (
                      <option
                        key={taxon.id}
                        value={taxon.id}
                        className="px-2 py-1 border-b text-xs font-semibold truncate text-center"
                      >
                        {taxon.scientificName}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {((filterForm && filterForm.taxonIDs && filterForm.taxonIDs.length === 1) ||
              assemblyID) && (
              <div className="mx-4 animate-fade-in">
                Feature seq IDs
                <hr className="shadow border-gray-300 -mx-2" />
                <div className="mt-2 w-40">
                  <Input
                    size="sm"
                    placeholder="Search..."
                    onChange={(e) => handleChangeFeatureSeqIDSearch(e.target.value)}
                    value={featureSeqIDSearch}
                  />
                </div>
                <select
                  multiple
                  className="mt-2 text-gray-700 min-h-1/4 max-h-50 w-40 border-2 border-gray-300 px-1 rounded-lg"
                  onChange={(e) => handleSelectFeatureSeqIDs(e.target.options)}
                >
                  <option
                    value={-1}
                    className="px-4 py-1 border-b text-xs font-semibold text-center"
                  >
                    All
                  </option>
                  {filteredFeatureSeqIDs &&
                    filteredFeatureSeqIDs.length > 0 &&
                    filteredFeatureSeqIDs
                      .sort()
                      .slice(0, 30)
                      .map((seqID) => (
                        <option
                          key={seqID}
                          value={seqID}
                          className="px-2 py-1 border-b text-xs font-semibold truncate text-center"
                        >
                          {seqID}
                        </option>
                      ))}
                  <option className="px-4 py-1 border-b text-xs font-semibold text-center">
                    Search for more...
                  </option>
                </select>
              </div>
            )}

            <div className="mx-4 animate-fade-in">
              Feature types
              <hr className="shadow border-gray-300 -mx-2" />
              <div className="mt-2 w-40">
                <Input
                  size="sm"
                  placeholder="Search..."
                  onChange={(e) => handleChangeFeatureTypeSearch(e.target.value)}
                  value={featureTypeSearch}
                />
              </div>
              <select
                multiple
                className="mt-2 text-gray-700 min-h-1/4 max-h-50 w-40 border-2 border-gray-300 px-1 rounded-lg"
                onChange={(e) => handleSelectFeatureTypes(e.target.options)}
              >
                <option value={-1} className="px-4 py-1 border-b text-xs font-semibold text-center">
                  All
                </option>
                {filteredFeatureTypes &&
                  filteredFeatureTypes.length > 0 &&
                  filteredFeatureTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="px-2 py-1 border-b text-xs font-semibold truncate text-center"
                    >
                      {type}
                    </option>
                  ))}
              </select>
            </div>

            <div className="ml-4 animate-fade-in">
              Attributes
              <hr className="shadow border-gray-300 -mx-2" />
              <div className="flex mt-2">
                <div>
                  <div className="w-40">
                    <Input
                      size="sm"
                      placeholder="Search..."
                      onChange={(e) => handleChangeAttributeSearch(e.target.value)}
                      value={attributeSearch}
                    />
                  </div>
                  <select
                    multiple
                    className="mt-2 text-gray-700 min-h-1/4 max-h-50 w-40 border-2 border-gray-300 px-1 rounded-lg"
                    onChange={(e) => handleSelectAttributes(e.target.options)}
                  >
                    <option
                      value="-1"
                      className="px-4 py-1 border-b text-xs font-semibold text-center"
                    >
                      None
                    </option>
                    {filteredAttributes &&
                      filteredAttributes.length > 0 &&
                      filteredAttributes.map((attribute) => (
                        <option
                          key={attribute}
                          value={attribute}
                          className="px-2 py-1 border-b text-xs font-semibold truncate text-center"
                        >
                          {attribute}
                        </option>
                      ))}
                  </select>
                </div>

                {targetAttributes?.length > 0 && (
                  <div className="px-8 animate-fade-in">
                    <div>Selected attributes:</div>
                    <hr className="shadow border-gray-300 -mx-2 mb-2 border-dotted" />
                    {targetAttributes.map((attr) => (
                      <div key={attr.target} className="animate-fade-in">
                        <div className="flex items-center py-1">
                          <div className="w-px bg-gray-300 h-4 mr-4" />
                          <div className="w-48 text-sm truncate text-right">{attr.target}</div>
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
                            <option value="is not">{"is not"}</option>
                          </select>
                          {attr.operator &&
                            (numberOperators.includes(attr.operator) ||
                              stringOperators.includes(attr.operator)) && (
                              <div className="w-48 text-sm truncate animate-fade-in">
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
                            <div className="text-green-600 mx-2 flex items-center animate-fade-in">
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
          <hr />
          <div className="w-full mt-6 flex justify-center w-96">
            <div className="w-96">
              <Button
                label="Get data..."
                onClick={() => {
                  setFilter(filterForm);
                  setSearch(searchForm);
                  if (Object.keys(filterForm).length < 1) {
                    handleNewNotification({
                      label: "Info",
                      message: "Select at least one filter...",
                      type: "info",
                    });
                  }
                }}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenomicAnnotationFeaturesFilterForm;
