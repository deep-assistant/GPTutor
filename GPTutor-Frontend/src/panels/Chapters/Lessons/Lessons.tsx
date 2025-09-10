import React, { useEffect } from "react";

import { Placeholder, Search, SimpleCell, Div, Button } from "@vkontakte/vkui";
import { Icon20ChevronRight, Icon56GhostOutline, Icon24AddOutline } from "@vkontakte/icons";

import { ChapterItem, LessonItem } from "$/entity/lessons";
import { useNavigationContext } from "$/NavigationContext";

import classes from "./Lessons.module.css";
import TertiaryTitle from "$/components/TertiaryTitle";

interface IProps {
  currentChapter: ChapterItem;
  onClickLesson: (lesson: LessonItem) => void;
}

function Lessons({ currentChapter, onClickLesson }: IProps) {
  const lessons = currentChapter.lessons.get();
  const { goToLessonSuggestion } = useNavigationContext();

  useEffect(() => {
    currentChapter.searchLessons(currentChapter.searchValue$.get());
  }, []);

  return (
    <div className={classes.lessons}>
      <Search
        value={currentChapter.searchValue$.get()}
        onChange={({ target }) => currentChapter.searchLessons(target.value)}
        after={null}
      />
      {Object.entries(lessons).length === 0 && (
        <Placeholder
          className={classes.placeholder}
          icon={<Icon56GhostOutline />}
          header="Ничего не найдено"
        />
      )}
      {Object.entries(lessons).map(([key, value]) => (
        <React.Fragment key={key}>
          <TertiaryTitle>{key}</TertiaryTitle>
          {value.map((lesson) => (
            <SimpleCell
              style={{ whiteSpace: "normal" }}
              key={lesson.id}
              after={<Icon20ChevronRight />}
              onClick={() => onClickLesson(lesson)}
            >
              <div>{lesson.name}</div>
            </SimpleCell>
          ))}
        </React.Fragment>
      ))}
      <Div>
        <Button
          size="m"
          mode="secondary"
          before={<Icon24AddOutline />}
          onClick={goToLessonSuggestion}
          style={{ width: "100%" }}
        >
          Предложить урок
        </Button>
      </Div>
    </div>
  );
}

export default Lessons;
