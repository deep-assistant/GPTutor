import { FC } from "react";
import {
  Button,
  Div,
  Flex,
  Group,
  SegmentedControl,
  Spacing,
  Title,
  useAdaptivityWithJSMediaQueries,
} from "@vkontakte/vkui";
import { Icon24BrainOutline, Icon28LinkOutline } from "@vkontakte/icons";

import {
  CodeExampleService,
  CodeExampleType,
} from "../../services/CodeExampleService";
import { getCodeStyles } from "../../utils/codeFormatter";
import { CopyButton } from "../../components";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { DEFAULT_VIEW_PANELS } from "../../routes.ts";

interface CodeExamplesSectionProps {
  apiKey: string;
  activeCodeExample: CodeExampleType;
  onCodeExampleChange: (type: CodeExampleType) => void;
}

export const CodeExamplesSection: FC<CodeExamplesSectionProps> = ({
  apiKey,
  activeCodeExample,
  onCodeExampleChange,
}) => {
  const codeHTML = CodeExampleService.getCodeHTML(activeCodeExample, apiKey);
  const rawCode = CodeExampleService.getRawCode(activeCodeExample, apiKey);
  const { isDesktop } = useAdaptivityWithJSMediaQueries();
  const navigator = useRouteNavigator();

  const handleModelsClick = () => {
    navigator.push(`/${DEFAULT_VIEW_PANELS.MODELS}`);
  };

  return (
    <Group>
      <Div>
        <Title level="3">Примеры использования</Title>
        <Spacing size={12} />
        <SegmentedControl
          value={activeCodeExample}
          onChange={(value) => onCodeExampleChange(value as CodeExampleType)}
          options={[
            {
              label: "Curl",
              value: "curl",
            },
            {
              label: "Python",
              value: "python",
            },
            {
              label: "JavaScript",
              value: "js",
            },
          ]}
        />
        <Spacing size={16} />
        <Flex style={{ flexWrap: "nowrap" }} wrap="nowrap" gap={6}>
          <div
            className="code-block"
            style={{
              width: "100%",
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{ __html: codeHTML }}
          />

          <CopyButton textToCopy={rawCode} size={24} />
        </Flex>

        <style>{getCodeStyles()}</style>

        <Spacing size={16} />

        <Flex
          align="center"
          gap={12}
          style={{ flexWrap: isDesktop ? "nowrap" : "wrap" }}
        >
          <Button
            size="m"
            mode="outline"
            after={<Icon24BrainOutline />}
            onClick={handleModelsClick}
            style={{ width: "100%" }}
          >
            Доступные модели
          </Button>
          <Button
            target="_blank"
            href="https://docs.giga-router.ru/"
            size="m"
            mode="outline"
            after={<Icon28LinkOutline />}
            style={{ width: "100%" }}
          >
            Документация
          </Button>
        </Flex>
      </Div>
    </Group>
  );
};
