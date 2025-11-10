import { useEffect } from "react";
import {
  Epic,
  ModalRoot,
  SplitCol,
  SplitLayout,
  Tabbar,
  TabbarItem,
  View,
} from "@vkontakte/vkui";
import {
  useActiveVkuiLocation,
  useRouteNavigator,
} from "@vkontakte/vk-mini-apps-router";
import { useAppearance } from "@vkontakte/vk-bridge-react";
import { OneDark } from "./themes/OneDark";
import { OneLight } from "./themes/OneLight";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SnackbarProvider } from "./hooks/useSnackbar";

import { Chat, Home, Models, Persik, Profile } from "./panels";
import { DEFAULT_VIEW_PANELS, MODALS } from "./routes.ts";
import {
  Icon28HomeOutline,
  Icon28MessageOutline,
  Icon28UserCircleOutline,
} from "@vkontakte/icons";

import "./App.css";
import { userViewModel } from "./viewModels/UserViewModel.ts";
import { TopUpBalanceModal } from "./modals";

export const App = () => {
  const { view: activeView, panel: activePanel = DEFAULT_VIEW_PANELS.HOME, modal: activeModal } =
    useActiveVkuiLocation();
  const routeNavigator = useRouteNavigator();

  const vkAppearance = useAppearance();
  const isDarkTheme = vkAppearance === "dark";

  useEffect(() => {
    userViewModel.getUser();
  }, []);

  const modal = (
    <ModalRoot activeModal={activeModal}>
      <TopUpBalanceModal id={MODALS.TOP_UP_BALANCE} />
    </ModalRoot>
  );

  return (
    <ThemeProvider isDarkTheme={isDarkTheme}>
      <SnackbarProvider>
        <SplitLayout>
          <SplitCol>
            <Epic
              activeStory={activeView || "home"}
              tabbar={
                activeView !== "chat" ? (
                  <Tabbar>
                    <TabbarItem
                      selected={activeView === "home" || !activeView}
                      onClick={() => routeNavigator.push("/")}
                      label="Главная"
                    >
                      <Icon28HomeOutline />
                    </TabbarItem>
                    <TabbarItem
                      selected={activeView === "profile"}
                      onClick={() =>
                        routeNavigator.push(`/${DEFAULT_VIEW_PANELS.PROFILE}`)
                      }
                      label="Профиль"
                    >
                      <Icon28UserCircleOutline />
                    </TabbarItem>
                    <TabbarItem
                      selected={activeView === "chat"}
                      onClick={() =>
                        routeNavigator.push(`/${DEFAULT_VIEW_PANELS.CHAT}`)
                      }
                      label="Чат"
                    >
                      <Icon28MessageOutline />
                    </TabbarItem>
                  </Tabbar>
                ) : null
              }
            >
              <View id="home" activePanel={activePanel}>
                <Home id="home" />
                <Persik id="persik" />
                <Models id="models" />
              </View>
              <View id="profile" activePanel={activePanel}>
                <Profile id="profile" />
              </View>
              <View id="chat" activePanel={activePanel}>
                <Chat id="chat" />
              </View>
            </Epic>
            {modal}
          </SplitCol>
          {/*{userViewModel.loading ? <ScreenSpinner /> : null}*/}

          {/* Code Themes */}
          {isDarkTheme ? <OneDark /> : <OneLight />}
        </SplitLayout>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
