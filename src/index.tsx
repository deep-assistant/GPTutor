import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import { AdaptivityProvider, AppRoot, ConfigProvider } from "@vkontakte/vkui";
import "dignals-react/build/jsxPatch";

import App from "./App";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import Bugsnag from "@bugsnag/js";
import ErrorBoundaryApp from "./ErrorBoundaryApp";
import { Panels, RoutingPages, Views } from "./entity/routing";
import { Page, Router, RouterContext } from "@happysanta/router";

bridge.send("VKWebAppInit");

const routes = {
  [RoutingPages.home]: new Page(Panels.home, Views.viewMain),
  [RoutingPages.chapters]: new Page(Panels.chapters, Views.viewMain),
  [RoutingPages.chat]: new Page(Panels.chat, Views.viewMain),
  [RoutingPages.openSource]: new Page(Panels.openSource, Views.viewMain),
  [RoutingPages.chatSettings]: new Page(Panels.chatSettings, Views.viewMain),
  [RoutingPages.history]: new Page(Panels.history, Views.viewMain),
  [RoutingPages.modes]: new Page(Panels.modes, Views.viewMain),
};

if (process.env.NODE_ENV === "production") {
  Bugsnag.start({
    apiKey: String(process.env.REACT_APP_BUGSNAG_API_KEY),
    plugins: [new BugsnagPluginReact()],
  });
}

const router = new Router(routes);

router.start();

ReactDOM.render(
  <ErrorBoundaryApp>
    <RouterContext.Provider value={router}>
      <ConfigProvider>
        <AdaptivityProvider>
          <AppRoot>
            <App />
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    </RouterContext.Provider>
  </ErrorBoundaryApp>,
  document.getElementById("root")
);

if (process.env.NODE_ENV === "development") {
  import("./eruda"); //runtime download
}
