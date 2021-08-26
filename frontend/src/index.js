import "react-app-polyfill/ie11"; // For IE 11 support
import "react-app-polyfill/stable";
import "core-js";
import "./polyfill";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import configureStore from "../src/redux/store";
import { icons } from "./assets/icons";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import '../src/assets/css/custom.css';
// import { initializeFirebase } from './push-notification';
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";

// initializeFirebase();
React.icons = icons;

ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
