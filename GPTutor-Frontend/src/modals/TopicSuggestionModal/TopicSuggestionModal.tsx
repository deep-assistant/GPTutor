import React, { useState } from "react";
import {
  Button,
  Div,
  FormItem,
  FormLayout,
  Input,
  ModalPage,
  ModalPageHeader,
  Select,
  Textarea,
} from "@vkontakte/vkui";
import { useNavigationContext } from "$/NavigationContext";
import { topicSuggestions, TopicType } from "$/entity/topicSuggestion";

interface IProps {
  id: string;
}

const topicTypeOptions = [
  { label: "Тема урока", value: TopicType.LESSON },
  { label: "Стартер разговора", value: TopicType.CONVERSATION_STARTER },
  { label: "Дополнительный запрос", value: TopicType.ADDITIONAL_REQUEST },
];

function TopicSuggestionModal({ id }: IProps) {
  const { goBack } = useNavigationContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TopicType>(TopicType.CONVERSATION_STARTER);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await topicSuggestions.createSuggestion({
        title: title.trim(),
        description: description.trim(),
        type,
      });
      
      setTitle("");
      setDescription("");
      setType(TopicType.CONVERSATION_STARTER);
      goBack();
    } catch (error) {
      console.error("Error creating topic suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <ModalPage
      id={id}
      header={
        <ModalPageHeader>
          Предложить тему
        </ModalPageHeader>
      }
    >
      <FormLayout>
        <FormItem top="Тип темы">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as TopicType)}
            options={topicTypeOptions}
          />
        </FormItem>

        <FormItem
          top="Название темы"
          status={title.trim().length === 0 ? "error" : "default"}
          bottom={title.trim().length === 0 ? "Обязательное поле" : ""}
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название темы"
          />
        </FormItem>

        <FormItem
          top="Описание"
          status={description.trim().length === 0 ? "error" : "default"}
          bottom={description.trim().length === 0 ? "Обязательное поле" : ""}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите, что должна включать эта тема"
            rows={4}
          />
        </FormItem>

        <Div>
          <Button
            size="l"
            stretched
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            loading={isLoading}
          >
            Предложить тему
          </Button>
        </Div>
      </FormLayout>
    </ModalPage>
  );
}

export default TopicSuggestionModal;