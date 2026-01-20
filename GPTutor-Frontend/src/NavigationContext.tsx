import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useRouter } from "@happysanta/router";

import { Modals, Panels, RoutingPages, Views } from "$/entity/routing";
import { appService } from "$/services/AppService";

export type AlertType = {
  onAction: () => void;
  actionText: string;
  header: string;
  text: string;
};

export type NavigationContextType = {
  goBack: () => void;
  goToChapters: () => void;
  goToChatFree: () => void;
  goToChatLesson: () => void;
  goToChatInterview: () => void;
  goToOpenSource: () => void;
  goToHistory: () => void;
  goToModes: () => void;
  goToForbidden: () => void;
  goToChatSettingsModal: () => void;
  openApplicationInfo: () => void;
  openInterviewQuestions: () => void;
  goToLeetcodeProblems: () => void;
  goToChatLeetCode: () => void;
  goToProblemDetail: () => void;
  goToGenerationImages: () => void;
  goToChatTrainer: () => void;
  goToEditor: () => void;
  goToGenerationImagesResult: () => void;
  goToGenerationImagesExamples: () => void;
  goToGenerationImagesPrompts: () => void;
  goToImageDonutModal: () => void;
  goToOpenProfile: () => void;
  goToGallery: () => void;
  goToPublishingImages: () => void;
  openDetailImage: () => void;
  openApplicationInfoStableArt: () => void;
  openWeakRequest: () => void;
  openAgreement: () => void;
  goToGPTutorProfileReplace: () => void;
  goToGPTutorProfile: () => void;
  goToMermaidPage: () => void;
  goToAnecdoteGeneration: () => void;
  goToAdditionalRequest: () => void;
  openApplicationInfoHumor: () => void;
  goToAnecdoteNews: () => void;
  goToAnecdoteMain: () => void;
  goToBingPanel: () => void;
  goToVkDocQuestionRequest: () => void;
  goToTopicSuggestions: () => void;
  goToTopicSuggestionModal: () => void;
  openAlert: (data: AlertType) => void;
  alert: AlertType;
  isForbidden: boolean;
};

const NavigationContext = createContext<NavigationContextType>(
  {} as NavigationContextType
);

