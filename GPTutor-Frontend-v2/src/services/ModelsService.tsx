import React from "react";
import { Snackbar, Button } from "@vkontakte/vkui";
import { Icon12Check, Icon12Cancel } from "@vkontakte/icons";
import { modelsApi, ProcessedModel, processModelData } from "../api";

export class ModelsService {
  static async fetchModels(): Promise<ProcessedModel[]> {
    try {
      const data = await modelsApi.getModels();

      if (data.success && data.data.models) {
        return data.data.models.map(processModelData);
      } else {
        throw new Error("Неожиданная структура ответа API");
      }
    } catch (error) {
      console.error("Error fetching Models:", error);
      throw new Error(
        error instanceof Error ? error.message : "Неизвестная ошибка"
      );
    }
  }

  static sortModelsByPrice(
    models: ProcessedModel[],
    order: "asc" | "desc"
  ): ProcessedModel[] {
    return [...models].sort((a, b) => {
      const getPriceValue = (price: string) => {
        if (price === "Бесплатно") return 0;
        const match = price.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
      };

      const priceA = getPriceValue(a.price);
      const priceB = getPriceValue(b.price);

      return order === "asc" ? priceA - priceB : priceB - priceA;
    });
  }

  static filterModels(
    models: ProcessedModel[],
    searchQuery: string,
    sortOrder: "asc" | "desc"
  ): ProcessedModel[] {
    let filtered = models;

    if (searchQuery.trim()) {
      filtered = models.filter((model) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return this.sortModelsByPrice(filtered, sortOrder);
  }

  static copyModelId(modelId: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = modelId;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);

        const successful = document.execCommand("copy");
        textArea.remove();

        resolve(successful);
      } catch (err) {
        console.error("Copy error:", err);
        resolve(false);
      }
    });
  }

  static createSuccessSnackbar(
    message: string,
    onClose: () => void
  ): React.ReactNode {
    return (
      <Snackbar
        onClose={onClose}
        before={<Icon12Check />}
        style={{ marginBottom: "60px" }}
      >
        {message}
      </Snackbar>
    );
  }

  static createErrorSnackbar(
    message: string,
    onClose: () => void
  ): React.ReactNode {
    return (
      <Snackbar
        onClose={onClose}
        before={<Icon12Cancel />}
        style={{ marginBottom: "60px" }}
      >
        {message}
      </Snackbar>
    );
  }

  static createTryModelSnackbar(
    modelId: string,
    onClose: () => void,
    onTryModel?: (modelId: string) => void
  ): React.ReactNode {
    return (
      <Snackbar
        onClose={onClose}
        before={<div>🚀</div>}
        style={{ marginBottom: "60px" }}
        action={
          onTryModel ? (
            <Button
              size="s"
              mode="primary"
              onClick={() => {
                onTryModel(modelId);
                onClose();
              }}
            >
              Попробовать
            </Button>
          ) : undefined
        }
      >
        Модель: {modelId}
      </Snackbar>
    );
  }
}


