import React, { useEffect } from "react";
import {
  AdaptivityProvider,
  AppRoot,
  ConfigProvider,
  ModalRoot,
  SplitLayout,
  View,
} from "@vkontakte/vkui";
import bridge, {
  AppearanceType,
  parseURLSearchParamsForGetLaunchParams,
} from "@vkontakte/vk-bridge";
import { useLocation } from "@happysanta/router";
import {
  useAdaptivity,
  useAppearance,
  useInsets,
} from "@vkontakte/vk-bridge-react";
import "markdown-it-latex/dist/index.css";

import "@vkontakte/vkui/dist/vkui.css";
import "./index.css";

import { vkUserModel } from "./entity/user";
import { online } from "./api/online";

import { OneDark } from "./OneDark";
import { OneLight } from "./OneLight";
import { Modals, Panels, Views } from "./entity/routing";

import { Home } from "./panels/Home";
import { Chapters } from "./panels/Chapters";
import { History } from "./panels/History";
import { Modes } from "./panels/Modes";

import { useNavigationContext } from "./NavigationContext";
import { SnackbarNotifier } from "./components/SnackbarNotifier";
import { ChatSettings } from "./panels/ChatSettings";
import { ApplicationInfo } from "./modals/ApplicationInfo";
import { ChatFree } from "./panels/ChatFree";
import { ChatLesson } from "./panels/ChatLesson";
import { ChatInterview } from "./panels/ChatInterview";
import { InterviewQuestions } from "./modals/InterviewQuestions";
import { LeetcodeProblems } from "./panels/LeetCodeProblems";
import { ChatLeetCode } from "./panels/ChatLeetCode";
import { ProblemDetail } from "./panels/ProblemDetail";
import { AppAlert } from "./modals/AppAlert";
import { CodeEditor } from "./panels/CodeEditor";
import { ChatTrainer } from "./panels/ChatTrainer";
import { ImageGenerationResult } from "./panels/ImageGenerationResult";
import UtilBlock from "./UtilBlock";

import { appService } from "$/services/AppService";
import { LoadingPanel } from "$/panels/LoadingPanel";
import { ImageGeneration } from "$/panels/ImageGeneration";
import { ImageGenerationExamples } from "$/panels/ImageGenerationExamples";
import Gallery from "$/panels/Gallery";
import ImageCreatePrompts from "$/panels/ImageCreatePrompts";
import Profile from "$/panels/Profile";
import ApplicationInfoStableArt from "./modals/ApplicationInfoStableArt/ApplicationInfoStableArt";
import { PublishingImages } from "$/panels/PublishingImages";
import { Agreement } from "$/modals/Agreement";
import { DetailImage } from "$/modals/DetailImage";
import { WeakRequestModal } from "$/modals/WeakRequestModal";
import { GPTutorProfile } from "$/panels/GPTutorProfile";
import { transformVKBridgeAdaptivity } from "$/utility/strings";
import { MermaidPage } from "$/panels/MermaidPage";
import { AdditionalRequests } from "$/panels/AdditionalRequests";
import { AnecdoteMain } from "$/panels/AnecdoteMain";
import { AnecdoteNews } from "$/panels/AnecdoteNews";
import { BingPanel } from "$/panels/BingPanel";
import { VkDocQuestionRequest } from "$/panels/VkDocQuestionRequest";
import AnecdoteGeneration from "./panels/AnecdoteGeneration/AnecdoteGeneration";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import ApplicationInfoHumor from "./modals/ApplicationInfoHumor/ApplicationInfoHumor";
import VKDocQuestionPanel from "./panels/VKDocQuestionPanel/VKDocQestionPanel";
import DocQuestionPanel from "./panels/ApiLLMPanel";

