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
import FeaturesList from "./components/FeaturesList";

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
    <div className="animate-fade-in">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/g-nom/dashboard" />} />
          <Route path="/g-nom" element={<Navigate to="/g-nom/dashboard" />} />
          <Route
            path="/g-nom/dashboard"
            element={<AssembliesList initialView="grid" bookmarks={1} title="Dashboard" />}
          />
          <Route path="/g-nom/assemblies" element={<Navigate to="/g-nom/assemblies/list" />} />
          <Route path="/g-nom/assemblies/list" element={<AssembliesList />} />
          <Route path="/g-nom/assemblies/data" element={<DataAssistant />} />
          <Route path="/g-nom/assemblies/assembly" element={<AssemblyInformation />} />
          <Route path="/g-nom/features" element={<FeaturesList />} />
          <Route path="/g-nom/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout setToken={setToken} />} />
          <Route
            path="*"
            element={<div className="flex justify-center py-6 px-8 text-2xl">Page not found!</div>}
          />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default MainRouter;
