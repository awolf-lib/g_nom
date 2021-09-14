import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import "../../App.css";
import PropTypes from "prop-types";
import API from "../../api";
import { useNotification } from "../../components/NotificationProvider";
import SpeciesProfilePictureViewer from "../../components/SpeciesProfilePictureViewer";
import { Expand, ZoomIn, ZoomOut } from "grommet-icons";

import Tree from "react-d3-tree";
import AssemblyInfoCard from "../AssemblyInfoCard";
import LoadingSpinner from "../LoadingSpinner";

const AssembliesTreeViewer = () => {
  const [tree, setTree] = useState({});
  const [fullTree, setFullTree] = useState({});
  const [taxa, setTaxa] = useState([]);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [expandTree, setExpandTree] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [zoom, setZoom] = useState(1);
  const ref = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    loadTree();
    setHeight(ref.current.clientHeight);
    setWidth(ref.current.clientWidth);
  }, []);

  const api = new API();

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
    const response = await api.fetchTaxonTree();

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
    const response = await api.fetchAssembliesByTaxonIDs(
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

  const renderForeignObjectNode = ({
    nodeDatum,
    toggleNode,
    foreignObjectProps,
  }) => {
    return !nodeDatum.imageStatus ? (
      <foreignObject {...foreignObjectProps} x="0" y="-16">
        <div
          onClick={() => {
            loadTaxa(nodeDatum);
            executeScroll();
            // toggleNode();
          }}
        >
          <div className="text-xs text-white text-center font-bold w-8 border-2 border-black border-inset rounded-lg bg-green-800 hover:bg-green-500 border py-4" />
          <div className="mt-2">
            {nodeDatum.name && (
              <div className="text-xs font-bold truncate w-32">
                {nodeDatum.name}
              </div>
            )}
            {nodeDatum.rank && <div className="text-xs">{nodeDatum.rank}</div>}
          </div>
        </div>
      </foreignObject>
    ) : (
      <foreignObject {...foreignObjectProps} x="0" y="-45">
        <div>
          <div
            className="w-24 border border-black rounded-lg overflow-hidden"
            onClick={() => {
              loadTaxa(nodeDatum);
              executeScroll();
              // toggleNode();
            }}
          >
            <SpeciesProfilePictureViewer
              taxonID={nodeDatum.ncbiID}
              imageStatus={nodeDatum.imageStatus}
            />
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

  const nodeSize = { x: 200, y: 200 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };
  return (
    <div className="animate-grow-y mb-16 w-full">
      <div ref={ref} className="w-full h-75">
        {!loadingTree ? (
          <div className="h-75 border-4 border-dashed shadow-lg rounded-lg">
            {tree && tree.id && fullTree && fullTree.id && (
              <div className="h-full relative">
                <Tree
                  data={expandTree ? fullTree : tree}
                  orientation="horizontal"
                  separation={{ siblings: 1, nonSiblings: 2 }}
                  renderCustomNodeElement={(rd3tProps) =>
                    renderForeignObjectNode({
                      ...rd3tProps,
                      foreignObjectProps,
                    })
                  }
                  pathFunc="step"
                  zoom={zoom}
                  depthFactor={300}
                  translate={{ x: width / 10, y: height / 2 }}
                />
                <div className="absolute bottom-0 right-0 mb-4 mx-8 flex justify-between w-32">
                  <ZoomIn
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer"
                    color="blank"
                    onClick={() => setZoom((prevState) => prevState + 0.1)}
                  />
                  <ZoomOut
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer"
                    color="blank"
                    onClick={() => setZoom((prevState) => prevState - 0.1)}
                  />
                  <Expand
                    className="stroke-current opacity-25 hover:opacity-100 cursor-pointer"
                    color="blank"
                    onClick={() => setExpandTree((prevState) => !prevState)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <LoadingSpinner label="Generating tree..." />
          </div>
        )}
      </div>
      <hr className="m-8 shadow" />
      <div className="h-50" ref={cardsRef}>
        {taxa && taxa.length > 0 ? (
          <div className="animate-grow-y rounded-lg grid gap-8 grid-cols-1 lg:grid-cols-3 mt-8">
            {taxa.map((assembly) => {
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
            })}
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
