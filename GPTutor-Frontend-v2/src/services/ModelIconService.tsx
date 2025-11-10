import React from "react";
import {
  GeminiIcon,
  QwenIcon,
  DeepSeekIcon,
  GrokIcon,
  OpenAIIcon,
  MistralIcon,
  ClaudeIcon,
  PerplexityIcon,
} from "../components/icons";

export class ModelIconService {
  static getModelIconSmall(modelName: string): React.ReactNode {
    const name = modelName.toLowerCase();

    if (name.includes("gemini")) {
      return <GeminiIcon size={16} />;
    } else if (name.includes("qwen")) {
      return <QwenIcon size={16} />;
    } else if (name.includes("deepseek")) {
      return <DeepSeekIcon size={20} />;
    } else if (name.includes("grok")) {
      return <GrokIcon size={16} />;
    } else if (name.includes("gpt") || name.includes("openai")) {
      return <OpenAIIcon size={16} />;
    } else if (name.includes("mistral")) {
      return <MistralIcon size={16} />;
    } else if (name.includes("perplexity")) {
      return <PerplexityIcon size={16} />;
    } else if (name.includes("anthropic")) {
      return <ClaudeIcon size={16} />;
    }

    return null;
  }

  static getModelIcon(modelName: string): React.ReactNode {
    const name = modelName.toLowerCase();

    if (name.includes("google")) {
      return <GeminiIcon size={16} />;
    } else if (name.includes("qwen")) {
      return <QwenIcon size={16} />;
    } else if (name.includes("deepseek")) {
      return <DeepSeekIcon size={20} />;
    } else if (name.includes("grok")) {
      return <GrokIcon size={16} />;
    } else if (name.includes("gpt") || name.includes("openai")) {
      return <OpenAIIcon size={16} />;
    } else if (name.includes("mistral")) {
      return <MistralIcon size={16} />;
    } else if (name.includes("anthropic")) {
      return <ClaudeIcon size={16} />;
    } else if (name.includes("perplexity")) {
      return <PerplexityIcon size={16} />;
    }

    return null;
  }

  static getIconContainerStyle() {
    return {
      width: "20px",
      height: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      background: "#f0f2f5",
      padding: "2px",
    };
  }
}
