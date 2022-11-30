import React from "react";
import ReactDOM from "react-dom";
import Dialog from "./components/Dialog";

import "./index.scss";

const App = () => (
  <div>
    <Dialog />
  </div>
);
ReactDOM.render(<App />, document.getElementById("app"));
