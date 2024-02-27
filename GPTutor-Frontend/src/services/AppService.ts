import { sig } from "dignals";

export enum AppInstanceType {
  StableArt = "Stable Art",
  GPTutor = "GPTutor",
}

class AppService {
  loading = sig(false);

  appInstance = (window as any).env.REACT_APP;

  toggleLoading() {
    this.loading.set(!this.loading.get());
  }

  isStableArt() {
    return this.appInstance === AppInstanceType.StableArt;
  }

  isGPTutor() {
    return this.appInstance === AppInstanceType.GPTutor;
  }

  hasAppInstance() {}
}

export const appService = new AppService();
