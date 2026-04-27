import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store.js";
import App from "./App.js";
import { PersistGate } from "redux-persist/integration/react";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/*PersiteGate block web until redux-persist load data from localstorage and prop to redux */}
      <PersistGate loading={null} persistor={persistor}/> 
      <App />
    </Provider>
  </React.StrictMode>,
);
