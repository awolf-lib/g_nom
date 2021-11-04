import { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import "../../App.css";
import { useNotification } from "../NotificationProvider";
import { fetchAssembliesByTaxonIDs, fetchTaxonTree } from "../../api";
import SpeciesProfilePictureViewer from "../SpeciesProfilePictureViewer";
import { Expand, Vulnerability } from "grommet-icons";

import Tree from "react-d3-tree";
import AssemblyInfoCard from "../AssemblyInfoCard";
import LoadingSpinner from "../LoadingSpinner";
import Button from "../Button";

const AssembliesTreeViewer = () => {
  const [tree, setTree] = useState({});
  const [fullTree, setFullTree] = useState({});
  const [taxa, setTaxa] = useState([]);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [expandTree, setExpandTree] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [showElements, setShowElements] = useState(10);
  const [currentNode, setCurrentNode] = useState("");
  const ref = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    loadTree();
    setHeight(ref.current.clientHeight);
    setWidth(ref.current.clientWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // notifications
  const dispatch = useNotification();

  const handleNewNotification = (notification) => {
    dispatch({
      label: notification.label,
      message: notification.message,
      type: notification.type,
    });
  };

  const loadTree = async () => {
    setLoadingTree(true);
    const response = await fetchTaxonTree();

    if (response && response.payload) {
      setFullTree(response.payload);
      let collapsedTree = collapseTree(response.payload);
      if (collapsedTree.id !== 1) {
        collapsedTree = {
          ...response.payload,
          children: [collapsedTree],
        };
      }
      setTree(collapsedTree);
    }

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
    }
    setLoadingTree(false);
  };

  const collapseTree = (tree) => {
    if (tree.children && tree.children.length > 0) {
      if (tree.children.length === 1) {
        return collapseTree(tree.children[0]);
      } else {
        let children = [];
        tree.children.forEach((element) => {
          children.push(collapseTree(element));
        });
        return { ...tree, children: children };
      }
    } else {
      return tree;
    }
  };

  const loadTaxa = async (nodeDatum) => {
    const response = await fetchAssembliesByTaxonIDs(
      getChildrenTaxIds(nodeDatum)
    );

    if (response && response.payload) {
      setTaxa(response.payload);
    }

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
    }
  };

  const getChildrenTaxIds = (nodeDatum) => {
    let current = nodeDatum;
    let taxIds = [];
    let todo = [];

    taxIds.push(current.id);
    if (current.children && current.children.length > 0) {
      todo = todo.concat(current.children);
    }

    while (todo && todo.length > 0) {
      current = todo.pop();
      taxIds.push(current.id);
      if (current.children && current.children.length > 0) {
        todo = todo.concat(current.children);
      }
    }

    return taxIds;
  };

  const nodeClass = (nodeDatum) => {
    return classNames(
      "text-xs text-white text-center font-bold w-8 border-2 border-black border-inset rounded-lg border py-4",
      {
        "bg-green-800 hover:bg-green-500": nodeDatum.name !== currentNode,
        "bg-green-500 hover:bg-green-300": nodeDatum.name === currentNode,
      }
    );
  };
  const renderForeignObjectNode = ({
    nodeDatum,
    toggleNode,
    foreignObjectProps,
  }) => {
    return (
      <foreignObject
        {...foreignObjectProps}
        x="0"
        y={nodeDatum.imageStatus || !nodeDatum.children ? "-45" : "-16"}
      >
        <div>
          <div
            className="w-24"
            onClick={() => {
              loadTaxa(nodeDatum);
              executeScroll();
              setShowElements(10);
              setCurrentNode(nodeDatum.name);
              // toggleNode();
            }}
          >
            {nodeDatum.imageStatus || !nodeDatum.children ? (
              <div className="border border-black rounded-lg overflow-hidden">
                <SpeciesProfilePictureViewer
                  taxonID={nodeDatum.ncbiID}
                  imageStatus={nodeDatum.imageStatus}
                />
              </div>
            ) : (
              <div>
                <div className={nodeClass(nodeDatum)} />
              </div>
            )}
          </div>
          <div>
            <div className="mt-2">
              <div className="text-xs font-bold">{nodeDatum.name}</div>
              {nodeDatum.rank && (
                <div className="text-xs">{nodeDatum.rank}</div>
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    );
  };

  const executeScroll = () => cardsRef.current.scrollIntoView();
  const executeScrollTree = () => window.scrollTo(0, 0);

  const nodeSize = { x: 200, y: 200 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };
  return (
    <div className="animate-grow-y mb-16 w-full">
      <div ref={ref} className="w-full">
        {!loadingTree ? (
          <div className="border-4 border-dashed shadow-lg rounded-lg h-75">
            {tree && tree.id && fullTree && fullTree.id && (
              <div className="h-full relative">
                <div className="absolute top-0 left-0 ml-6 mt-4 font-bold text-xl">
                  Local lineage tree
                </div>
                <Tree
                  data={expandTree ? fullTree : tree}
                  orientation="horizontal"
                  separation={{ siblings: 2, nonSiblings: 3 }}
                  renderCustomNodeElement={(rd3tProps) =>
                    renderForeignObjectNode({
                      ...rd3tProps,
                      foreignObjectProps,
                    })
                  }
                  pathFunc="step"
                  zoom={0.7}
                  depthFactor={300}
                  translate={{ x: width / 10, y: height / 2 }}
                  enableLegacyTransitions={true}
                  transitionDuration={800}
                />
                <div className="absolute bottom-0 right-0 mb-4 flex justify-end w-full">
                  {/* <ZoomIn
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer"
                    color="blank"
                    onClick={() => setZoom((prevState) => prevState + 0.1)}
                  />
                  <ZoomOut
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer"
                    color="blank"
                    onClick={() => setZoom((prevState) => prevState - 0.1)}
                  /> */}
                  <Vulnerability
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer mr-4"
                    color="blank"
                    onClick={() => {
                      setLoadingTree(true);
                      setTimeout(() => setLoadingTree(false), 200);
                    }}
                  />
                  <Expand
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer mr-4"
                    color="blank"
                    onClick={() => {
                      setExpandTree((prevState) => !prevState);
                      setLoadingTree(true);
                      setTimeout(() => setLoadingTree(false), 200);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-4 border-dashed shadow-lg rounded-lg p-4 h-75">
            <LoadingSpinner label="Generating tree..." />
          </div>
        )}
      </div>
      <div className="mt-8 min-h-1/2" ref={cardsRef}>
        <div className="flex">
          <div className="w-full bg-gray-500 rounded-lg px-4 p-2 text-white font-bold mb-4">
            Results:
          </div>
          <div className="w-32 ml-4">
            <Button
              label="Scroll to top"
              color="secondary"
              onClick={() => executeScrollTree()}
            />
          </div>
        </div>
        {taxa && taxa.length > 0 ? (
          <div>
            <div className="ml-12">
              <span>Last common ancestor:</span>
              <span className="font-bold text-xl ml-2">{currentNode}</span>
            </div>
            <hr className="m-8 mt-2 shadow" />
            <div className="animate-grow-y rounded-lg grid gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
              {taxa.map((assembly, index) => {
                if (index < showElements) {
                  return (
                    <div key={assembly.id} className="animate-fade-in">
                      <AssemblyInfoCard
                        id={assembly.id}
                        scientificName={assembly.scientificName}
                        taxonID={assembly.ncbiTaxonID}
                        assemblyName={assembly.name}
                        types={assembly.types}
                        imageStatus={assembly.imageStatus}
                        key={assembly.id}
                      />
                    </div>
                  );
                } else {
                  return <div />;
                }
              })}
            </div>
            <hr className="m-8 shadow" />
            <div className="flex justify-around">
              {showElements > 10 && (
                <div className="mt-2">
                  <div className="flex justify-center">
                    <div className="w-32">
                      <Button
                        color="nav"
                        label="View less..."
                        onClick={() =>
                          setShowElements((prevState) => prevState - 10)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
              {showElements < taxa.length && (
                <div className="mt-2">
                  <div className="flex justify-center">
                    <div className="w-32">
                      <Button
                        color="nav"
                        label="View more..."
                        onClick={() =>
                          setShowElements((prevState) => prevState + 10)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex w-full font-semibold text-center justify-center">
            No taxa selected!
          </div>
        )}
      </div>
    </div>
  );
};

AssembliesTreeViewer.defaultProps = {};

AssembliesTreeViewer.propTypes = {};

export default AssembliesTreeViewer;
