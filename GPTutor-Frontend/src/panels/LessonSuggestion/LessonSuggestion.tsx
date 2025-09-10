import React, { useState, useEffect } from "react";
import {
  Button,
  Div,
  FormItem,
  FormLayout,
  Input,
  Panel,
  PanelHeaderBack,
  PanelHeaderSubmit,
  Select,
  Spacing,
  Textarea,
  Title,
} from "@vkontakte/vkui";
import {
  Icon24AddOutline,
  Icon28SchoolOutline,
} from "@vkontakte/icons";

import { AppPanelHeader } from "$/components/AppPanelHeader";
import { AppContainer } from "$/components/AppContainer";
import { useNavigationContext } from "$/NavigationContext";
import { snackbarNotify } from "$/entity/notify";
import {
  createLessonSuggestion,
  getLessonSuggestions,
} from "$/api/lessonSuggestion";
import { LessonSuggestion as LessonSuggestionType } from "$/entity/lessonSuggestion/types";

import classes from "./LessonSuggestion.module.css";

interface IProps {
  id: string;
}

function LessonSuggestion({ id }: IProps) {
  const { goBack } = useNavigationContext();
  const [suggestions, setSuggestions] = useState<LessonSuggestionType[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    lessonName: "",
    description: "",
    category: "",
    content: "",
  });

  const categories = [
    { label: "JavaScript", value: "javascript" },
    { label: "HTML/CSS", value: "html-css" },
    { label: "React", value: "react" },
    { label: "Git", value: "git" },
    { label: "Python", value: "python" },
    { label: "Другое", value: "other" },
  ];

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      const data = await getLessonSuggestions();
      setSuggestions(data);
    } catch (error) {
      snackbarNotify.notify({
        type: "error",
        message: "Ошибка при загрузке предложений",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.lessonName.trim() || !formData.description.trim()) {
      snackbarNotify.notify({
        type: "error",
        message: "Заполните обязательные поля",
      });
      return;
    }

    try {
      setIsLoading(true);
      await createLessonSuggestion(formData);
      setFormData({
        lessonName: "",
        description: "",
        category: "",
        content: "",
      });
      setIsCreating(false);
      await loadSuggestions();
      snackbarNotify.notify({
        type: "success",
        message: "Предложение урока отправлено!",
      });
    } catch (error) {
      snackbarNotify.notify({
        type: "error",
        message: "Ошибка при отправке предложения",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "На рассмотрении";
      case "APPROVED":
        return "Одобрено";
      case "REJECTED":
        return "Отклонено";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return classes.statusPending;
      case "APPROVED":
        return classes.statusApproved;
      case "REJECTED":
        return classes.statusRejected;
      default:
        return classes.statusPending;
    }
  };

  return (
    <Panel id={id}>
      <AppContainer
        withoutTabbar
        headerChildren={
          <AppPanelHeader
            before={<PanelHeaderBack onClick={goBack} />}
            after={
              isCreating ? (
                <PanelHeaderSubmit onClick={handleSubmit} disabled={isLoading} />
              ) : null
            }
          >
            Предложить урок
          </AppPanelHeader>
        }
      >
        <div className={classes.container}>
          <Div>
            <Title Component="h1" className={classes.title}>
              Предложите урок{" "}
              <Icon28SchoolOutline
                width={32}
                height={32}
                className={classes.magicIcon}
              />
            </Title>
            <Spacing size={16} />

            {!isCreating ? (
              <>
                <Button
                  style={{ width: "100%" }}
                  size="l"
                  before={<Icon24AddOutline />}
                  onClick={() => setIsCreating(true)}
                >
                  Предложить новый урок
                </Button>
                <Spacing size={24} />

                <Title level="2">Ваши предложения</Title>
                <Spacing size={16} />

                {isLoading ? (
                  <div>Загрузка...</div>
                ) : suggestions.length === 0 ? (
                  <div>У вас пока нет предложений уроков</div>
                ) : (
                  <div className={classes.listContainer}>
                    {suggestions.map((suggestion) => (
                      <div key={suggestion.id} className={classes.suggestionCard}>
                        <div className={classes.suggestionTitle}>
                          {suggestion.lessonName}
                        </div>
                        <div className={classes.suggestionMeta}>
                          <span>{suggestion.category}</span>
                          <span
                            className={`${classes.statusBadge} ${getStatusClass(
                              suggestion.status
                            )}`}
                          >
                            {getStatusText(suggestion.status)}
                          </span>
                        </div>
                        <div>{suggestion.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <FormLayout>
                <FormItem top="Название урока *">
                  <Input
                    value={formData.lessonName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lessonName: e.target.value,
                      }))
                    }
                    placeholder="Например: Промисы в JavaScript"
                  />
                </FormItem>

                <FormItem top="Категория">
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Выберите категорию"
                    options={categories}
                  />
                </FormItem>

                <FormItem top="Описание урока *">
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Опишите, что должно быть в уроке, какие темы затронуть"
                    rows={3}
                  />
                </FormItem>

                <FormItem top="Содержание урока (необязательно)">
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Детальное описание урока, примеры вопросов для ChatGPT"
                    rows={5}
                  />
                </FormItem>

                <Div>
                  <Button
                    size="l"
                    style={{ width: "100%" }}
                    onClick={() => setIsCreating(false)}
                    mode="secondary"
                  >
                    Отмена
                  </Button>
                </Div>
              </FormLayout>
            )}
          </Div>
        </div>
      </AppContainer>
    </Panel>
  );
}

export default LessonSuggestion;