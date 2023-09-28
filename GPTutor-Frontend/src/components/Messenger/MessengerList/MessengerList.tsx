import { Button, Placeholder } from "@vkontakte/vkui";
import React, { memo } from "react";

import { ChatGptTemplate } from "$/entity/GPT/ChatGptTemplate";

import { Message } from "./Message";

import classes from "./MessengerList.module.css";

interface IProps {
  chatGpt: ChatGptTemplate;
  onStartChat: () => void;
  placeholderHeader?: string;
  startText?: string;

  startIsDisabled?: boolean;
  placeholderText?: string;
}

// function MessengerPlaceholder({
//   chatGpt,
//   onStartChat,
//   placeholderHeader,
//   startText,
//   startIsDisabled,
//   placeholderText,
// }: Omit<IProps, "isTyping">) {
//   const isStopped = chatGpt.timer.isStopped$.get();

//   return (
//     <div className={classes.placeholderContainer}>
//       <Placeholder
//         header={placeholderHeader || "Начните диалог"}
//         action={
//           <Button
//             disabled={startIsDisabled || !isStopped}
//             aria-label={startText || "Начать"}
//             mode="outline"
//             size="m"
//             onClick={onStartChat}
//           >
//             {startText || "Начать"}
//           </Button>
//         }
//       >
//         {placeholderText || "Запустите бота"}
//       </Placeholder>
//     </div>
//   );
// }

function MessengerList({
  chatGpt,
  onStartChat,
  placeholderHeader,
  startText,
  startIsDisabled,
  placeholderText,
}: IProps) {

  if (chatGpt.$messages.length === 0) {
    return (
      <div className={classes.placeholderContainer}>
        <Placeholder
          header={placeholderHeader || "Начните диалог"}
          action={
            <Button
              disabled={startIsDisabled || !chatGpt.timer.$isStopped}
              aria-label={startText || "Начать"}
              mode="outline"
              size="m"
              onClick={onStartChat}
            >
              {startText || "Начать"}
            </Button>
          }
        >
          {placeholderText || "Запустите бота"}
        </Placeholder>
      </div>
    );
  }

  return (
    <div className={classes.messagesContainer}>
      {chatGpt.$messages.map((message, index) => (
        <Message key={index} chatGpt={chatGpt} message={message} />
      ))}
    </div>
  );
}

export default MessengerList;
