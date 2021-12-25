import { Component } from "react";
import "../../../../App.css";

export default class Footer extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className="flex fixed z-50 bottom-0 w-full bg-indigo-200 h-4 border-t-2 border-inset border-gray-300 items-center justify-center"></div>
    );
  }
}
