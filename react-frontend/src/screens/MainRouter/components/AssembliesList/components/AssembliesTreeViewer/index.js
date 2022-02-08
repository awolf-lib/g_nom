import { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import "../../../../../../App.css";
import { useNotification } from "../../../../../../components/NotificationProvider";
import { fetchTaxonTree } from "../../../../../../api";
import SpeciesProfilePictureViewer from "../../../../../../components/SpeciesProfilePictureViewer";
import { Contract, Expand, Sort, Vulnerability } from "grommet-icons";

import Tree from "react-d3-tree";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";
import Button from "../../../../../../components/Button";
import AssembliesGridElement from "../AssembliesGridElement";
import Slider from "../../../../../../components/Slider";

const AssembliesTreeViewer = ({ filter, setFilter, assemblies, loading }) => {
  const [originalTree, setOriginalTree] = useState({});
  const [tree, setTree] = useState({});
  const [fullTree, setFullTree] = useState({});
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [expandTree, setExpandTree] = useState(0);
  const [loadingTree, setLoadingTree] = useState(false);
  const [currentNode, setCurrentNode] = useState("root");
  const [contractTarget, setContractTarget] = useState(-1);
  const [toggleBranch, setToggleBranch] = useState(1);
  const [closeNeighbors, setCloseNeighbors] = useState(1);
  const [togglePseudoNodes, setTogglePseudoNodes] = useState(1);
  const [togglePseudoNodesTimeout, setTogglePseudoNodesTimeout] = useState(1);
  const ref = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
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
      const fullTreeInfo = getMaxDepth(response.payload);
      const leavesFullTree = fullTreeInfo[0];
      const maxDepthFullTree = fullTreeInfo[1];
      if (togglePseudoNodes) {
        if (maxDepthFullTree) {
          setOriginalTree(response.payload);
          setFullTree(generatePseudoTree(response.payload, maxDepthFullTree, leavesFullTree));
        }
      } else {
        setFullTree(response.payload, maxDepthFullTree, leavesFullTree);
      }

      let collapsedTree = collapseTree(response.payload);
      if (collapsedTree.id !== 1) {
        collapsedTree = {
          ...response.payload,
          children: [collapsedTree],
        };
      }
      const treeInfo = getMaxDepth(collapsedTree);
      const leaves = treeInfo[0];
      const maxDepth = treeInfo[1];
      if (togglePseudoNodes) {
        if (maxDepth) {
          setTree(generatePseudoTree(collapsedTree, maxDepth, leaves));
        }
      } else {
        setTree(collapsedTree, maxDepth, leaves);
      }
    }

    if (response && response.notification && response.notification.length > 0) {
      response.notification.map((not) => handleNewNotification(not));
    }
    setLoadingTree(false);
  };

  useEffect(() => {
    clearTimeout(togglePseudoNodesTimeout);
    setLoadingTree(true);
    setTimeout(() => {
      if (originalTree && originalTree.id) {
        if (togglePseudoNodes) {
          const fullTreeInfo = getMaxDepth(originalTree);
          const leavesFullTree = fullTreeInfo[0];
          const maxDepthFullTree = fullTreeInfo[1];
          if (maxDepthFullTree) {
            setFullTree((prevState) =>
              generatePseudoTree(prevState, maxDepthFullTree, leavesFullTree)
            );
          }

          const treeInfo = getMaxDepth(tree);
          const leaves = treeInfo[0];
          const maxDepth = treeInfo[1];
          if (maxDepth) {
            setTree((prevState) => generatePseudoTree(prevState, maxDepth, leaves));
          }
        } else {
          setFullTree(originalTree);

          let collapsedTree = collapseTree(originalTree);
          if (collapsedTree.id !== 1) {
            collapsedTree = {
              ...originalTree,
              children: [collapsedTree],
            };
          }

          setTree(collapsedTree);
        }
        setLoadingTree(false);
      } else {
        loadTree();
      }
    }, 400);
  }, [togglePseudoNodes]);

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

  // useEffect(() => {
  //   if (init) {
  //     if (tree && tree.id) {
  //       const treeInfo = getMaxDepth(tree);
  //       const leaves = treeInfo[0];
  //       const maxDepth = treeInfo[1];
  //       if (maxDepth) {
  //         setTree(generatePseudoTree(tree, maxDepth, leaves));
  //         setInit(false);
  //       }
  //     }
  //   }
  // }, [tree, init]);

  // useEffect(() => {
  //   if (init1) {
  //     if (fullTree && fullTree.id) {
  //       const fullTreeInfo = getMaxDepth(fullTree);
  //       const leaves = fullTreeInfo[0];
  //       const maxDepth = fullTreeInfo[1];
  //       if (maxDepth) {
  //         setFullTree(generatePseudoTree(fullTree, maxDepth, leaves));
  //         setInit1(false);
  //       }
  //     }
  //   }
  // }, [fullTree, init1]);

  const getMaxDepth = (node) => {
    let current = { ...node, level: 0 };
    let leaves = {};
    let todo = [];
    let maxDepth = 0;

    if (current.children && current.children.length > 0) {
      todo = todo.concat(
        current.children.map((child) => {
          return { ...child, level: 1 };
        })
      );
    }

    while (todo && todo.length > 0) {
      current = todo.pop();
      if (current.children && current.children.length > 0) {
        let children = current.children.map((child) => {
          return { ...child, level: current.level + 1 };
        });
        todo = todo.concat(children);
      } else {
        if (current.level > maxDepth) {
          maxDepth = current.level;
        }
        leaves[current.id] = current.level;
      }
    }

    return [leaves, maxDepth];
  };

  const generatePseudoTree = (node, maxDepth, leaves) => {
    if (node && node.children) {
      let children = node.children.map((childNode) => {
        return generatePseudoTree(childNode, maxDepth, leaves);
      });
      return { ...node, children: children };
    } else {
      return addPseudoNodes(node, maxDepth, leaves[node.id]);
    }
  };

  const addPseudoNodes = (node, targetLevel, level) => {
    if (level < targetLevel) {
      return {
        ...node,
        pseudo: true,
        children: [
          addPseudoNodes({ ...node, level: node.level + 1, pseudo: true }, targetLevel, level + 1),
        ],
      };
    }
    delete node.pseudo;
    return { ...node, level: node.level + 1 };
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

    if (node && node.children) {
      node.children.forEach((childNode) =>
        handleToggleChildren(childNode, node.data.__rd3t.collapsed)
      );
    }

    if (closeNeighbors) {
      handleCloseNeighbors(node);
    }
  };

  const handleToggleChildren = (node, state) => {
    if (node && node.data && node.data.__rd3t) {
      if (!toggleBranch) {
        if (node.data.pseudo) {
          node.data.__rd3t.collapsed = false;
        } else {
          node.data.__rd3t.collapsed = state;
        }
      } else {
        node.data.__rd3t.collapsed = false;
      }
    }

    if (node && node.children) {
      node.children.forEach((childNode) => {
        handleToggleChildren(childNode, state);
      });
    }
  };

  const handleCloseNeighbors = (node, childID = "") => {
    if (childID) {
      if (node && node.children) {
        node.children.forEach((childNode) => {
          if (
            childNode &&
            childNode.data &&
            childNode.data.__rd3t &&
            childNode.data.id !== childID
          ) {
            childNode.data.__rd3t.collapsed = true;
          }
        });
      }
    }
    if (node && node.parent && node.data && node.data.id) {
      handleCloseNeighbors(node.parent, node.data.id);
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
    const { nodeDatum, foreignObjectProps, hierarchyPointNode, toggleNode } = node;
    return (
      <foreignObject
        {...foreignObjectProps}
        x="0"
        y={nodeDatum.imagePath || !nodeDatum.children ? "-45" : "-16"}
      >
        {(!nodeDatum.pseudo ||
          (hierarchyPointNode &&
            hierarchyPointNode.data &&
            hierarchyPointNode.data.__rd3t &&
            hierarchyPointNode.data.__rd3t.collapsed)) && (
          <div className={!nodeDatum.children && togglePseudoNodes ? "flex" : ""}>
            <div className="w-24" onClick={() => handleToggleBranch(hierarchyPointNode)}>
              {nodeDatum.imagePath || !nodeDatum.children ? (
                <div
                  className="rounded-lg overflow-hidden w-24 h-24"
                  onMouseEnter={() => setContractTarget(nodeDatum.id)}
                  onMouseLeave={() => setContractTarget(-1)}
                >
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
                    {nodeDatum.id === contractTarget ? (
                      <div className="w-6 h-6">
                        {!hierarchyPointNode.data.__rd3t.collapsed ? (
                          <Contract className="stroke-current animate-fade-in-fast" color="blank" />
                        ) : (
                          <Expand className="stroke-current animate-fade-in-fast" color="blank" />
                        )}
                      </div>
                    ) : (
                      <div className="w-6 h-6" />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className={
                !nodeDatum.children && togglePseudoNodes
                  ? "flex items-center max-w-max mx-2"
                  : "flex items-center mt-2"
              }
            >
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
                <div className="text-xs font-bold w-48 truncate">{nodeDatum.name}</div>
                {nodeDatum.rank && <div className="text-xs">{nodeDatum.rank}</div>}
              </div>
            </div>
          </div>
        )}
      </foreignObject>
    );
  };

  const executeScroll = () => cardsRef.current.scrollIntoView();
  const executeScrollTree = () => window.scrollTo(0, 0);

  const nodeSize = { x: 600, y: 150 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };
  const separation = togglePseudoNodes ? 1 : 1.5;
  return (
    <div className="animate-grow-y mb-16 w-full">
      <div ref={ref} className="w-full">
        {!loadingTree ? (
          <div className="border-4 border-dashed shadow-lg rounded-lg h-75">
            {tree && tree.id && fullTree && fullTree.id && (
              <div className="h-full relative">
                <div className="absolute top-0 left-0 ml-6 mt-4 font-bold text-xl select-none">
                  Local lineage tree
                </div>
                <Tree
                  data={expandTree ? fullTree : tree}
                  orientation="horizontal"
                  separation={{ siblings: separation, nonSiblings: separation }}
                  renderCustomNodeElement={(rd3tProps) =>
                    renderForeignObjectNode({
                      ...rd3tProps,
                      foreignObjectProps,
                    })
                  }
                  pathFunc="step"
                  zoom={0.7}
                  depthFactor={expandTree ? 300 : 400}
                  collapsible={true}
                  translate={{ x: width / 10, y: height / 2 }}
                  enableLegacyTransitions={expandTree ? false : true}
                  transitionDuration={600}
                />
                <div className="absolute top-0 right-0 mt-2 mr-2 font-semibold text-sm select-none">
                  <div className="flex items-center justify-between w-48">
                    <div
                      className="hover:text-gray-600 cursor-pointer"
                      onClick={() => setTogglePseudoNodes((prevState) => (prevState ? 0 : 1))}
                    >
                      Align leaves
                    </div>
                    <div className="w-8 ml-2 cursor-pointer">
                      <Slider
                        min={0}
                        max={1}
                        value={togglePseudoNodes}
                        getValue={setTogglePseudoNodes}
                        showValues={false}
                      />
                    </div>
                  </div>
                  <hr className="my-1" />
                  <div className="flex items-center justify-between w-48">
                    <div
                      className="hover:text-gray-600 cursor-pointer"
                      onClick={() => setToggleBranch((prevState) => (prevState ? 0 : 1))}
                    >
                      Toggle full branches
                    </div>
                    <div className="w-8 ml-2">
                      <Slider
                        min={0}
                        max={1}
                        value={toggleBranch}
                        getValue={setToggleBranch}
                        showValues={false}
                      />
                    </div>
                  </div>
                  <hr className="my-1" />
                  <div className="flex items-center justify-between w-48">
                    <div
                      className="hover:text-gray-600 cursor-pointer"
                      onClick={() => setCloseNeighbors((prevState) => (prevState ? 0 : 1))}
                    >
                      Close neighbors
                    </div>
                    <div className="w-8 ml-2">
                      <Slider
                        min={0}
                        max={1}
                        value={closeNeighbors}
                        getValue={setCloseNeighbors}
                        showValues={false}
                      />
                    </div>
                  </div>
                  <hr className="my-1" />
                  <div className="flex items-center justify-between w-48">
                    <div
                      className="hover:text-gray-600 cursor-pointer"
                      onClick={() => setExpandTree((prevState) => (prevState ? 0 : 1))}
                    >
                      Full lineage
                    </div>
                    <div className="w-8 ml-2">
                      <Slider
                        min={0}
                        max={1}
                        value={expandTree}
                        getValue={setExpandTree}
                        showValues={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 mb-4 mr-2 flex">
                  <Vulnerability
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer mr-4"
                    color="blank"
                    onClick={() => {
                      setLoadingTree(true);
                      setTimeout(() => setLoadingTree(false), 200);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-4 border-dashed shadow-lg rounded-lg p-4 h-75 select-none">
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
