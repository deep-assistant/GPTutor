import { History } from "$/entity/history";
import { ModeType } from "$/entity/lessons";
import { ChatGptTemplate } from "./ChatGptTemplate";

/**
 * Service for handling dialog restoration logic
 * Extracted from ChatGptTemplate to improve separation of concerns
 */
export class DialogRestoreService {
  static async restoreDialog(
    chatGptInstance: ChatGptTemplate,
    dialog: History,
    goToChat: () => void
  ): Promise<void> {
    chatGptInstance.closeDelay();
    chatGptInstance.currentHistory = dialog;

    const messages = await chatGptInstance.getMessages$.run(dialog.id);

    if (chatGptInstance.getMessages$.error.get()) {
      const { snackbarNotify } = await import("$/entity/notify");
      return snackbarNotify.notify({
        type: "error",
        message: "Ошибка при переходе в диплог",
      });
    }

    await this.prepareDialog(dialog);
    this.setSystemMessage(chatGptInstance, dialog);
    this.restoreMessages(chatGptInstance, messages);

    chatGptInstance.checkOnRunOutOfMessages();
    goToChat();
  }

  private static async prepareDialog(dialog: History): Promise<void> {
    if (dialog.type === ModeType.LeetCode) {
      const { leetCode } = await import("$/entity/leetCode/LeetCode");
      await leetCode.loadDetailProblem(dialog.lessonName);
      return;
    }

    if (dialog.type.includes("INTERVIEW")) {
      const { interviews } = await import("$/entity/interview");
      interviews.setCurrentInterview(dialog.type as ModeType);
      return;
    }

    if (dialog.lessonName && dialog.type) {
      const { lessonsController } = await import("$/entity/lessons");
      lessonsController.setCurrentChapter(dialog.type as ModeType);
      lessonsController.setCurrentLessonByName(dialog.lessonName);
      return;
    }

    const { lessonsController } = await import("$/entity/lessons");
    lessonsController.clearChapter();
    lessonsController.clearLesson();
  }

  private static setSystemMessage(chatGptInstance: ChatGptTemplate, dialog: History): void {
    // Import at top level to avoid circular dependency issues
    const { GptMessage } = require("./GptMessage");
    const { GPTRoles } = require("./types");
    
    chatGptInstance.initialSystemContent = dialog.systemMessage;
    chatGptInstance.systemMessage = new GptMessage(dialog.systemMessage, GPTRoles.system);
  }

  private static restoreMessages(chatGptInstance: ChatGptTemplate, messages: any[]): void {
    // Import at top level to avoid circular dependency issues
    const { GptMessage } = require("./GptMessage");
    const { GPTRoles } = require("./types");

    const gptMessages = messages.map((message) => {
      const gptMessage = new GptMessage(
        message.content,
        message.role as typeof GPTRoles[keyof typeof GPTRoles],
        false,
        message.error
      );

      gptMessage.failedModeration$.set(message.isFailedModeration);
      return gptMessage;
    });

    chatGptInstance.messages$.set(gptMessages);
  }
}