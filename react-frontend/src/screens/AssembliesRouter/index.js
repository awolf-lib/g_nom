import "../../App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import AssembliesTable from "../../components/AssembliesTable";
import DataAssistant from "./components/DataAssistant";
import AssemblyInformation from "./components/AssemblyInformation";

const AssembliesRouter = () => {
  return (
    <Router>
      <Switch>
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
        <Route exact path={"/g-nom/assemblies/manageAssemblies"}></Route>
      </Switch>
    </Router>
  );
};

export default AssembliesRouter;
