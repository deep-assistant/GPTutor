/*eslint-disable*/
import { batch, memo, sig } from "dignals";

import { sendChatCompletions } from "$/api/completions";
import ReactivePromise from "$/services/ReactivePromise";

import { GPTDialogHistoryData, GPTDialogHistoryType, GPTRoles } from "./types";
import { GptMessage } from "./GptMessage";
import { Timer } from "$/entity/GPT/Timer";
import { lessonsController, ModeType } from "$/entity/lessons";
import { createHistory } from "$/api/history";
import { createMessage, getMessagesById } from "$/api/messages";
import { History } from "$/entity/history";
import { snackbarNotify } from "$/entity/notify";
import { interviews } from "$/entity/interview";
import { leetCode } from "$/entity/leetCode/LeetCode";
import { SubscriptionGPT } from "$/entity/GPT/SubscriptionGPT";
import { getBannerName } from "$/entity/history/utils";
import { gptModels } from "$/entity/GPT/GptModels";
import { userInfo } from "$/entity/user/UserInfo";
import { DialogRestoreService } from "./DialogRestoreService";

const initialSystemContent = `Тебя зовут Deep.GPT, будь полезным помощником.`;

const subscriptionGPT = new SubscriptionGPT();

export abstract class ChatGptTemplate {
  maxContentWords = 1000;

  subscriptionGPT = subscriptionGPT;

  isBlockActions$ = sig(false);

  currentHistory: History | null = null;
  initialSystemContent = initialSystemContent;

  systemMessage = new GptMessage(this.initialSystemContent, GPTRoles.system);

  timer = new Timer(30, 0, "decrement");

  messages$ = sig<GptMessage[]>([]);

  delayTimeout: NodeJS.Timeout | null = null;

  sendCompletions$ = ReactivePromise.create(() => {
    this.delayTimeout = setTimeout(() => this.isDelay$.set(true), 8000);

    return this.sendCompletion();
  });

  createHistory$ = ReactivePromise.create(createHistory);

  getMessages$ = ReactivePromise.create(getMessagesById);

  isDelay$ = sig(false);

  inLocalMessages$ = memo(() =>
    this.messages$.get().filter((message) => message.inLocal)
  );

  selectedMessages$ = memo(() =>
    this.messages$.get().filter((message) => message.isSelected$.get())
  );

  getRunOutOfContextMessages$ = memo(() =>
    this.messages$.get().filter((message) => message.isRunOutOfContext.get())
  );

  getIsNotRunOutOfContextMessages$ = memo(() =>
    this.messages$.get().filter((message) => !message.isRunOutOfContext.get())
  );

  hasSelectedMessages$ = memo(() => this.selectedMessages$.get().length !== 0);

  abortController = new AbortController();

  disableTimer() {
    this.timer.stop();
    this.timer.setDisabled();
  }

  updateMaxContentWords() {
    this.maxContentWords = 2000;
  }

  closeDelay() {
    this.delayTimeout && clearTimeout(this.delayTimeout);
    this.isDelay$.set(false);
  }

  clearMessages = () => {
    this.abortSend();
    this.messages$.set([]);
    this.currentHistory = null;
  };

  setInitialSystemMessage(message: string = "") {
    this.initialSystemContent = message;
    this.systemMessage = new GptMessage(
      this.initialSystemContent,
      GPTRoles.system
    );
  }

  clearSystemMessage = () => {
    this.systemMessage.content$.set("");
  };

  resetSystemMessage = () => {
    this.systemMessage.content$.set(initialSystemContent);
  };

  abortSend = () => {
    this.abortController.abort();
    this.closeDelay();
  };

  blockActions = () => {
    this.isBlockActions$.set(true);
  };

  allowActions = () => {
    this.isBlockActions$.set(false);
  };

  public send = async (content: string) => {
    if (!this.subscriptionGPT.$isAllowSendMessage.get()) return;

    try {
      this.sendCompletions$.loading.set(true);
      const message = new GptMessage(content, GPTRoles.user);
      this.addMessage(message);
      await this.createHistory();
      await this.postMessage(message);

      await this.sendCompletions$.run();
      this.timer.run();

      if (message === this.getLastMessage()) return;
      await this.postMessage(this.getLastMessage());
      this.subscriptionGPT.$handleSendMessage();
    } catch {
      this.timer.run();
    } finally {
      this.allowActions();
    }
  };

  private async sendCompletion() {
    const message = new GptMessage("", GPTRoles.assistant);

    this.abortController = new AbortController();

    await this.sendChatCompletions(message);
  }

  async sendChatCompletions(message: GptMessage) {
    const result = await sendChatCompletions(
      { messages: this.getMessages(), model: gptModels.getModel() },
      this.onMessage(message),
      (energy) => {
        message.setEnergy(energy);
        userInfo.subtractBalance(energy);
      },
      () => {
        this.closeDelay();
        this.addMessage(
          new GptMessage(
            "Сеть ChatGPT перегружена. Попробуйте через минуту",
            GPTRoles.assistant,
            false,
            true
          )
        );
        this.sendCompletions$.reset();
      },
      this.abortController
    );

    this.checkOnRunOutOfMessages();

    return result;
  }

