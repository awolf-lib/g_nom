import React, { Component } from "react";
import "../../App.css";
import { Switch, Route, Redirect } from "react-router-dom";

import AllAssembliesList from "./components/AllAssembliesList";

export default class AssemblyRouter extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/g-nom/assemblies">
            <Redirect to="/g-nom/assemblies/all/" />
          </Route>
          <Route exact path="/g-nom/assemblies/all/">
            <AllAssembliesList />
          </Route>
          <Route path="/g-nom/assemblies/assembly:id">
            <div></div>
          </Route>
          <Route exact path="/g-nom/assemblies/manageAssemblies">
            <div></div>
          </Route>
        </Switch>
      </div>
    );
  }
}
