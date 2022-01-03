import "../../App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import useToken from "./components/useToken";
import Logout from "./components/Logout";
import Settings from "./components/Settings";
import DataAssistant from "./components/DataAssistant/index";
import AssemblyInformation from "./components/AssemblyInformation";
import AssembliesList from "./components/AssembliesList";
import AssembliesTreeViewer from "./components/AssembliesTreeViewer";

const MainRouter = () => {
  const { token, userID, setToken, setUserID, setUserRole, setUserName } = useToken();

  return !token || !userID ? (
    <Login
      setToken={setToken}
      setUserID={setUserID}
      setUserRole={setUserRole}
      setUserName={setUserName}
    />
  ) : (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Navigate to="/g-nom/dashboard" />} />
        <Route exact path="/g-nom" element={<Navigate to="/g-nom/dashboard" />} />
        <Route
          exact
          path="/g-nom/dashboard"
          element={<AssembliesList initialView="grid" bookmarks={1} />}
        />
        <Route exact path="/g-nom/assemblies" element={<Navigate to="/g-nom/assemblies/list" />} />
        <Route exact path="/g-nom/assemblies/list" element={<AssembliesList />} />
        <Route exact path="/g-nom/assemblies/tree" element={<AssembliesTreeViewer />} />
        <Route exact path="/g-nom/assemblies/manage" element={<DataAssistant />} />
        <Route exact path="/g-nom/assemblies/assembly:id" element={<AssemblyInformation />} />
        <Route exact path="/g-nom/settings" element={<Settings />} />
        <Route path="/logout" element={<Logout setToken={setToken} />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default MainRouter;
