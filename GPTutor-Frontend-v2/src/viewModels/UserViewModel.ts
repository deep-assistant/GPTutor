import bridge, { UserInfo } from "@vkontakte/vk-bridge";
import { makeAutoObservable } from "mobx";

export class UserViewModel {
  loading = false;
  user: UserInfo = {} as UserInfo;

  constructor() {
    makeAutoObservable(this);
  }

  async getUser() {
    try {
      this.loading = true;
      this.user = await bridge.send("VKWebAppGetUserInfo");
      console.log(this.user);
    } finally {
      this.loading = false;
    }
  }

  getUserId() {
    return this.user.id;
  }
}

export const userViewModel = new UserViewModel();
