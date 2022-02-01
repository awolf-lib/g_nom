import classNames from "classnames";
import PropTypes from "prop-types";

const Input = (props) => {
  const inputClass = classNames(
    "px-2 py-1 bg-white text-black focus:outline-none transition duration-300",
    {
      "w-full text-xs h-6": props.size === "sm",
      "w-full text-base h-10": props.size === "md",
      "w-full text-lg h-12": props.size === "lg",
      "w-full text-xl h-14": props.size === "xl",
    },
    {
      "pl-6": props.type === "number",
      "focus:ring-2 hover:ring-2 ring-offset-1 shadow": props.type !== "radio",
      "text-center": props.type !== "textarea",
      "h-32 text-justify": props.type === "textarea",
    },
    {
      "border border-gray-300 rounded-lg shadow": !props.withoutborder,
    }
  );
  if (props.type !== "textarea") {
    return <input {...props} className={inputClass} autoFocus />;
  } else {
    return <textarea {...props} className={inputClass} autoFocus />;
  }
};

Input.defaultProps = {
  type: "text",
  placeholder: "Input...",
  size: "md",
  withoutborder: false,
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
    PropTypes.number,
  ]),
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  withoutborder: PropTypes.bool,
};

export default Input;
