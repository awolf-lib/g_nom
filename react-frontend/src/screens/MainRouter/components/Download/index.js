const Download = () => {
  return (
    <div className="animate-grow-y mb-16">
      <iframe
        title="download"
        className="w-full h-75"
        src={process.env.REACT_APP_NEXTCLOUD_DOWNLOAD_ADRESS}
      />
    </div>
  );
};

export default Download;
