import bridge from "@vkontakte/vk-bridge";
import { snackbarNotify } from "$/entity/notify";
import { groupsIsMember } from "$/api/vk";
import { appService } from "$/services/AppService";

class CommunicationService {
  private isRequested = false;
  private isMember = false;

  constructor() {
    if (appService.isTG()) {
      this.isRequested = true;
      this.isMember = true;
    }
  }

  async addToSubscribe() {
    try {
      const isMember = await this.getIsMember();
      if (isMember) {
        snackbarNotify.notify({
          type: "success",
          message: "Вы уже подписаны.",
        });
        return true;
      }
      await bridge.send("VKWebAppJoinGroup", {
        group_id: appService.getGroupId(),
      });
      return true;
    } catch (error) {
      snackbarNotify.notify({
        type: "error",
        message: "Вы не были подписаны на группу!",
      });

      return false;
    }
  }
  async addToFavorite() {
    await bridge.send("VKWebAppAddToFavorites");
  }

  async getIsMember() {
    if (!this.isMember) {
      this.isMember = await this.userIsMember();
    }
    return this.isMember;
  }

  async userIsMember(): Promise<boolean> {
    if (this.isRequested) return false;

    const urlParams = this.getSearchParams();
    const userId = urlParams.get("vk_user_id")!;
    const groupId = String(appService.getGroupId()); // ID группы
    this.isRequested = true;

    return await groupsIsMember({ groupId, userId });
  }

  private getSearchParams() {
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
  }
}

export const communicationService = new CommunicationService();
