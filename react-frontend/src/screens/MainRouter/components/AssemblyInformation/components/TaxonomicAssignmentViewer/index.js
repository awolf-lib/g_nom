import React from "react";

const TaxonomicAssignmentViewer = ({
  assemblyInformation,
  setTaxonomicAssignmentLoading,
}) => {
  return (
    <div className="mx-8 animate-grow-y shadow-lg rounded-lg overflow-hidden border bg-white">
      <div className="animate-fade-in">
        <iframe
          onLoad={() => setTaxonomicAssignmentLoading(false)}
          title="MiltsPlot"
          className="w-full h-screen"
          src={
            "http://localhost:5003/g-nom/portal/fs/download/assemblies/" +
            assemblyInformation.name +
            "/milts/" +
            assemblyInformation.analyses.milts[0].name +
            "/" +
            assemblyInformation.analyses.milts[0].name +
            "_milts_taxonomic_assignment_plot.html"
          }
        />
      </div>
    </div>
  );
};

export default TaxonomicAssignmentViewer;

TaxonomicAssignmentViewer.defaultProps = {};

TaxonomicAssignmentViewer.propTypes = {};
