import { useCallback } from "react";
import bridge from "@vkontakte/vk-bridge";
import { chatViewModel } from "../models";
import { SCROLL_DELAY_MS } from "../constants";

interface UseChatHandlersProps {
  scrollToBottom: () => void;
  onMessageChange: (message: string) => void;
}

interface UseChatHandlersReturn {
  handleSendMessage: (message: string) => void;
  handleStartChat: () => Promise<void>;
  handleCopyMessage: (text: string) => Promise<void>;
}

/**
 * Хук для обработки действий в чате
 */
export const useChatHandlers = ({
  scrollToBottom,
  onMessageChange,
}: UseChatHandlersProps): UseChatHandlersReturn => {
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;

      chatViewModel.sendMessage(message);
      onMessageChange("");
      setTimeout(scrollToBottom, SCROLL_DELAY_MS);
    },
    [scrollToBottom, onMessageChange]
  );

  const handleStartChat = useCallback(async () => {
    await chatViewModel.startWelcomeChat();
    setTimeout(scrollToBottom, SCROLL_DELAY_MS);
  }, [scrollToBottom]);

  const handleCopyMessage = useCallback(async (text: string) => {
    try {
      await bridge.send("VKWebAppCopyText", { text });
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  }, []);

  return {
    handleSendMessage,
    handleStartChat,
    handleCopyMessage,
  };
};




