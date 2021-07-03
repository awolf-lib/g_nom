import React, { useState } from "react";
import "../../../../App.css";
import classNames from "classnames";
import PropTypes from "prop-types";

import {
  Alert,
  CircleInformation,
  StatusCritical,
  Validate,
  FormClose,
} from "grommet-icons";
import Expire from "../Expire";

function Popup({ label, message, type }) {
  const [viewDetails, setViewDetails] = useState();
  const [visible, setVisible] = useState(true);

  const containerClass = (type) =>
    classNames(
      "flex lg:w-96 bg-indigo-50 p-4 rounded-l-lg shadow-lg border-l-2 overflow-hidden mt-6",
      {
        "border-red-600": type === "error",
        "border-yellow-600": type === "warning",
        "border-green-600": type === "success",
        "border-blue-600": type === "info",
      },
      { "w-40": !viewDetails, "w-96": viewDetails }
    );

  const svgClass = (type) =>
    classNames("stroke-current animate-bounce", {
      "text-red-600": type === "error",
      "text-yellow-600": type === "warning",
      "text-green-600": type === "success",
      "text-blue-600": type === "info",
    });

  const messageClass = classNames("px-4 hover:flex lg:block text-sm", {
    /* prettier-ignore */
    "hidden": !viewDetails,
  });

  const getTypeClass = (type) => {
    switch (type) {
      case "error":
        return <StatusCritical color="blank" className={svgClass(type)} />;
      case "warning":
        return <Alert color="blank" className={svgClass(type)} />;
      case "success":
        return <Validate color="blank" className={svgClass(type)} />;
      case "info":
        return <CircleInformation color="blank" className={svgClass(type)} />;

      default:
        return null;
    }
  };

  if (visible) {
    return (
      <Expire>
        <div
          className={containerClass(type)}
          onMouseEnter={() => setViewDetails(true)}
          onMouseLeave={() => setViewDetails(null)}
        >
          <div className="w-full flex justify-around items-center">
            <div className="">{getTypeClass(type)}</div>
            <div className="flex lg:block w-full items-center">
              <div className="px-4 font-semibold text-sm">{label}</div>
              <div className={messageClass}>{message}</div>
            </div>
            <FormClose
              onClick={() => setVisible(false)}
              className="cursor-pointer"
            />
          </div>
        </div>
      </Expire>
    );
  } else {
    return <div />;
  }
}

Popup.defaultProps = {
  label: "",
  message: "",
  type: "info",
};

Popup.propTypes = {
  label: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.string.isRequired,
};

export default Popup;
