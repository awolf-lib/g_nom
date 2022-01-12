import { createContext, useReducer } from "react";
import { useContext } from "react";
import "../../App.css";

import { v4 } from "uuid";

import Notification from "../Notification";

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
      <div className="fixed top-16 right-0 z-50">
        {state.map((notification) => (
          <div key={notification.id} className="flex justify-end">
            <Notification dispatch={dispatch} {...notification} />
          </div>
        ))}
      </div>
      {props.children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
