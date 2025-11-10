import { FC } from "react";
import {
  Caption,
  SubnavigationBar,
  SubnavigationButton,
} from "@vkontakte/vkui";
import { ModelIconService } from "../../services/ModelIconService";

interface QuickSearchSectionProps {
  onQuickSearch: (query: string) => void;
}

interface QuickSearchButton {
  query: string;
  label: string;
  modelName: string;
}

export const QuickSearchSection: FC<QuickSearchSectionProps> = ({
  onQuickSearch,
}) => {
  const quickSearchButtons: QuickSearchButton[] = [
    { query: "gpt", label: "GPT", modelName: "gpt" },
    { query: "deepseek", label: "DeepSeek", modelName: "deepseek" },
    { query: "grok", label: "Grok", modelName: "grok" },
    { query: "gemini", label: "Gemini", modelName: "gemini" },
    { query: "mistral", label: "Mistral", modelName: "mistral" },
    { query: "qwen", label: "Qwen", modelName: "qwen" },
    { query: "perplexity", label: "Perplexity", modelName: "perplexity" },
    { query: "claude", label: "Claude", modelName: "anthropic" },
  ];

  return (
    <SubnavigationBar fixed={false} showArrows={true}>
      <SubnavigationButton
        mode="outline"
        size="l"
        textLevel="3"
        onClick={() => onQuickSearch("")}
      >
        <Caption level="1" weight="1">
          Все модели
        </Caption>
      </SubnavigationButton>
      {quickSearchButtons.map((button) => (
        <SubnavigationButton
          key={button.query}
          size="l"
          mode="outline"
          appearance="neutral"
          onClick={() => onQuickSearch(button.query)}
          before={
            <div style={ModelIconService.getIconContainerStyle()}>
              {ModelIconService.getModelIconSmall(button.modelName)}
            </div>
          }
        >
          {button.label}
        </SubnavigationButton>
      ))}
    </SubnavigationBar>
  );
};
