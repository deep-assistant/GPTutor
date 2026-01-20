import React, { useEffect } from "react";
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  SimpleCell,
  Button,
  Placeholder,
  Badge,
  IconButton,
} from "@vkontakte/vkui";
import { useNavigationContext } from "$/NavigationContext";
import { topicSuggestions, SuggestionStatus, TopicType } from "$/entity/topicSuggestion";
import { Icon28AddOutline, Icon28DeleteOutline } from "@vkontakte/icons";
import { AppContainer } from "$/components/AppContainer";

interface IProps {
  id: string;
}

const getStatusColor = (status: SuggestionStatus) => {
  switch (status) {
    case SuggestionStatus.PENDING:
      return "secondary";
    case SuggestionStatus.APPROVED:
      return "positive";
    case SuggestionStatus.REJECTED:
      return "negative";
    default:
      return "secondary";
  }
};

const getStatusText = (status: SuggestionStatus) => {
  switch (status) {
    case SuggestionStatus.PENDING:
      return "На рассмотрении";
    case SuggestionStatus.APPROVED:
      return "Одобрено";
    case SuggestionStatus.REJECTED:
      return "Отклонено";
    default:
      return "Неизвестно";
  }
};

const getTypeText = (type: TopicType) => {
  switch (type) {
    case TopicType.LESSON:
      return "Урок";
    case TopicType.CONVERSATION_STARTER:
      return "Стартер разговора";
    case TopicType.ADDITIONAL_REQUEST:
      return "Дополнительный запрос";
    default:
      return "Неизвестно";
  }
};

function TopicSuggestions({ id }: IProps) {
  const { goBack, goToTopicSuggestionModal } = useNavigationContext();
  const suggestions = Array.from(topicSuggestions.suggestions$.get());

  useEffect(() => {
    topicSuggestions.init();
  }, []);

  const handleDelete = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      await topicSuggestions.deleteSuggestion(suggestion);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
        Мои предложения тем
      </PanelHeader>

      <AppContainer>
        <Group>
          <Button
            size="l"
            stretched
            before={<Icon28AddOutline />}
            onClick={goToTopicSuggestionModal}
          >
            Предложить новую тему
          </Button>
        </Group>

        {suggestions.length === 0 ? (
          <Group>
            <Placeholder
              icon={<Icon28AddOutline />}
              header="Нет предложений"
              action={
                <Button size="m" onClick={goToTopicSuggestionModal}>
                  Предложить тему
                </Button>
              }
            >
              Вы ещё не предложили ни одной темы. Предложите тему для уроков, стартеры разговоров или дополнительные запросы.
            </Placeholder>
          </Group>
        ) : (
          <Group>
            {suggestions.map((suggestion) => (
              <SimpleCell
                key={suggestion.id}
                subtitle={suggestion.description$.get()}
                indicator={
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge mode={getStatusColor(suggestion.status$.get())}>
                      {getStatusText(suggestion.status$.get())}
                    </Badge>
                    <IconButton
                      onClick={() => handleDelete(suggestion.id)}
                    >
                      <Icon28DeleteOutline />
                    </IconButton>
                  </div>
                }
                after={getTypeText(suggestion.type$.get())}
              >
                {suggestion.title$.get()}
              </SimpleCell>
            ))}
          </Group>
        )}
      </AppContainer>
    </Panel>
  );
}

export default TopicSuggestions;