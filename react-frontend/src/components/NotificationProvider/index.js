import React, { createContext, useReducer } from "react";
import { useContext } from "react";
import "../../App.css";

import { v4 } from "uuid";

import Popup from "../Notification";

const NotificationContext = createContext();

export const useNotification = () => {
  const dispatch = useContext(NotificationContext);

  return (props) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: { id: v4(), ...props } });
  };
};

const NotificationProvider = (props) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "ADD_NOTIFICATION":
        return [...state, { ...action.payload }];
      case "REMOVE_NOTIFICATION":
        return state.filter((notification) => notification.id !== action.id);
      default:
        return state;
    }
  }, []);

  return (
    <NotificationContext.Provider value={dispatch}>
      <div className="fixed right-0 bottom-0 mt-8 mb-16 z-50">
        {state.map((notification) => (
          <div key={notification.id} className="flex justify-end">
            <Popup dispatch={dispatch} {...notification} />
          </div>
        ))}
      </div>
      {props.children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
