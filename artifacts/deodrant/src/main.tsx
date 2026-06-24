import { createRoot } from "react-dom/client";
import { Router, Route, Switch } from "wouter";
import App from "./App";
import CallCentre from "./pages/CallCentre";
import GetLeadsSaar from "./pages/GetLeadsSaar";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Router>
    <Switch>
      <Route path="/call-centre" component={CallCentre} />
      <Route path="/Get-Leads-Saar" component={GetLeadsSaar} />
      <Route component={App} />
    </Switch>
  </Router>
);
