import { FC, useEffect } from "react";
import {
  Button,
  Div,
  Group,
  NavIdProps,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Spacing,
  Spinner,
  Text,
  Title,
} from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { useModelsViewModel } from "../../viewModels/ModelsViewModel";
import { SearchSection } from "./SearchSection";
import { QuickSearchSection } from "./QuickSearchSection";
import { ModelsList } from "./ModelsList";
import { Icon28LinkOutline } from "@vkontakte/icons";

export interface ModelsProps extends NavIdProps {}

export const Models: FC<ModelsProps> = ({ id }) => {
  const navigator = useRouteNavigator();
  const {
    filteredModels,
    searchQuery,
    sortOrder,
    loading,
    handleSearchChange,
    handleQuickSearch,
    handleSortToggle,
    copyModelId,
    tryModel,
    loadModels,
  } = useModelsViewModel();

  const handleTryModel = (modelId: string) => {
    tryModel(modelId);
    navigator.push("/chat");
  };

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return (
    <Panel id={id}>
      <PanelHeader
        before={<PanelHeaderBack onClick={() => navigator.back()} />}
      >
        Модели
      </PanelHeader>

      {loading ? (
        <Group>
          <Div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <Spinner size="m" />
          </Div>
        </Group>
      ) : (
        <>
          <Group>
            <Div>
              <Title level="1">Доступные модели</Title>
              <Spacing size={8} />
              <Text style={{ color: "#9c9c9c" }}>
                Выберите подходящую модель для ваших задач. Все модели работают
                через единый API.
              </Text>
              <Spacing size={16} />
              <Button
                target="_blank"
                href="https://docs.giga-router.ru/"
                size="s"
                mode="outline"
                after={<Icon28LinkOutline width={18} height={18} />}
                style={{ width: "100%" }}
              >
                Документация
              </Button>
            </Div>
          </Group>

          <Group>
            <SearchSection
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              onSearchChange={handleSearchChange}
              onSortToggle={handleSortToggle}
            />

            <QuickSearchSection onQuickSearch={handleQuickSearch} />

            <ModelsList
              models={filteredModels}
              onCopyModelId={copyModelId}
              onTryModel={handleTryModel}
            />
          </Group>
        </>
      )}
    </Panel>
  );
};
