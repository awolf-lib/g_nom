import React, { MouseEventHandler, useState } from "react";
import classNames from "classnames";
import "../../App.css";

interface IButtonProps {
  label?: string;
  children?: React.ReactNode;
  color?: "primary" | "secondary" | "confirm" | "cancel" | "nav" | "link" | "submit";
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function Button({
  label,
  color = "primary",
  size = "md",
  disabled = false,
  children,
  onClick,
}: IButtonProps): JSX.Element {
  const [showChildren, setShowChildren] = useState(false);

  const buttonContainerClass = classNames(
    "py-2 h-full rounded-lg active:cursor-pointer focus:outline-none disabled:bg-gray-500 disabled:opacity-50 active:ring-2 w-full transition duration-500",
    {
      "px-3 bg-blue-500 hover:bg-blue-400 text-white active:ring-blue-600 shadow border border-blue-500 border-outset":
        color === "primary",
      "px-3 bg-gray-600 hover:bg-gray-400 text-white active:ring-gray-600 shadow border border-gray-400 border-outset":
        color === "secondary",
      "px-3 bg-green-500 hover:bg-green-400 text-white active:ring-green-600 shadow border border-green-500 border-outset":
        color === "confirm",
      "px-3 bg-red-500 hover:bg-red-400 text-white active:ring-red-600 shadow border border-red-500 border-outset":
        color === "cancel",
      "px-3 hover:bg-gray-600 text-gray-800 hover:text-white font-semibold active:ring-gray-700":
        color === "nav",
      "text-gray-800 hover:text-blue-700 cursor-pointer": color === "link",
    },
    {
      "text-sm transform scale-100": size === "sm",
      "text-base": size === "md" || !size,
      "text-lg": size === "lg",
      "text-xl": size === "xl",
    }
  );

  const getContent = () => {
    if (label && children) {
      return showChildren ? (
        <div className="flex items-center justify-center">{children}</div>
      ) : (
        <div>{label}</div>
      );
    }
    if (!children && label) {
      return label;
    }
    if (!label && children) {
      return children;
    }
  };

  return (
    <button
      className={buttonContainerClass}
      onMouseEnter={() => setShowChildren(true)}
      onMouseLeave={() => setShowChildren(false)}
      onClick={onClick}
      disabled={disabled}
    >
      {getContent()}
    </button>
  );
}

export default Button;
