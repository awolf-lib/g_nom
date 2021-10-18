const Download = () => {
  return (
    <div className="animate-grow-y mb-16">
      <iframe
        title="download"
        className="w-full h-75"
        src={process.env.REACT_APP_FTP_ADRESS + "/g-nom/portal/"}
      />
    </div>
  );
};

export default Download;
