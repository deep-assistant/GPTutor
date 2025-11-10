import React from "react";
import {
  Button,
  Div,
  Flex,
  Separator,
  WriteBar,
  WriteBarIcon,
} from "@vkontakte/vkui";
import {
  Icon24DeleteOutline,
  Icon28Send,
  Icon28SettingsOutline,
} from "@vkontakte/icons";
import { observer } from "mobx-react-lite";
import { ChatInputProps } from "../types";
import { AttachedFiles } from "./AttachedFiles";
import { FileUpload } from "./FileUpload";

export const ChatInput: React.FC<ChatInputProps> = observer(
  ({
    message,
    onMessageChange,
    onSendMessage,
    disabled = false,
    currentModel,
    onModelSelect,
    onClearMessages,
    attachedFiles = [],
    uploadingFiles = [],
    onFileUpload,
    onFileRemove,
    onCancelUpload,
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        // Блокируем отправку если загружаются файлы
        if (uploadingFiles && uploadingFiles.length > 0) {
          return;
        }
        onSendMessage();
      }
    };

    const handleFileUpload = (file: File) => {
      if (onFileUpload) {
        onFileUpload(file);
      }
    };

    const handleFileRemove = (fileId: string) => {
      if (onFileRemove) {
        onFileRemove(fileId);
      }
    };

    return (
      <div
        style={{
          width: "100%",
          background: "var(--vkui--color_background)",
        }}
      >
        <Div
          style={{
            background: "var(--vkui--color_background_contrast_themed)",
            borderTop: "1px solid var(--vkui--color_separator_primary)",
            borderBottom: "1px solid var(--vkui--color_separator_primary)",
          }}
        >
          <Flex gap={8} align="center" justify="space-between">
            <Button
              size="s"
              mode="outline"
              onClick={onModelSelect}
              disabled={disabled}
              before={<Icon28SettingsOutline width={16} height={16} />}
            >
              {currentModel}
            </Button>
          </Flex>
        </Div>

        <Separator />

        <AttachedFiles
          files={attachedFiles}
          uploadingFiles={uploadingFiles}
          onFileRemove={handleFileRemove}
          onCancelUpload={onCancelUpload}
          onFileSelect={handleFileUpload}
          disabled={disabled}
        />

        <WriteBar
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          before={
            <FileUpload
              onFileSelect={handleFileUpload}
              disabled={disabled}
              accept="image/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.csv,.js,.html,.css,.json,.xml,.md,.log,.py,.java,.c,.cpp,.sql,.pptx,.ppt"
            />
          }
          after={
            <>
              <WriteBarIcon
                onClick={onClearMessages}
                disabled={disabled}
                style={{ color: "var(--vkui--color_icon_negative)" }}
              >
                <Icon24DeleteOutline />
              </WriteBarIcon>
              <WriteBarIcon
                mode="send"
                onClick={onSendMessage}
                disabled={
                  (!message.trim() && attachedFiles.length === 0) ||
                  disabled ||
                  (uploadingFiles && uploadingFiles.length > 0)
                }
                title={
                  uploadingFiles && uploadingFiles.length > 0
                    ? "Дождитесь загрузки файлов"
                    : undefined
                }
              >
                <Icon28Send />
              </WriteBarIcon>
            </>
          }
          placeholder="Сообщение"
        />
      </div>
    );
  }
);
