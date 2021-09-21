import "../../App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import useToken from "./components/useToken";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Download from "./components/Download";
import AssembliesTable from "../../components/AssembliesTable";
import DataAssistant from "./components/DataAssistant";
import AssemblyInformation from "./components/AssemblyInformation";

const MainRouter = () => {
  const { token, setToken, setUserID, setUserName, setUserRole } = useToken();

  return !token ? (
    <Login
      setToken={setToken}
      setUserID={setUserID}
      setUserName={setUserName}
      setUserRole={setUserRole}
    />
  ) : (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/">
          <Redirect to="/g-nom/dashboard" />
        </Route>
        <Route exact path="/g-nom">
          <Redirect to="/g-nom/dashboard" />
        </Route>
        <Route exact path="/g-nom/dashboard">
          <Dashboard />
        </Route>
        <Route exact path="/g-nom/assemblies">
          <Redirect to="/g-nom/assemblies/list" />
        </Route>
        <Route exact path={"/g-nom/assemblies/list"}>
          <AssembliesTable />
        </Route>
        <Route exact path={"/g-nom/assemblies/manage"}>
          <DataAssistant />
        </Route>
        <Route exact path={"/g-nom/assemblies/assembly:id"}>
          <AssemblyInformation />
        </Route>
        <Route exact path="/g-nom/tools">
          <div className="p-4">Tools</div>
        </Route>
        <Route exact path="/g-nom/download">
          <Download />
        </Route>
        <Route exact path="/g-nom/imprint">
          <div className="p-4">Imprint</div>
        </Route>
        <Route exact path="/g-nom/help">
          <div className="p-4">Help</div>
        </Route>
        <Route exact path="/g-nom/contact">
          <div className="p-4">Contact</div>
        </Route>
        <Route exact path="/g-nom/profile">
          <Profile />
        </Route>
        <Route exact path="/g-nom/settings">
          <Settings />
        </Route>
        <Route path="/logout">
          <Logout setToken={setToken} />
        </Route>
      </Switch>
      <Footer />
    </Router>
  );
};

export default MainRouter;
