import React from "react";
import { Snackbar } from "@vkontakte/vkui";
import { Icon28RefreshOutline, Icon28SettingsOutline } from "@vkontakte/icons";
import { profileApi, UserProfile, VkData } from "../api/profileApi";

export class ProfileService {
  static async loadProfile(): Promise<{ user: UserProfile; vkData: VkData }> {
    try {
      const response = await profileApi.getProfile();
      return {
        user: response.user,
        vkData: response.vkData,
      };
    } catch (error) {
      console.error("Failed to load profile:", error);
      throw new Error("Ошибка загрузки профиля");
    }
  }

  static async updateApiToken(): Promise<string> {
    try {
      const response = await profileApi.updateToken();
      return response.newApiKey;
    } catch (error) {
      console.error("Failed to update token:", error);
      throw new Error("Ошибка обновления ключа");
    }
  }

  static createSuccessSnackbar(
    message: string,
    onClose: () => void
  ): React.ReactNode {
    return (
      <Snackbar onClose={onClose} before={<Icon28RefreshOutline />}>
        {message}
      </Snackbar>
    );
  }

  static createErrorSnackbar(
    message: string,
    onClose: () => void
  ): React.ReactNode {
    return (
      <Snackbar onClose={onClose} before={<Icon28SettingsOutline />}>
        {message}
      </Snackbar>
    );
  }
}


