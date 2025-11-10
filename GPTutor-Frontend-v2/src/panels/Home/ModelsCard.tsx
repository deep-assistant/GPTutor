import { FC } from "react";
import {
  ContentCard,
  DisplayTitle,
  Div,
  Group,
  Headline,
  Link,
  useAdaptivityWithJSMediaQueries,
} from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { Icon16LinkOutline } from "@vkontakte/icons";
import { DEFAULT_VIEW_PANELS } from "../../routes";

export const ModelsCard: FC = () => {
  const navigator = useRouteNavigator();
  const { isDesktop } = useAdaptivityWithJSMediaQueries();

  const handleModelsClick = () => {
    navigator.push(`/${DEFAULT_VIEW_PANELS.MODELS}`);
  };

  return (
    <Group>
      <Div className="forceCardStyle">
        <ContentCard
          mode="outline"
          onClick={handleModelsClick}
          src={
            isDesktop
              ? "https://storage.yandexcloud.net/giga-router/Desktop.webp"
              : "https://storage.yandexcloud.net/giga-router/Mobile.webp"
          }
          title={<DisplayTitle>Одно API для всех моделей!</DisplayTitle>}
          description={
            <Headline
              weight="3"
              style={{ color: "var(--vkui--color_text_secondary)" }}
            >
              Доступ ко всем основным моделям осуществляется через единый
              интерфейс. OpenAI SDK работает "из коробки".
            </Headline>
          }
          caption={
            <Link onClick={handleModelsClick} after={<Icon16LinkOutline />}>
              Посмотреть модели
            </Link>
          }
          maxHeight={200}
        />
      </Div>
    </Group>
  );
};

