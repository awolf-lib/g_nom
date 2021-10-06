import classNames from "classnames";
import React from "react";
import PropTypes from "prop-types";

const Input = (props) => {
  const inputClass = classNames(
    "px-2 py-1 border border-gray-300 bg-white text-black rounded-lg focus:outline-none transition duration-300",
    {
      "max-w-min text-xs h-5": props.size === "sm",
      "w-full text-base h-10": props.size === "md",
      "w-full text-lg h-12": props.size === "lg",
      "w-full text-xl h-14": props.size === "xl",
    },
    {
      "pl-6": props.type === "number",
      "focus:ring-2 hover:ring-2 ring-offset-1": props.type !== "radio",
      "text-center": props.type !== "textarea",
      "h-32 text-justify": props.type === "textarea",
    }
  );
  if (props.type !== "textarea") {
    return <input {...props} className={inputClass} />;
  } else {
    return <textarea {...props} className={inputClass} />;
  }
};

Input.defaultProps = {
  type: "text",
  placeholder: "Input...",
  size: "md",
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  checked: PropTypes.bool
};

export default Input;
