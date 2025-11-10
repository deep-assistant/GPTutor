import { forwardRef } from "react";
import { Button, Placeholder } from "@vkontakte/vkui";
import { Icon28QuestionOutline, Icon28RobotOutline } from "@vkontakte/icons";
import { MessageListProps } from "../types";
import { MessageItem } from "./MessageItem";
import {
  EMPTY_CHAT_TITLE,
  EMPTY_CHAT_DESCRIPTION,
  START_CHAT_BUTTON_TEXT,
} from "../constants";

/**
 * Список сообщений чата с плейсхолдером для пустого состояния
 */
export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (
    { messages, userViewModel, getUserName, onStartChat, isUploadingFiles },
    ref
  ) => {
    if (messages.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            marginTop: "10vh",
          }}
        >
          <Placeholder
            icon={<Icon28RobotOutline width={86} height={86} />}
            title={EMPTY_CHAT_TITLE}
          >
            {EMPTY_CHAT_DESCRIPTION}
            <br />
            <Button
              mode="outline"
              size="m"
              onClick={onStartChat}
              disabled={isUploadingFiles}
              style={{ marginTop: "16px" }}
              after={<Icon28QuestionOutline />}
            >
              {isUploadingFiles ? "Загрузка файлов..." : START_CHAT_BUTTON_TEXT}
            </Button>
          </Placeholder>
        </div>
      );
    }

    return (
      <div style={{ marginTop: "12px", paddingBottom: "20px" }}>
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            userViewModel={userViewModel}
            getUserName={getUserName}
          />
        ))}
        <div ref={ref} />
      </div>
    );
  }
);

MessageList.displayName = "MessageList";
