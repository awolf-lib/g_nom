import React, { MouseEventHandler, useState } from "react";
import classNames from "classnames";
import "../../App.css";
import PropTypes, { InferProps } from "prop-types";

export function Button(props: IButtonProps){
  const [showChildren, setShowChildren] = useState(false);

  const buttonContainerClass = classNames(
    "py-2 h-full rounded-lg active:cursor-pointer focus:outline-none disabled:bg-gray-500 disabled:opacity-50 active:ring-2 w-full transition duration-500",
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
      "text-sm transform scale-75 md:scale-100": props.size === "sm",
      "text-base": props.size === "md" || !props.size,
      "text-lg": props.size === "lg",
      "text-xl": props.size === "xl",
    }
  );

  const getContent = () => {
    if (props.label && props.children) {
      return showChildren ? (
        <div className="animate-grow-y">{props.children}</div>
      ) : (
        <div>{props.label}</div>
      );
    }
    if (!props.children && props.label) {
      return props.label;
    }
    if (!props.label && props.children) {
      return props.children;
    }
  };

  return (
    <button
      className={buttonContainerClass}
      onMouseEnter={() => setShowChildren(true)}
      onMouseLeave={() => setShowChildren(false)}
      {...props}
    >
      {getContent()}
    </button>
  );
};

Button.defaultProps = {
  color: "primary",
  size: "md",
  disabled: false,
};

interface IButtonProps{
  label?: string;
  children?: React.ReactNode;
  primary?: string;
  secondary?: string;
  color: 'primary'|'secondary'|'confirm'|'cancel'|'nav'|'link';
  size: 'sm'|'md'|'lg'|'xl';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default Button;
