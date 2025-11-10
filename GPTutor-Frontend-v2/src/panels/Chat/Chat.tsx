import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavIdProps, Panel, ScrollArrow } from "@vkontakte/vkui";
import { observer } from "mobx-react-lite";
import { userViewModel } from "../../viewModels/UserViewModel";
import { chatViewModel } from "./models";
import { ChatHeader, ChatInput, MessageList } from "./components";
import {
  useChatHandlers,
  useChatNavigation,
  useMessengerScroll,
} from "./hooks";
import {
  chatContainerStyle,
  messagesInnerContainerStyle,
  messagesScrollContainerStyle,
  scrollArrowContainerStyle,
} from "./styles";
import { useSnackbar } from "../../hooks";

export interface ChatProps extends NavIdProps {}

/**
 * Главная панель чата
 */
export const Chat: React.FC<ChatProps> = observer(({ id }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Хуки
  const { scrollRef, scrollToBottom, showScrollDown } = useMessengerScroll(
    chatViewModel.isTyping
  );
  const { handleBack, handleModelSelect } = useChatNavigation();
  const { handleSendMessage, handleStartChat } = useChatHandlers({
    scrollToBottom,
    onMessageChange: setMessage,
  });
  const { showError } = useSnackbar();

  // Инициализация пользователя и snackbar callback
  useEffect(() => {
    userViewModel.getUser();
    chatViewModel.setSnackbarCallback(showError);
  }, [showError]);

  // Получение имени пользователя
  const getUserName = useCallback(() => {
    return userViewModel.user?.first_name || "Вы";
  }, [userViewModel.user?.first_name]);

  // Очистка сообщений
  const handleClearMessages = useCallback(() => {
    chatViewModel.clearMessages();
  }, []);

  // Обработчики файлов
  const handleFileUpload = useCallback((file: File) => {
    console.log("Starting file upload:", file.name);
    // Не ждем завершения загрузки, чтобы можно было загружать несколько файлов параллельно
    chatViewModel.uploadFile(file).catch((error) => {
      console.error("Failed to upload file:", error);
    });
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    chatViewModel.removeFile(fileId);
  }, []);

  const handleCancelUpload = useCallback((uploadId: string) => {
    chatViewModel.cancelUpload(uploadId);
  }, []);

  const handleOnlineModeToggle = useCallback(() => {
    chatViewModel.toggleOnlineMode();
  }, []);

  return (
    <Panel id={id}>
      <div className="chat-container" style={chatContainerStyle}>
        <ChatHeader isTyping={chatViewModel.isTyping} onBack={handleBack} />

        <div ref={scrollRef} style={messagesScrollContainerStyle}>
          <div style={messagesInnerContainerStyle}>
            <MessageList
              ref={messagesEndRef}
              messages={chatViewModel.getMessages()}
              userViewModel={userViewModel}
              getUserName={getUserName}
              onStartChat={handleStartChat}
              isUploadingFiles={chatViewModel.getUploadingFiles().length > 0}
            />
          </div>
        </div>

        <div style={scrollArrowContainerStyle}>
          {showScrollDown && (
            <ScrollArrow direction="down" onClick={scrollToBottom} />
          )}
        </div>

        <ChatInput
          message={message}
          onMessageChange={setMessage}
          onSendMessage={() => handleSendMessage(message)}
          disabled={chatViewModel.isLoading}
          currentModel={chatViewModel.currentModel}
          isOnlineMode={chatViewModel.isOnlineMode}
          onModelSelect={handleModelSelect}
          onOnlineModeToggle={handleOnlineModeToggle}
          onClearMessages={handleClearMessages}
          attachedFiles={chatViewModel.getAttachedFiles()}
          uploadingFiles={chatViewModel.getUploadingFiles()}
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          onCancelUpload={handleCancelUpload}
        />
      </div>
    </Panel>
  );
});
