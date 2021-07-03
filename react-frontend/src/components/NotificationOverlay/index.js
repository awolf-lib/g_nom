import React from "react";
import "../../App.css";
import PropTypes from "prop-types";

import Popup from "./components/Popup";
import ContextProvider from "../ContextProvider";

function PopupList() {
  return (
    <ContextProvider.Consumer>
      {(props) => {
        return (
          <div className="fixed right-0 bottom-0 mt-8 mb-16 z-50 grid justify-items-end">
            {props.notifications && props.notifications.length ? (
              props.notifications.map((notification, index) => (
                <Popup
                  label={notification?.label}
                  message={notification?.message}
                  type={notification?.type}
                  key={index}
                />
              ))
            ) : (
              <div className="hidden" />
            )}
          </div>
        );
      }}
    </ContextProvider.Consumer>
  );
}

PopupList.defaultProps = {
  notifications: [],
};

PopupList.propTypes = {
  notifications: PropTypes.array,
};

export default PopupList;
