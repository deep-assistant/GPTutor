import { History } from "$/entity/history";
import { ModeType } from "$/entity/lessons";
import type { ChatGpt } from "./ChatGpt";

/**
 * Service for handling dialog routing logic
 * Extracted from ChatGpt class to improve maintainability
 */
export class DialogRouterService {
  /**
   * Routes dialog restoration to the appropriate chat type based on dialog properties
   */
  static async routeDialog(
    chatGpt: ChatGpt,
    dialog: History,
    navigationCallbacks: {
      goToChatFree: () => void;
      goToChatLesson: () => void;
      goToChatInterview: () => void;
      goToChatLeetCode: () => void;
    }
  ): Promise<void> {
    const { goToChatFree, goToChatLesson, goToChatInterview, goToChatLeetCode } = navigationCallbacks;

    // Route to Free Chat
    if (dialog.type === "Free") {
      chatGpt.currentChatGpt$.set(chatGpt.chatGptFree);
      await chatGpt.chatGptFree.restoreDialogFromHistory(dialog, goToChatFree);
      return;
    }

    // Route to LeetCode Chat
    if (dialog.type === ModeType.LeetCode) {
      chatGpt.currentChatGpt$.set(chatGpt.chatGptLeetCode);
      await chatGpt.chatGptLeetCode.restoreDialogFromHistory(dialog, goToChatLeetCode);
      return;
    }

    // Route to Interview Chat
    if (dialog.type.includes("INTERVIEW")) {
      chatGpt.currentChatGpt$.set(chatGpt.chatGptInterview);
      await chatGpt.chatGptInterview.restoreDialogFromHistory(dialog, goToChatInterview);
      return;
    }

    // Route to Lesson Chat
    if (dialog.type && dialog.lessonName) {
      chatGpt.currentChatGpt$.set(chatGpt.chatGptLesson);
      await chatGpt.chatGptLesson.restoreDialogFromHistory(dialog, goToChatLesson);
      return;
    }
  }

  /**
   * Get the appropriate chat instance for a given dialog type
   */
  static getChatInstanceForDialogType(chatGpt: ChatGpt, dialogType: string) {
    if (dialogType === "Free") return chatGpt.chatGptFree;
    if (dialogType === ModeType.LeetCode) return chatGpt.chatGptLeetCode;
    if (dialogType.includes("INTERVIEW")) return chatGpt.chatGptInterview;
    return chatGpt.chatGptLesson; // default for lesson dialogs
  }
}