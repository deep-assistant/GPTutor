import React from "react";
import {
  Button,
  ButtonGroup,
  FormItem,
  Group,
  Header,
  Input,
  Select,
} from "@vkontakte/vkui";
import { chatGpt } from "$/entity/GPT";
import { ModeType } from "$/entity/lessons";

import classes from "./HistoryFilter.module.css";

const typeOptions = [
  { label: "Все типы", value: "" },
  { label: "Свободный чат", value: "Free" },
  { label: "JavaScript", value: ModeType.JS },
  { label: "React", value: ModeType.React },
  { label: "TypeScript", value: ModeType.Typescript },
  { label: "Vue", value: ModeType.Vue },
  { label: "Git", value: ModeType.Git },
  { label: "HTML/CSS", value: ModeType.HTMLCSS },
  { label: "Go", value: ModeType.Go },
  { label: "HTML/CSS Собеседование", value: ModeType.HTMLCSS_INTERVIEW },
  { label: "React Собеседование", value: ModeType.REACT_INTERVIEW },
  { label: "JavaScript Собеседование", value: ModeType.JAVASCRIPT_INTERVIEW },
  { label: "LeetCode", value: ModeType.LeetCode },
  { label: "JS Тренировка", value: ModeType.JS_TRAINING },
  { label: "Python Тренировка", value: ModeType.PYTHON_TRAINING },
  { label: "Go Тренировка", value: ModeType.GO_TRAINING },
];

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

function HistoryFilter({ isOpen, onClose }: IProps) {
  if (!isOpen) return null;

  const typeFilter = chatGpt.history.typeFilter$.get();
  const dateFromFilter = chatGpt.history.dateFromFilter$.get();
  const dateToFilter = chatGpt.history.dateToFilter$.get();

  const handleApplyFilters = async () => {
    await chatGpt.history.applyFilters();
    onClose();
  };

  const handleClearFilters = async () => {
    chatGpt.history.clearAllFilters();
    await chatGpt.history.applyFilters();
    onClose();
  };

  return (
    <Group className={classes.filterContainer}>
      <Header>Фильтры истории</Header>
      
      <FormItem htmlFor="type-filter" top="Тип диалога">
        <Select
          id="type-filter"
          value={typeFilter || ""}
          onChange={(e) => chatGpt.history.setTypeFilter(e.target.value || null)}
          options={typeOptions}
        />
      </FormItem>

      <FormItem htmlFor="date-from-filter" top="С даты">
        <Input
          id="date-from-filter"
          type="date"
          value={dateFromFilter || ""}
          onChange={(e) => 
            chatGpt.history.setDateFromFilter(
              e.target.value || null
            )
          }
        />
      </FormItem>

      <FormItem htmlFor="date-to-filter" top="По дату">
        <Input
          id="date-to-filter"
          type="date"
          value={dateToFilter || ""}
          onChange={(e) => 
            chatGpt.history.setDateToFilter(
              e.target.value || null
            )
          }
        />
      </FormItem>

      <ButtonGroup className={classes.buttonGroup}>
        <Button
          size="l"
          appearance="positive"
          onClick={handleApplyFilters}
          disabled={chatGpt.history.getHistory$.loading.get()}
        >
          Применить фильтры
        </Button>
        <Button
          size="l" 
          appearance="neutral"
          mode="outline"
          onClick={handleClearFilters}
          disabled={chatGpt.history.getHistory$.loading.get()}
        >
          Сбросить
        </Button>
        <Button
          size="l"
          appearance="neutral"
          mode="tertiary"
          onClick={onClose}
        >
          Отмена
        </Button>
      </ButtonGroup>
    </Group>
  );
}

export default HistoryFilter;