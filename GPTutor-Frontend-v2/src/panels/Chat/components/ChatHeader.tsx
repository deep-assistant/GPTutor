import React from "react";
import { Avatar, Text, IconButton } from "@vkontakte/vkui";
import {
  Icon12OnlineMobile,
  Icon24ArrowLeftOutline,
  Icon28MessageOutline,
} from "@vkontakte/icons";
import { observer } from "mobx-react-lite";
import { ChatHeaderProps } from "../types";
import { chatHeaderStyle } from "../styles";
import { CHAT_TITLE, TYPING_TEXT, BOT_AVATAR_URL } from "../constants";

export const ChatHeader: React.FC<ChatHeaderProps> = observer(
  ({ isTyping, onBack }) => {
    return (
      <div style={chatHeaderStyle}>
        <IconButton style={{ marginRight: "12px" }} onClick={onBack}>
          <Icon24ArrowLeftOutline />
        </IconButton>

        <Avatar
          size={40}
          src={BOT_AVATAR_URL}
          fallbackIcon={<Icon28MessageOutline />}
          style={{
            backgroundColor: "var(--vkui--color_accent_blue)",
            marginRight: "12px",
          }}
        />

        <div style={{ flex: 1 }}>
          <Text
            weight="2"
            style={{
              fontSize: "16px",
              lineHeight: "20px",
              color: "var(--vkui--color_text_primary)",
            }}
          >
            {CHAT_TITLE}
          </Text>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "2px",
            }}
          >
            {isTyping ? (
              <Text
                style={{
                  fontSize: "13px",
                  color: "var(--vkui--color_text_secondary)",
                  fontWeight: "500",
                }}
              >
                {TYPING_TEXT}
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: "13px",
                    color: "var(--vkui--color_text_secondary)",
                    fontWeight: "500",
                  }}
                >
                  Онлайн
                </Text>
                <Icon12OnlineMobile
                  style={{
                    color: "var(--vkui--color_text_positive--active)",
                    marginLeft: "4px",
                    width: "12px",
                    height: "12px",
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);
