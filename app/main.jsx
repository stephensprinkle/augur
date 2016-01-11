// add jQuery to Browserify's global object so plugins attach correctly.
global.jQuery = require("jquery");
require("bootstrap");

var React = require("react");
var ReactDOM = require("react-dom");
var Fluxxor = require("fluxxor");

var Router = require("react-router");
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;
var Redirect = Router.Redirect;

var constants = require("./libs/constants");
var utilities = require("./libs/utilities");

var AssetActions = require("./actions/AssetActions");
var BranchActions = require("./actions/BranchActions");
var ConfigActions = require("./actions/ConfigActions");
var MarketActions = require("./actions/MarketActions");
var SearchActions = require("./actions/SearchActions");
var NetworkActions = require("./actions/NetworkActions");
var ReportActions = require("./actions/ReportActions");

var actions = {
  asset: AssetActions,
  branch: BranchActions,
  config: ConfigActions,
  market: MarketActions,
  search: SearchActions,
  network: NetworkActions,
  report: ReportActions
};

var AssetStore = require("./stores/AssetStore");
var BranchStore = require("./stores/BranchStore").default;
var ConfigStore = require("./stores/ConfigStore");
var MarketStore = require("./stores/MarketStore");
var SearchStore = require("./stores/SearchStore");
var NetworkStore = require("./stores/NetworkStore");
var ReportStore = require("./stores/ReportStore");

var stores = {
  asset: new AssetStore(),
  branch: new BranchStore(),
  config: new ConfigStore(),
  market: new MarketStore(),
  search: new SearchStore(),
  network: new NetworkStore(),
  report: new ReportStore()
};

var AugurApp = require("./components/AugurApp");
var Overview = require("./components/Overview");
var Branch = require("./components/Branch");
var Market = require("./components/Market");
var Ballots = require("./components/Ballots");
var Outcomes = require("./components/Outcomes");

window.flux = new Fluxxor.Flux(stores, actions);

flux.on("dispatch", function(type, payload) {
  var debug = flux.store("config").getState().debug;
  if (debug) console.log("Dispatched", type, payload);
});

var routes = (
  <Route name="app" handler={ AugurApp } flux={ flux }>
    <DefaultRoute handler={ Overview } flux={ flux } />
    <Route name="overview" path="/" handler={ Overview } flux={ flux } title="Overview" />
    <Route name="markets" path="/markets" handler={ Branch } flux={ flux } title="Markets" />
    <Route name="marketsPage" path="/markets/:page" handler={ Branch } flux={ flux } title="Markets" />
    <Route name="market" path="/market/:marketId" handler={ Market } flux={ flux } />
    <Route name="ballots" path="/ballots" handler={ Ballots } flux={ flux } title="Ballots" />
  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler, state) {
  ReactDOM.render(<Handler flux={ flux } params={ state.params } />, document.getElementById("render-target"));
});
