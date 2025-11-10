import { FC } from "react";
import {
  Button,
  Card,
  EllipsisText,
  Flex,
  Spacing,
  Text,
  Title,
  useAdaptivityWithJSMediaQueries,
} from "@vkontakte/vkui";
import { Icon16Message } from "@vkontakte/icons";
import {
  formatContextLength,
  formatModalities,
  ProcessedModel,
} from "../../api";
import { ModelIconService } from "../../services/ModelIconService";
import { CopyButton } from "../../components";

interface ModelCardProps {
  model: ProcessedModel;
  onCopyModelId: (modelId: string) => void;
  onTryModel: (modelId: string) => void;
}

export const ModelCard: FC<ModelCardProps> = ({
  model,
  onCopyModelId,
  onTryModel,
}) => {
  const { isDesktop } = useAdaptivityWithJSMediaQueries();

  return (
    <Card mode="outline">
      <Flex
        direction={isDesktop ? "row" : "column"}
        gap="m"
        style={{ padding: "16px" }}
      >
        <Flex direction="row" gap="m" align="start" style={{ flex: 1 }}>
          <Flex
            direction="column"
            justify="space-between"
            gap="xs"
            style={{ flex: 1, minWidth: 0, height: "100%" }}
          >
            <Flex
              direction="row"
              align="center"
              style={{ flexWrap: "nowrap" }}
              gap={8}
            >
              <div style={ModelIconService.getIconContainerStyle()}>
                {ModelIconService.getModelIcon(model.name)}
              </div>
              <Flex
                style={{ width: "100%", flexWrap: "nowrap" }}
                direction="row"
                justify={isDesktop ? "start" : "space-between"}
                align="center"
                gap={4}
              >
                <Title level="3" style={{ margin: 0 }}>
                  <Spacing size={2} />

                  <EllipsisText maxWidth={isDesktop ? 500 : 200}>
                    {model.name}
                  </EllipsisText>
                </Title>
                <CopyButton
                  textToCopy={model.id}
                  onCopySuccess={() => onCopyModelId(model.id)}
                />
              </Flex>
            </Flex>

            <Text
              style={{
                color: "var(--vkui--color_text_secondary)",
                wordWrap: "break-word",
              }}
            >
              {formatContextLength(model.contextLength)} •{" "}
              {formatModalities(model.inputModalities)}
            </Text>
          </Flex>
        </Flex>

        {/* Price and Action Section */}

        <Flex
          direction={"column"}
          align={isDesktop ? "end" : "start"}
          justify={isDesktop ? "end" : "space-between"}
          gap="s"
          style={{ width: isDesktop ? "auto" : "100%" }}
        >
          {isDesktop ? (
            <Flex direction="column" align={isDesktop ? "end" : "start"}>
              <Text
                weight="2"
                style={{
                  fontSize: "16px",
                  color:
                    model.price === "Бесплатно"
                      ? "var(--vkui--color_text_positive)"
                      : "var(--vkui--color_text_primary)",
                }}
              >
                {model.price}
              </Text>
              {model.price !== "Бесплатно" && (
                <Text
                  style={{
                    color: "var(--vkui--color_text_secondary)",
                    fontSize: "11px",
                  }}
                >
                  за 1М токенов
                </Text>
              )}
            </Flex>
          ) : (
            <div></div>
          )}

          <Button
            style={{ width: "100%" }}
            size="s"
            mode="outline"
            onClick={() => onTryModel(model.id)}
            before={<Icon16Message />}
          >
            Попробовать
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
