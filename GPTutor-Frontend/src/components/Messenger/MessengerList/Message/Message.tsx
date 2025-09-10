import React, { memo } from "react";

import {
  classNames,
  Div,
  IconButton,
  Spacing,
  Text,
  Title,
} from "@vkontakte/vkui";
import { Icon24CheckCircleOutline, Icon24Share } from "@vkontakte/icons";

import { GptMessage } from "$/entity/GPT";

import { vkUser } from "$/entity/user";

import { MessengerParagraph } from "$/components/Messenger/MessengerParagraph";
import { MessengerAva } from "$/components/Messenger/MessengerAva";

import { WarningTooltip } from "./WarningTooltip";

import classes from "./Message.module.css";
import { Copy } from "$/components/Copy";
import { ChatGptTemplate } from "$/entity/GPT/ChatGptTemplate";
import { appService } from "$/services/AppService";
import { shareService } from "$/services/ShareService";

interface IProps {
  chatGpt: ChatGptTemplate;
  message: GptMessage;
}

function Message({ chatGpt, message }: IProps) {
  const runOutOfContextMessages = chatGpt.getRunOutOfContextMessages$.get();
  const selected = message.isSelected$.get() ? classes.selected : "";

  const hasSelectedMessages = chatGpt.hasSelectedMessages$.get();

  const onClickMessage = () => {
    if (!hasSelectedMessages) return;
    message.toggleSelected();
  };

  const onSelectFirstMessage = (e: any) => {
    e.stopPropagation();
    message.toggleSelected();
  };

  const onForwardMessage = (e: any) => {
    e.stopPropagation();
    const senderName = message.role === "assistant" 
      ? appService.getGPTName() 
      : vkUser?.first_name || "Пользователь";
    
    shareService.forwardMessage(message.content$.get(), senderName);
  };

  return (
    <div
      className={classNames(
        { [classes.message]: hasSelectedMessages },
        selected
      )}
      onClick={onClickMessage}
    >
      <Div className={classes.container}>
        <div className={classes.normalize}>
          <MessengerAva message={message} photo={vkUser?.photo_100} />
        </div>
        <div style={{ display: "grid", width: "100%" }}>
          <div className={classes.topBlock}>
            <Text weight="2" className={classes.normalize}>
              {message.role === "assistant"
                ? appService.getGPTName()
                : vkUser?.first_name || "Вы"}
            </Text>
            <div className={classes.iconsBlock}>
              {runOutOfContextMessages.find(({ id }) => message.id === id) && (
                <WarningTooltip />
              )}
              <Copy textToClickBoard={message.content$.get()} />
              <IconButton onClick={onForwardMessage}>
                <Icon24Share />
              </IconButton>
              <IconButton
                className={selected ? classes.selectedIcon : ""}
                onClick={onSelectFirstMessage}
              >
                <Icon24CheckCircleOutline />
              </IconButton>
            </div>
          </div>
          <MessengerParagraph message={message} />
          <Spacing size={12} />
          {!!message.energy.get() && (
            <Title level="3">Затрачено {message.energy} ⚡</Title>
          )}
        </div>
      </Div>
    </div>
  );
}

export default memo(Message);
