import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import { StateProvider } from "./contexts/StateProvider";
// import reducer, { initalState } from "./contexts/reducer";

import { Provider } from "react-redux";
import store from "./redux/store";

ReactDOM.render(
  // <React.StrictMode>
  //   <Provider store={store}>
  //     <App />
  //   </Provider>
  // </React.StrictMode>,
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>,
  document.getElementById("root")
);