  checkOnRunOutOfMessages() {
    [...this.messages$.get()].reverse().reduce((acc, message) => {
      if (acc > this.maxContentWords) {
        message.toggleRunOutOff();
        return acc;
      }
      return acc + message.content$.get().split(" ").length;
    }, 0);
  }

  onMessage =
    (message: GptMessage) =>
    (value: string, isFirst: boolean, isSecond: boolean) => {
      this.closeDelay();

      if (isFirst) {
        message.onSetMessageContent(value);
        this.addMessage(message);
        return;
      }

      if (!isFirst && isSecond) {
        message.onSetMessageContent(value);
        return;
      }

      if (value.length >= 100) {
        console.log("END!!!");
        return;
      }

      message.onSetMessageContent(value);
    };

  getMessages() {
    if (!this.systemMessage) {
      return this.filterInMemoryMessages(
        this.getIsNotRunOutOfContextMessages$.get()
      ).map(this.toApiMessage);
    }

    if (gptModels.currentModel$.get().startsWith("o1")) {
      return this.filterInMemoryMessages([
        new GptMessage(this.systemMessage.content$.get(), GPTRoles.user),
        ...this.getIsNotRunOutOfContextMessages$.get(),
      ]).map(this.toApiMessage);
    }

    return this.filterInMemoryMessages([
      this.systemMessage,
      ...this.getIsNotRunOutOfContextMessages$.get(),
    ]).map(this.toApiMessage);
  }

  clearSelectedMessages = () => {
    batch(() => {
      this.selectedMessages$
        .get()
        .forEach((message) => message.toggleSelected());
    });
  };

  addMessage(message: GptMessage) {
    this.messages$.set([...this.messages$.get(), message]);
  }

  async postMessage(message?: GptMessage) {
    if (!this.currentHistory || !message) return;

    await createMessage({
      historyId: this.currentHistory.id,
      error: !!message.isError,
      role: message.role,
      content: message.content$.get(),
      isFailedModeration: !message.failedModeration$.get(),
      lastUpdated: new Date(),
      inLocal: !!message.inLocal,
    });
  }

  toApiMessage = (message: GptMessage) => ({
    content: message.content$.get(),
    role: message.role,
  });

  filterInMemoryMessages(messages: GptMessage[]) {
    return messages.filter((message) => !message.inLocal || !message.isError);
  }

  getLastUserMessage() {
    return [...this.messages$.get()]
      .reverse()
      .find((message) => message.role === GPTRoles.user);
  }

  getLastAssistantMessage() {
    return [...this.messages$.get()]
      .reverse()
      .find((message) => message.role === GPTRoles.assistant);
  }

  getLastMessage() {
    const messages = this.messages$.get();
    return messages[messages.length - 1];
  }

  async createHistory() {
    const lastMessage = this.getLastMessage();
    if (!lastMessage) return;

    const data = this.getChatData();

    const type = !data ? GPTDialogHistoryType.Free : data.chapterType;

    const lengthMessages = this.messages$.get().length;
    if (lengthMessages > 1) return;

    const dialog = {
      systemMessage: this.systemMessage.content$.get(),
      lastMessage: lastMessage.content$.get(),
      lessonName: data?.lessonName || "",
      lastUpdated: new Date(),
      type,
    };

    this.currentHistory = await this.createHistory$.run({
      ...dialog,
      title: getBannerName(dialog),
    });
  }

  getChatData(): GPTDialogHistoryData {
    if (leetCode.currentProblem) {
      return {
        chapterType: ModeType.LeetCode,
        lessonName: leetCode.currentProblemSlug,
      };
    }

    const type = interviews.getCurrentInterview()?.type;

    if (type) return { chapterType: type, lessonName: null };

    const currentChapter = lessonsController.currentChapter.get();
    const currentLesson = lessonsController.currentLesson.get();

    if (!currentChapter?.type || !currentLesson?.name) return null;

    return {
      chapterType: currentChapter.type,
      lessonName: currentLesson.name,
    };
  }

  async prepareDialog(dialog: History) {
    if (dialog.type === ModeType.LeetCode) {
      await leetCode.loadDetailProblem(dialog.lessonName);
    }

    if (dialog.type.includes("INTERVIEW")) {
      interviews.setCurrentInterview(dialog.type as ModeType);
      return;
    }

    if (dialog.lessonName && dialog.type) {
      lessonsController.setCurrentChapter(dialog.type as ModeType);
      lessonsController.setCurrentLessonByName(dialog.lessonName);
      return;
    }

    lessonsController.clearChapter();
    lessonsController.clearLesson();
  }

  /**
   * Restore dialog from history using DialogRestoreService
   * Refactored to improve separation of concerns and reduce complexity
   */
  async restoreDialogFromHistory(dialog: History, goToChat: () => void): Promise<void> {
    return DialogRestoreService.restoreDialog(this, dialog, goToChat);
  }
}
