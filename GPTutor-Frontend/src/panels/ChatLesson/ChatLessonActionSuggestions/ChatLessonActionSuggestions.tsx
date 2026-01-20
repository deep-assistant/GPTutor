import React, { memo } from "react";
import { Button, Div, HorizontalScroll, Separator } from "@vkontakte/vkui";

import { ActionSuggestion } from "$/entity/lessons";

import classes from "./ChatLessonActionSuggestions.module.css";

interface IProps {
  actionSuggestions: ActionSuggestion[];
  isTyping: boolean;
  handleSend: (value: string) => void;
  isActionSuggestionsOpen: boolean;
  isStopped: boolean;
}

function ChatLessonActionSuggestions({
  actionSuggestions,
  isActionSuggestionsOpen,
  isTyping,
  isStopped,
  handleSend,
}: IProps) {
  if (!actionSuggestions?.length || !isActionSuggestionsOpen) return null;

  return (
    <>
      <Separator wide />
      <HorizontalScroll>
        <Div
          className={classes.actionSuggestions}
          style={{
            gridTemplateColumns: `repeat(${actionSuggestions?.length}, max-content)`,
          }}
        >
          {actionSuggestions.map((suggestion, index) => (
            <div key={index} className={classes.button}>
              <Button
                aria-label={suggestion.name}
                disabled={isTyping || !isStopped}
                mode="secondary"
                size="m"
                onClick={() => {
                  handleSend(suggestion.text);
                }}
              >
                {suggestion.name}
              </Button>
            </div>
          ))}
        </Div>
      </HorizontalScroll>
    </>
  );
}

export default memo(ChatLessonActionSuggestions);