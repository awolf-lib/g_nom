import React from "react";
import "../../../../App.css";

import AssembliesTable from "../../../../components/AssembliesTable";

const Dashboard = () => {
  const userID = sessionStorage.getItem("userID");
  return <AssembliesTable label="Dashboard" userID={userID} />;
};

export default Dashboard;
