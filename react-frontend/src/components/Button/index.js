import classNames from "classnames";
import "../../App.css";
import PropTypes from "prop-types";

function Button(props) {
  let classnames = classNames(
    "py-2 rounded-lg cursor-pointer focus:outline-none active:ring-2 w-full",
    {
      "px-3 bg-blue-500 hover:bg-blue-400 text-white active:ring-blue-600":
        props.color === "primary",
      "px-3 bg-gray-500 hover:bg-gray-400 text-white active:ring-gray-600":
        props.color === "secondary",
      "px-3 bg-green-500 hover:bg-green-400 text-white active:ring-green-600":
        props.color === "confirm",
      "px-3 bg-red-500 hover:bg-red-400 text-white active:ring-red-600":
        props.color === "cancel",
      "px-3 hover:bg-gray-600 text-gray-700 hover:text-white font-semibold active:ring-gray-700":
        props.color === "nav",
      "text-gray-900 hover:text-blue-700 cursor-pointer":
        props.color === "link",
    },
    {
      "text-sm": props.size === "sm",
      "text-base": props.size === "md" || !props.size,
      "text-lg": props.size === "lg",
      "text-xl": props.size === "xl",
    }
  );
  return (
    <button className={classnames} {...props}>
      {props.label}
    </button>
  );
}

Button.defaultProps = {
  label: "Button",
  color: "primary",
  size: "md",
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  primary: PropTypes.string,
  secondary: PropTypes.bool,
  size: PropTypes.string.isRequired,
};

export default Button;
