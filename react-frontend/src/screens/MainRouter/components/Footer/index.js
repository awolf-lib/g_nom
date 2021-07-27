import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../../../App.css";
import Button from "../../../../components/Button";

export default class Footer extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className="flex fixed z-50 bottom-0 w-full bg-indigo-200 h-8 border-t-2 border-inset border-gray-300 items-center justify-center">
        <div className="mx-8 md:mx-16">
          <Link to="/g-nom/contact">
            <Button label="Contact" color="link" />
          </Link>
        </div>
        <div className="mx-8 md:mx-16">
          <Link to="/g-nom/imprint">
            <Button label="Imprint" color="link" />
          </Link>
        </div>
        <div className="mx-8 md:mx-16">
          <Link to="/g-nom/help">
            <Button label="Help" color="link" />
          </Link>
        </div>
      </div>
    );
  }
}
