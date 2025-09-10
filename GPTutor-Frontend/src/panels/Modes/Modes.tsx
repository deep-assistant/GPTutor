import React from "react";

import { Panel, PanelHeader, PanelHeaderBack } from "@vkontakte/vkui";

import { AppContainer } from "$/components/AppContainer";
import Cards from "$/components/Cards/Cards";
import {
  languages,
  lessonsController,
  ModeType,
  technologies,
} from "$/entity/lessons";
import PanelTitle from "$/components/PanelTitle";
import { useNavigationContext } from "$/NavigationContext";

import { interviews } from "$/entity/interview";
import { leetCode } from "$/entity/leetCode/LeetCode";
import { chatGpt } from "$/entity/GPT";

import classes from "./Modes.module.css";
import { trainers } from "$/entity/Trainers";
import { AppPanelHeader } from "$/components/AppPanelHeader";

interface IProps {
  id: string;
}

function Modes({ id }: IProps) {
  const {
    goBack,
    goToChapters,
    goToChatInterview,
    goToLeetcodeProblems,
    goToEditor,
    goToMarkdownReader,
  } = useNavigationContext();

  return (
    <Panel id={id}>
      <AppContainer
        isSecondary
        className={classes.container}
        headerChildren={
          <AppPanelHeader before={<PanelHeaderBack onClick={goBack} />}>
            <PanelTitle mobileTitle="Режимы" title="Режимы" />
          </AppPanelHeader>
        }
      >
        <Cards
          isTop
          title="Языки программирования"
          chapters={languages}
          onClickChapter={(chapter) => {
            lessonsController.setCurrentChapter(chapter.type as ModeType);
            goToChapters();
          }}
        />
        <Cards
          title="Технологии"
          chapters={technologies}
          onClickChapter={(chapter) => {
            lessonsController.setCurrentChapter(chapter.type as ModeType);
            goToChapters();
          }}
        />

        <Cards
          title="Собеседования"
          chapters={interviews.interviews}
          onClickChapter={(chapter) => {
            chatGpt.moveToInterviewChat(chapter.type, goToChatInterview);
          }}
        />
        <Cards
          isBottom
          title="Алгоритмы"
          chapters={[{ type: ModeType.LeetCode, header: "Решебник задач" }]}
          onClickChapter={() => {
            leetCode.currentProblem = null;
            goToLeetcodeProblems();
          }}
        />
        <Cards
          isBottom
          title="Песочницы"
          chapters={trainers.items}
          onClickChapter={(chapter) => {
            trainers.setCurrentTrainer(chapter.type as ModeType);
            trainers.getCurrentTrainer()?.setInitialValue();
            chatGpt.chatGptTrainer.messages$.set([]);
            goToEditor();
          }}
        />
        <Cards
          isBottom
          title="Инструменты"
          chapters={[{ type: "MARKDOWN_READER" as ModeType, header: "Markdown Reader" }]}
          onClickChapter={() => {
            goToMarkdownReader();
          }}
        />
      </AppContainer>
    </Panel>
  );
}

export default Modes;