export function NavigationContextProvider({
  children,
}: PropsWithChildren<any>) {
  const [alert, setAlert] = useState<AlertType>({
    onAction: () => {},
    text: "",
    actionText: "",
    header: "",
  });

  const [isForbidden, setForbidden] = useState(false);

  const location = useLocation();
  const router = useRouter();

  useEffect(() => {
    router.replacePage(appService.getBasePanel());
  }, []);

  const activePanel = location.getViewActivePanel(Views.viewMain)!;

  function push(panel: RoutingPages, mode: "replace" | "push" = "push") {
    if (panel.slice(1) === activePanel) return;
    if (mode === "replace") {
      if (location.getViewHistory(Views.viewMain).length === 1) {
        router.pushPage(panel);
        return;
      }
    }

    router[`${mode}Page`](panel);
  }

  const goBack = () => {
    if (activePanel === Panels.forbidden) return;

    router.popPage();
  };

  useEffect(() => {
    if (activePanel === Panels.forbidden) setForbidden(true);
  }, [activePanel]);

  const goToChapters = () => push(RoutingPages.chapters);
  const goToChatFree = () => push(RoutingPages.chatFree);
  const goToChatLesson = () => push(RoutingPages.chatLesson);
  const goToChatInterview = () => push(RoutingPages.chatInterview);
  const goToChatTrainer = () => push(RoutingPages.chatTrainer);
  const goToOpenSource = () => push(RoutingPages.openSource);

  const goToHistory = () => push(RoutingPages.history, "replace");

  const goToModes = () => push(RoutingPages.modes, "replace");

  const goToForbidden = () => push(RoutingPages.forbidden);

  const goToLeetcodeProblems = () => push(RoutingPages.leetcodeProblems);

  const goToGenerationImages = () => push(RoutingPages.generationImages);
  const goToOpenProfile = () => push(RoutingPages.profile, "replace");

  const goToGenerationImagesResult = () =>
    push(RoutingPages.generationImagesResult, "replace");
  const goToGenerationImagesExamples = () =>
    push(RoutingPages.generationImagesExamples, "replace");

  const goToGenerationImagesPrompts = () =>
    push(RoutingPages.generationImagesPrompts);

  const goToGallery = () => push(RoutingPages.gallery, "replace");

  const goToPublishingImages = () =>
    push(RoutingPages.publishingImages, "replace");

  const goToChatLeetCode = () => {
    const problemPages = location
      .getViewHistory(Views.viewMain)
      .filter((item) => item === Panels.problemDetail);

    if (problemPages.length === 2) return goBack();

    push(RoutingPages.chatLeetCode);
  };

  const goToProblemDetail = () => {
    push(RoutingPages.problemDetail);
  };

  const goToEditor = () => {
    const editorRoutes = location
      .getViewHistory(Views.viewMain)
      .filter((item) => item === Panels.editor);

    if (editorRoutes.length > 1) {
      goBack();
      return;
    }

    push(RoutingPages.editor);
  };

  const goToChatSettingsModal = () => push(RoutingPages.chatSettings);

  const goToImageDonutModal = () => router.pushModal(Modals.imageDonut);
  const openApplicationInfo = () => router.pushModal(Modals.applicationInfo);

  const openAgreement = () => router.pushModal(Modals.agreement);

  const openDetailImage = () => router.pushModal(Modals.detailImage);

  const openWeakRequest = () => router.pushModal(Modals.weakRequest);

  const goToGPTutorProfileReplace = () =>
    push(RoutingPages.gptutorProfile, "replace");

  const goToGPTutorProfile = () => push(RoutingPages.gptutorProfile);
  const openApplicationInfoStableArt = () =>
    router.pushModal(Modals.applicationInfoStableArt);

  const openApplicationInfoHumor = () =>
    router.pushModal(Modals.applicationInfoHumor);

  const openAlert = (data: AlertType) => {
    setAlert(data);
    router.pushPopup(Modals.alert);
  };

  const openInterviewQuestions = () =>
    router.pushModal(Modals.interviewQuestions);

  const goToMermaidPage = () => {
    router.pushPage(RoutingPages.mermaidPage);
  };

  const goToAdditionalRequest = () => {
    router.pushPage(RoutingPages.additionalRequest);
  };

  const goToAnecdoteGeneration = () => {
    router.pushPage(RoutingPages.anecdoteGeneration);
  };
  const goToAnecdoteNews = () => {
    router.pushPage(RoutingPages.anecdoteNews);
  };

  const goToAnecdoteMain = () => {
    router.pushPage(RoutingPages.mainAnecdote);
  };

  const goToBingPanel = () => {
    router.pushPage(RoutingPages.bingPanel);
  };

  const goToVkDocQuestionRequest = () => {
    router.pushPage(RoutingPages.vkDocQuestionRequest);
  };

  const goToTopicSuggestions = () => {
    router.pushPage(RoutingPages.topicSuggestions);
  };

  const goToTopicSuggestionModal = () => {
    router.pushModal(Modals.topicSuggestionModal);
  };

  return (
    <NavigationContext.Provider
      value={{
        goToGallery,
        goToGenerationImagesExamples,
        goBack,
        goToHistory,
        goToChapters,
        goToChatFree,
        goToChatLesson,
        goToModes,
        goToOpenSource,
        goToForbidden,
        goToChatSettingsModal,
        openApplicationInfo,
        goToChatInterview,
        openApplicationInfoStableArt,
        openInterviewQuestions,
        goToLeetcodeProblems,
        goToEditor,
        goToChatLeetCode,
        goToProblemDetail,
        openAlert,
        goToChatTrainer,
        goToGenerationImages,
        goToGenerationImagesResult,
        goToGenerationImagesPrompts,
        goToImageDonutModal,
        goToPublishingImages,
        goToOpenProfile,
        openDetailImage,
        openAgreement,
        openWeakRequest,
        goToGPTutorProfileReplace,
        goToGPTutorProfile,
        goToMermaidPage,
        goToAdditionalRequest,
        goToAnecdoteGeneration,
        openApplicationInfoHumor,
        goToAnecdoteNews,
        goToAnecdoteMain,
        goToVkDocQuestionRequest,
        goToBingPanel,
        goToTopicSuggestions,
        goToTopicSuggestionModal,
        alert,
        isForbidden,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  return useContext(NavigationContext);
}
