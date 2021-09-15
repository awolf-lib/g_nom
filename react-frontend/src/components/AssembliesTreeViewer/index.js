import React, { useEffect, useState } from "react";
import classNames from "classnames";
import "../../App.css";
import PropTypes from "prop-types";
import {fetchAssembliesByTaxonIDs, fetchTaxonTree} from "../../api";
import { useNotification } from "../../components/NotificationProvider";
import SpeciesProfilePictureViewer from "../../components/SpeciesProfilePictureViewer";

import Tree from "react-d3-tree";
import AssemblyInfoCard from "../AssemblyInfoCard";

const AssembliesTreeViewer = () => {
  const [tree, setTree] = useState({});
  const [taxa, setTaxa] = useState([]);

  useEffect(() => {
    loadTree();
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
    const response = await fetchTaxonTree();

    if (response && response.payload) {
      setTree(response.payload);
    }

    if (response && response.notification && response.notification.message) {
      handleNewNotification(response.notification);
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
            // toggleNode()
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
              // toggleNode()
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

  const nodeSize = { x: 200, y: 200 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };
  return (
    <div className="animate-grow-y mb-16 flex w-full justify-between h-75">
      <div className="h-75 border-4 border-dashed shadow-lg rounded-lg w-2/3">
        {tree && tree.id && (
          <Tree
            data={tree}
            orientation="horizontal"
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
            pathFunc="step"
          />
        )}
      </div>
      {taxa && taxa.length > 0 && (
        <div className="animate-grow-y m-4 rounded-lg border-4 p-8 border-dashed overflow-y-auto overflow-x-hidden w-1/3">
          {taxa.map((assembly) => {
            return (
              <div key={assembly.id} className="animate-fade-in my-8">
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
      )}
    </div>
  );
};

AssembliesTreeViewer.defaultProps = {};

AssembliesTreeViewer.propTypes = {};

export default AssembliesTreeViewer;
