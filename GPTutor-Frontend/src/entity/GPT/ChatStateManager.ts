import { ChatGptTemplate } from "./ChatGptTemplate";
import { lessonsController, LessonItem } from "$/entity/lessons";
import { interviews } from "$/entity/interview";
import type { ModeType } from "$/entity/lessons";

/**
 * Service for managing chat state transitions and initialization
 * Extracted from ChatGpt class to reduce duplication and improve maintainability
 */
export class ChatStateManager {
  /**
   * Initialize free chat state
   */
  static initializeFreeChat(chatInstance: ChatGptTemplate): void {
    chatInstance.currentHistory = null;
    chatInstance.clearMessages();
    chatInstance.abortSend();
    chatInstance.resetSystemMessage();
  }

  /**
   * Initialize lesson chat state
   */
  static initializeLessonChat(
    chatInstance: ChatGptTemplate, 
    lesson: LessonItem
  ): void {
    chatInstance.clearMessages();
    chatInstance.resetSystemMessage();
    chatInstance.currentHistory = null;
    
    const systemMessage = lessonsController.currentChapter.get()?.systemMessage;
    chatInstance.setInitialSystemMessage(systemMessage);
    lessonsController.setCurrentLesson(lesson.id);
  }

  /**
   * Initialize interview chat state
   */
  static initializeInterviewChat(
    chatInstance: ChatGptTemplate,
    interviewType: string
  ): void {
    interviews.setCurrentInterview(interviewType as ModeType);
    chatInstance.messages$.set([]);
  }

  /**
   * Clear all lesson-related state
   */
  static clearLessonState(): void {
    lessonsController.clearLesson();
  }

  /**
   * Clear all chapter-related state
   */
  static clearChapterState(): void {
    lessonsController.clearChapter();
    lessonsController.clearLesson();
  }
}