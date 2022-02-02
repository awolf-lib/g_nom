import { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import "../../../../../../App.css";
import { useNotification } from "../../../../../../components/NotificationProvider";
import { fetchTaxonTree } from "../../../../../../api";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { Contract, Expand, Search, Sort, Vulnerability } from "grommet-icons";

import Tree from "react-d3-tree";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";
import Button from "../../../../../../components/Button";
import AssembliesGridElement from "../AssembliesGridElement";

const AssembliesTreeViewer = ({ filter, setFilter, assemblies, loading }) => {
  const [tree, setTree] = useState({});
  const [fullTree, setFullTree] = useState({});
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [expandTree, setExpandTree] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [currentNode, setCurrentNode] = useState("root");
  const [contractTarget, setContractTarget] = useState(-1);
  const ref = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    loadTree();
    setHeight(ref.current.clientHeight);
    setWidth(ref.current.clientWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!filter || !filter.taxonIDs) {
      setCurrentNode("root");
    }
  }, [filter]);

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
    const userID = JSON.parse(sessionStorage.getItem("userID") || "");
    const token = JSON.parse(sessionStorage.getItem("token") || "");
    const response = await fetchTaxonTree(userID, token);

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

    if (response && response.notification && response.notification.length > 0) {
      response.notification.map((not) => handleNewNotification(not));
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
    setFilter((prevState) => {
      return { ...prevState, taxonIDs: getChildrenTaxIds(nodeDatum).sort() };
    });
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

  const handleToggleBranch = (node) => {
    if (node && node.data && node.data.__rd3t) {
      node.data.__rd3t.collapsed = !node.data.__rd3t.collapsed;
    }

    if (node && node.data && node.data.children) {
      node.data.children.forEach((childNode) => {
        handleToggleBranch(childNode);
      });
    }
  };

  const nodeClass = (nodeDatum) => {
    return classNames(
      "flex items-center text-xs text-white text-center font-bold max-w-min p-2 border-2 border-black border-inset rounded-lg border",
      {
        "bg-green-800 hover:bg-green-500": nodeDatum.name !== currentNode,
        "bg-green-500 hover:bg-green-300": nodeDatum.name === currentNode,
      }
    );
  };
  const renderForeignObjectNode = (node) => {
    const { nodeDatum, toggleNode, foreignObjectProps, hierarchyPointNode } = node;
    return (
      <foreignObject
        {...foreignObjectProps}
        x="0"
        y={nodeDatum.imagePath || !nodeDatum.children ? "-45" : "-16"}
      >
        <div>
          <div
            className="w-24"
            onClick={() => {
              handleToggleBranch(hierarchyPointNode);
            }}
          >
            {nodeDatum.imagePath || !nodeDatum.children ? (
              <div className="border border-black rounded-lg overflow-hidden h-24 p-px">
                <SpeciesProfilePictureViewer
                  taxonID={nodeDatum.id}
                  imagePath={nodeDatum.imagePath}
                  useTimestamp={false}
                />
              </div>
            ) : (
              <div>
                <div
                  className={nodeClass(nodeDatum)}
                  onMouseEnter={() => setContractTarget(nodeDatum.id)}
                  onMouseLeave={() => setContractTarget(-1)}
                >
                  {nodeDatum.id == contractTarget ? (
                    <div className="w-6 h-6">
                      <Contract className="stroke-current animate-fade-in-fast" color="blank" />
                    </div>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center mt-2">
            <div
              onClick={() => {
                loadTaxa(nodeDatum);
                executeScroll();
                setCurrentNode(nodeDatum.name);
              }}
              className="bg-gray-600 text-white p-2 rounded-lg flex items-center cursor-pointer hover:bg-gray-500 shadow"
            >
              <Sort size="small" className="stroke-current" color="blank" />
            </div>
            <div className="ml-2">
              <div className="text-xs font-bold">{nodeDatum.name}</div>
              {nodeDatum.rank && <div className="text-xs">{nodeDatum.rank}</div>}
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
          <div className="w-full bg-gray-500 rounded-lg px-4 p-2 text-white font-bold mb-4 flex">
            Results:
            {loading && (
              <div className="px-4">
                <LoadingSpinner label="Loading..." />
              </div>
            )}
          </div>
          <div className="w-32 ml-4">
            <Button label="Scroll to top" color="secondary" onClick={() => executeScrollTree()} />
          </div>
        </div>
        {assemblies && assemblies.length > 0 ? (
          <div>
            <div className="ml-12">
              <span>Last common ancestor:</span>
              <span className="font-bold text-xl ml-2">{currentNode}</span>
            </div>
            <hr className="m-8 mt-2 shadow" />
            <div className="animate-grow-y rounded-lg grid gap-8 grid-cols-2 mt-8 px-8">
              {assemblies.map((assembly, index) => {
                return (
                  <div key={assembly.id} className="animate-fade-in">
                    <AssembliesGridElement
                      assembly={assembly}
                      fcatMode={1}
                      renderDelay={index + 1}
                    />
                  </div>
                );
              })}
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
