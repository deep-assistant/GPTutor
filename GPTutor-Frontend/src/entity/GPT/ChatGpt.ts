import { sig } from "dignals";

import { ChatGptFree } from "$/entity/GPT/ChatGptFree";
import { ChatGptLesson } from "$/entity/GPT/ChatGptLesson";
import { GptHistoryDialogs } from "$/entity/GPT/GptHistoryDialogs";
import { LessonItem, ModeType } from "$/entity/lessons";
import { ChatGptTemplate } from "$/entity/GPT/ChatGptTemplate";
import { ChatGptInterview } from "$/entity/GPT/ChatGptInterview";
import { ChatGptLeetCode } from "$/entity/GPT/ChatGptLeetCode";
import { ChatGptTrainer } from "$/entity/GPT/ChatGptTrainer";
import { VkStorageService } from "$/services/VkStorageService";
import { ChatGptAnecdote } from "$/entity/GPT/ChatGptAnecdote";
import { DialogRouterService } from "./DialogRouterService";
import { ChatStateManager } from "./ChatStateManager";

export class ChatGpt {
  storageService = new VkStorageService();

  hasNewModel = false;
  constructor() {
    this.initHasNewModel();
  }

  async initHasNewModel() {
    const hasNewModel = await this.storageService.get("hasNewModel");
    this.hasNewModel = !!hasNewModel;
  }

  setHasNewModel() {
    this.storageService.set("hasNewModel", "true");
    this.hasNewModel = true;
  }

  history = new GptHistoryDialogs();
  chatGptFree = new ChatGptFree();

  chatGptLesson = new ChatGptLesson();

  chatGptInterview = new ChatGptInterview();

  chatGptLeetCode = new ChatGptLeetCode();

  chatGptTrainer = new ChatGptTrainer();

  chatGptAnecdote = new ChatGptAnecdote();

  currentChatGpt$ = sig<ChatGptTemplate>(this.chatGptFree);

  moveToFreeChat = (goToChat: () => void) => {
    ChatStateManager.clearLessonState();
    ChatStateManager.initializeFreeChat(this.chatGptFree);
    this.currentChatGpt$.set(this.chatGptFree);
    goToChat();
  };

  moveToLessonChat(lesson: LessonItem, goToChatLesson: () => void) {
    ChatStateManager.initializeLessonChat(this.chatGptLesson, lesson);
    this.currentChatGpt$.set(this.chatGptLesson);
    goToChatLesson();
  }

  moveToInterviewChat(interviewType: string, goToChatInterview: () => void) {
    ChatStateManager.initializeInterviewChat(this.chatGptInterview, interviewType);
    goToChatInterview();
  }

  async restoreDialogFromHistory(
    id: string,
    goToChatFree: () => void,
    goToChatLesson: () => void,
    goToChatInterview: () => void,
    goToChatLeetCode: () => void
  ) {
    const dialog = this.history.getDialogById(id);
    if (!dialog) return;

    await DialogRouterService.routeDialog(this, dialog, {
      goToChatFree,
      goToChatLesson,
      goToChatInterview,
      goToChatLeetCode
    });
  }

  getCurrentChatGpt = () => this.currentChatGpt$.get();
}

export const chatGpt = new ChatGpt();
