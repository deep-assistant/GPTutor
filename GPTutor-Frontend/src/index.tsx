import "dignals-react/jsxPatch18";
import "./env.js";

import React from "react";
import ReactDOM from "react-dom/client";
import { Page, Router, RouterContext } from "@happysanta/router";
import "react-virtualized/styles.css";

import App from "./App";
import { Panels, RoutingPages, Views } from "./entity/routing";
import { OnboardingService } from "./services/OnboardingService";
import { NavigationContextProvider } from "$/NavigationContext";
import { adService } from "$/services/AdService";
import { appService } from "$/services/AppService";
import { VkStorageService } from "$/services/VkStorageService";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import { userInfo } from "$/entity/user/UserInfo";
import { listenResize } from "./resizeWindow";
import { platformAdapter } from "$/services/PlatformAdapterService";

const isFirstVisitFlagName = "isFirstVisit";

const storageService = new VkStorageService();

listenResize(800, 900);

async function VKInit() {
  if (process.env.NODE_ENV === "development") {
    import("./eruda");
  }

  storageService.get(isFirstVisitFlagName).then((value) => {
    if (value) return;

    const onboardingService = new OnboardingService();
    onboardingService.runOnBoarding();
    storageService.set(isFirstVisitFlagName, String(true));
  });

  // if (appService.isStableArt()) {
  //   await userInfo.getUserImageAgreement();
  // }
  await adService.showBannerAd();
  // if (appService.isGPTutor()) {
  //   await subscriptionsController.getSubscription("subscription_2");
  // }
  // await additionalRequests.init();
}

platformAdapter
  .webAppInit()
  .then(async () => {
    // await userInfo.getUserBalance();

    if (appService.isVK()) {
      await VKInit();
    }
  })
  .catch(console.log)
  .finally(() => {
    appService.toggleLoading();
  });

const routes = {
  [RoutingPages.home]: new Page(Panels.home, Views.viewMain),
  [RoutingPages.chapters]: new Page(Panels.chapters, Views.viewMain),
  [RoutingPages.chatFree]: new Page(Panels.chatFree, Views.viewMain),
  [RoutingPages.chatLesson]: new Page(Panels.chatLesson, Views.viewMain),
  [RoutingPages.chatInterview]: new Page(Panels.chatInterview, Views.viewMain),
  [RoutingPages.openSource]: new Page(Panels.openSource, Views.viewMain),
  [RoutingPages.history]: new Page(Panels.history, Views.viewMain),
  [RoutingPages.modes]: new Page(Panels.modes, Views.viewMain),
  [RoutingPages.forbidden]: new Page(Panels.forbidden, Views.viewMain),
  [RoutingPages.chatLeetCode]: new Page(Panels.chatLeetCode, Views.viewMain),
  [RoutingPages.problemDetail]: new Page(Panels.problemDetail, Views.viewMain),
  [RoutingPages.editor]: new Page(Panels.editor, Views.viewMain),
  [RoutingPages.chatTrainer]: new Page(Panels.chatTrainer, Views.viewMain),
  [RoutingPages.chatSettings]: new Page(Panels.chatSettings, Views.viewMain),
  [RoutingPages.generationImages]: new Page(
    Panels.generationImages,
    Views.viewMain
  ),
  [RoutingPages.generationImagesResult]: new Page(
    Panels.generationImagesResult,
    Views.viewMain
  ),
  [RoutingPages.leetcodeProblems]: new Page(
    Panels.leetcodeProblems,
    Views.viewMain
  ),
  [RoutingPages.generationImagesExamples]: new Page(
    Panels.generationImagesExamples,
    Views.viewMain
  ),
  [RoutingPages.generationImagesPrompts]: new Page(
    Panels.generationImagesPrompts,
    Views.viewMain
  ),
  [RoutingPages.gallery]: new Page(Panels.gallery, Views.viewMain),
  [RoutingPages.publishingImages]: new Page(
    Panels.publishingImages,
    Views.viewMain
  ),
  [RoutingPages.profile]: new Page(Panels.profile, Views.viewMain),
  [RoutingPages.gptutorProfile]: new Page(
    Panels.gptutorProfile,
    Views.viewMain
  ),
  [RoutingPages.mermaidPage]: new Page(Panels.mermaidPage, Views.viewMain),
  [RoutingPages.additionalRequest]: new Page(
    Panels.additionalRequest,
    Views.viewMain
  ),
  [RoutingPages.mainAnecdote]: new Page(Panels.mainAnecdote, Views.viewMain),
  [RoutingPages.anecdoteGeneration]: new Page(
    Panels.anecdoteGeneration,
    Views.viewMain
  ),
  [RoutingPages.anecdoteNews]: new Page(Panels.anecdoteNews, Views.viewMain),
  [RoutingPages.bingPanel]: new Page(Panels.bingPanel, Views.viewMain),
  [RoutingPages.vkDocQuestionPanel]: new Page(
    Panels.vkDocQuestionPanel,
    Views.viewMain
  ),
  [RoutingPages.vkDocQuestionRequest]: new Page(
    Panels.vkDocQuestionRequest,
    Views.viewMain
  ),
  [RoutingPages.docQuestion]: new Page(Panels.docQuestion, Views.viewMain),
};

const router = new Router(routes);

router.start();

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <RouterContext.Provider value={router}>
    <NavigationContextProvider>
      <App />
    </NavigationContextProvider>
  </RouterContext.Provider>
);
