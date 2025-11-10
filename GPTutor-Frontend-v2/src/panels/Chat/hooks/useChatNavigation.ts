import { useCallback } from "react";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";

interface UseChatNavigationReturn {
  handleBack: () => void;
  handleModelSelect: () => void;
}

/**
 * Хук для навигации в чате
 */
export const useChatNavigation = (): UseChatNavigationReturn => {
  const routeNavigator = useRouteNavigator();

  const handleBack = useCallback(() => {
    const viewHistory = (routeNavigator as any).viewHistory?.history;
    if (!viewHistory || viewHistory.length <= 1) {
      routeNavigator.push("/");
    } else {
      routeNavigator.back();
    }
  }, [routeNavigator]);

  const handleModelSelect = useCallback(() => {
    routeNavigator.push("/models");
  }, [routeNavigator]);

  return {
    handleBack,
    handleModelSelect,
  };
};




