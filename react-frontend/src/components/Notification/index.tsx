import { useState, useEffect } from "react";
import "../../App.css";
import classNames from "classnames";

import { Alert, CircleInformation, StatusCritical, Validate, FormClose } from "grommet-icons";

export type NotificationType = "info" | "error" | "warning" | "success";

const Notification = ({
  id,
  label,
  message,
  type,
  dispatch,
}: {
  id: number;
  label: string;
  message: string;
  type: NotificationType;
  dispatch: any;
}) => {
  const [width, setWidth] = useState<number>(0);
  const [intervalID, setIntervalID] = useState<any>(null);
  const [exit, setExit] = useState<boolean>(false);

  useEffect(() => {
    handleStartTimer();
  }, []);

  useEffect(() => {
    if (width === 100) {
      handleCloseNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const handleStartTimer = () => {
    const id = setInterval(() => {
      setWidth((prevWidth) => {
        if (prevWidth < 100) {
          return prevWidth + 0.5;
        }
        clearInterval(id);
        return prevWidth;
      });
    }, 25);
    setIntervalID(id);
  };

  const handlePauseTimer = () => {
    clearInterval(intervalID);
  };

  const handleCloseNotification = () => {
    handlePauseTimer();
    setExit(true);
    setTimeout(() => {
      dispatch({
        type: "REMOVE_NOTIFICATION",
        id: id,
      });
    }, 400);
  };

  const containerClass = (type: NotificationType, exit: boolean) =>
    classNames(
      "w-96 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 px-6 rounded-l-lg shadow-lg border-l-2 overflow-hidden mt-6 animate-slide-left animate-fade-in",
      {
        "border-red-700": type === "error",
        "border-yellow-700": type === "warning",
        "border-green-700": type === "success",
        "border-blue-7s00": type === "info",
      },
      {
        "opacity-0 transition duration-700": exit,
      }
    );

  const svgClass = (type: NotificationType) =>
    classNames("stroke-current", {
      "text-red-700": type === "error",
      "text-yellow-700": type === "warning",
      "text-green-700": type === "success",
      "text-blue-700": type === "info",
    });

  const timeBarClass = (type: NotificationType) =>
    classNames("h-1 bg-red-700 mt-4 mb-4 rounded-full animate-pulse shadow", {
      "bg-red-700": type === "error",
      "bg-yellow-700": type === "warning",
      "bg-green-700": type === "success",
      "bg-blue-700": type === "info",
    });

  const getTypeClass = (type: NotificationType) => {
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

  return (
    <div className="overflow-hidden">
      <div
        className={containerClass(type, exit)}
        onMouseEnter={() => {
          handlePauseTimer();
        }}
        onMouseLeave={() => {
          handleStartTimer();
        }}
      >
        <div className="flex items-center">
          <div className="w-full h-full pt-4">
            <div className="w-full flex justify-around items-center">
              <div className="">{getTypeClass(type)}</div>
              <div className="block w-full items-center text-base">
                <div className="px-4 font-semibold">{label}</div>
                <div className="mt-1 px-4 hover:flex block text-xs">{message}</div>
              </div>
            </div>
            <div className="w-full shadow bg-gray-50">
              <div className={timeBarClass(type)} style={{ width: `${width}%` }}></div>
            </div>
          </div>
          <FormClose className="cursor-pointer" onClick={() => handleCloseNotification()} />
        </div>
      </div>
    </div>
  );
};

export default Notification;
