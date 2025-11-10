import { FC } from "react";
import { Button, Div, Flex, Group, Spacing, Title } from "@vkontakte/vkui";
import { Icon28RefreshOutline } from "@vkontakte/icons";
import { createCodeHTML } from "../../utils/codeFormatter";
import { CopyButton } from "../../components";

interface ApiKeySectionProps {
  apiKey: string;
  updatingToken: boolean;
  onUpdateToken: () => void;
}

export const ApiKeySection: FC<ApiKeySectionProps> = ({
  apiKey,
  updatingToken,
  onUpdateToken,
}) => {
  return (
    <Group>
      <Div>
        <Title level="3">API Ключ</Title>
        <Spacing size={12} />
        <Flex
          align="center"
          style={{ flexWrap: "nowrap" }}
          wrap="nowrap"
          gap={6}
        >
          <div
            style={{ width: "100%", fontWeight: 700 }}
            className="code-block"
            dangerouslySetInnerHTML={{
              __html: createCodeHTML(apiKey, "python"),
            }}
          />
          <CopyButton textToCopy={apiKey} size={24} />
        </Flex>
        <Spacing size={16} />
        <Button
          style={{ width: "100%" }}
          size="m"
          align="center"
          mode="outline"
          after={<Icon28RefreshOutline width={24} height={24} />}
          loading={updatingToken}
          onClick={onUpdateToken}
        >
          Перегенерировать
        </Button>
      </Div>
    </Group>
  );
};
