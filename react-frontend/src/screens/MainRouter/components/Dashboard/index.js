import React, { useEffect, useState } from "react";
import "../../../../App.css";

import AssembliesTable from "../../../../components/AssembliesTable";

const Dashboard = () => {
  const [userID, setUserID] = useState(undefined);

  useEffect(() => {
    setUserID(parseInt(sessionStorage.getItem("userID")));
  }, []);

  return userID ? (
    <AssembliesTable label="Dashboard" userID={userID} />
  ) : (
    <div />
  );
};

export default Dashboard;
