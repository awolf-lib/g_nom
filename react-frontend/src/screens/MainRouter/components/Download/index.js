const Download = () => {
  return (
    <div className="animate-grow-y mb-16">
      <iframe
        id="downloads"
        title="download"
        className="w-full h-75"
        src={process.env.REACT_APP_JBROWSE_ADRESS + "/assemblies/"}
      />
    </div>
  );
};

export default Download;
