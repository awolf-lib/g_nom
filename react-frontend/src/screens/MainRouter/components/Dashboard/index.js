import { useEffect, useState } from "react";
import { scanFiles } from "../../../../api";
import "../../../../App.css";

import AssembliesTable from "../../../../components/AssembliesTable";

const Dashboard = () => {
  const [userID, setUserID] = useState(undefined);

  useEffect(() => {
    setUserID(parseInt(sessionStorage.getItem("userID")));
  }, []);

  return userID ? <AssembliesTable label="Dashboard" bookmarksUserID={userID} /> : <div />;
};

export default Dashboard;
