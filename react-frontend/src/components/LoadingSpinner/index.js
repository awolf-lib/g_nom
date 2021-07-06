import "../../App.css";
import propTypes from "prop-types";

const LoadingSpinner = ({ label }) => {
  return (
    <div className="flex items-center rounded-full cursor-wait">
      <div className="animate-pulse font-bold">{label}</div>
    </div>
  );
};

LoadingSpinner.defaultProps = { label: "Loading..." };

LoadingSpinner.propTypes = { label: propTypes.string };

export default LoadingSpinner;
