import { useState, useCallback } from "react";
import { UserProfile, VkData } from "../api/profileApi";
import { ProfileService } from "../services/ProfileService";
import { CodeExampleType } from "../services/CodeExampleService";
import { useSnackbar } from "../hooks";

export interface ProfileViewModelState {
  profile: UserProfile | null;
  vkData: VkData | null;
  loading: boolean;
  updatingToken: boolean;
  activeCodeExample: CodeExampleType;
}

export const useProfileViewModel = () => {
  const { showSuccess, showError } = useSnackbar();

  const [state, setState] = useState<ProfileViewModelState>({
    profile: null,
    vkData: null,
    loading: true,
    updatingToken: false,
    activeCodeExample: "curl",
  });

  const setActiveCodeExample = useCallback(
    (activeCodeExample: CodeExampleType) => {
      setState((prev) => ({ ...prev, activeCodeExample }));
    },
    []
  );

  const loadProfile = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const { user, vkData } = await ProfileService.loadProfile();
      setState((prev) => ({
        ...prev,
        profile: user,
        vkData,
        loading: false,
      }));
    } catch (error) {
      showError("Ошибка загрузки профиля");

      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }, []);

  const updateToken = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, updatingToken: true }));
      const newApiKey = await ProfileService.updateApiToken();

      setState((prev) => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, apiKey: newApiKey } : null,
        updatingToken: false,
      }));

      showSuccess("API ключ успешно обновлен!");
    } catch (error) {
      showError("Ошибка обновления ключа");
      setState((prev) => ({
        ...prev,
        updatingToken: false,
      }));
    }
  }, []);

  return {
    ...state,
    setActiveCodeExample,
    loadProfile,
    updateToken,
  };
};