const App = () => {
  const location = useLocation();
  const { goBack, goToForbidden } = useNavigationContext();

  useEffect(() => {
    bridge
      .send("VKWebAppGetUserInfo")
      .then((user) => vkUserModel.fill(user))
      .catch(goToForbidden);
  }, []);

  useEffect(() => {
    online();
  }, []);

  const history = location.hasOverlay()
    ? []
    : location.getViewHistory(Views.viewMain);

  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const adaptivity = transformVKBridgeAdaptivity(useAdaptivity());
  const { vk_platform } = parseURLSearchParamsForGetLaunchParams(
    window.location.search
  );

  function getPlatform() {
    if (appService.isTG()) {
      return "vkcom";
    }

    return vk_platform === "desktop_web" ? "vkcom" : undefined;
  }

  function getAppearance(): AppearanceType | undefined {
    if (appService.isTG()) {
      const initParams = retrieveLaunchParams();
      return initParams.themeParams.bgColor === "#ffffff" ? "light" : "dark";
    }

    return vkBridgeAppearance;
  }

  const appearance = getAppearance();
  return (
    <ConfigProvider
      appearance={appearance}
      platform={getPlatform()}
      isWebView={bridge.isWebView()}
      hasCustomPanelHeaderAfter={true}
    >
      <AdaptivityProvider {...adaptivity}>
        <AppRoot mode="full" safeAreaInsets={vkBridgeInsets}>
          {appearance === "dark" ? <OneDark /> : <OneLight />}
          <SplitLayout
            popout={
              <>
                <AppAlert id={Modals.alert} />
              </>
            }
            modal={
              <ModalRoot activeModal={location.getModalId()} onClose={goBack}>
                <ApplicationInfo
                  settlingHeight={100}
                  id={Modals.applicationInfo}
                />
                <ApplicationInfoStableArt
                  settlingHeight={100}
                  id={Modals.applicationInfoStableArt}
                />
                <ApplicationInfoHumor
                  settlingHeight={100}
                  id={Modals.applicationInfoHumor}
                />
                <InterviewQuestions id={Modals.interviewQuestions} />
                <Agreement id={Modals.agreement} />
                <DetailImage id={Modals.detailImage} settlingHeight={100} />
                <WeakRequestModal id={Modals.weakRequest} />
              </ModalRoot>
            }
          >
            {appService.loading.get() ? (
              <LoadingPanel />
            ) : (
              <View
                style={{ maxWidth: "100vw", overflowX: "hidden" }}
                id={Views.viewMain}
                activePanel={location.getViewActivePanel(Views.viewMain)!}
                onSwipeBack={goBack}
                history={history}
              >
                <ChatSettings id={Panels.chatSettings} />
                <CodeEditor id={Panels.editor} />
                <ChatTrainer id={Panels.chatTrainer} />
                <Home id={Panels.home} />
                <Chapters id={Panels.chapters} />
                <ChatFree id={Panels.chatFree} />
                <ChatLesson id={Panels.chatLesson} />
                <ChatInterview id={Panels.chatInterview} />
                <History id={Panels.history} />
                <Modes id={Panels.modes} />
                <LeetcodeProblems id={Panels.leetcodeProblems} />
                <ChatLeetCode id={Panels.chatLeetCode} />
                <ProblemDetail id={Panels.problemDetail} />
                <ImageGeneration id={Panels.generationImages} />
                <ImageGenerationResult id={Panels.generationImagesResult} />
                <ImageGenerationExamples id={Panels.generationImagesExamples} />
                <Gallery id={Panels.gallery} />
                <ImageCreatePrompts id={Panels.generationImagesPrompts} />
                <Profile id={Panels.profile} />
                <PublishingImages id={Panels.publishingImages} />
                <GPTutorProfile id={Panels.gptutorProfile} />
                <MermaidPage id={Panels.mermaidPage} />
                <AdditionalRequests id={Panels.additionalRequest} />
                <AnecdoteMain id={Panels.mainAnecdote} />
                <AnecdoteGeneration id={Panels.anecdoteGeneration} />
                <AnecdoteNews id={Panels.anecdoteNews} />
                <BingPanel id={Panels.bingPanel} />
                <VKDocQuestionPanel id={Panels.vkDocQuestionPanel} />
                <VkDocQuestionRequest id={Panels.vkDocQuestionRequest} />
                <DocQuestionPanel id={Panels.docQuestion} />
              </View>
            )}
          </SplitLayout>
          <UtilBlock />
          <SnackbarNotifier />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default App;
