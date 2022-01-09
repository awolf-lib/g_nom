import "../../App.css";

const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => {
  return (
    <div className="flex items-center rounded-full cursor-wait">
      <div className="animate-pulse font-bold">{label}</div>
    </div>
  );
};

export default LoadingSpinner;
