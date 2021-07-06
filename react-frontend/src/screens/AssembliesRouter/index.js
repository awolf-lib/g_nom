import "../../App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import AllAssembliesTable from "./components/AllAssembliesTable";
import ImportManager from "./components/ImportManager";

const AssembliesRouter = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/g-nom/assemblies">
          <Redirect to="/g-nom/assemblies/list" />
        </Route>
        <Route exact path={"/g-nom/assemblies/list"}>
          <AllAssembliesTable />
        </Route>
        <Route exact path={"/g-nom/assemblies/import"}>
          <ImportManager />
        </Route>
        <Route exact path={"/g-nom/assemblies/manageAssemblies"}></Route>
      </Switch>
    </Router>
  );
};

export default AssembliesRouter;
