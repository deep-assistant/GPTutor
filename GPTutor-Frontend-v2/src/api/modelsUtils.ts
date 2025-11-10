import { ModelData, ProcessedModel } from "./modelsApi";

// Функция для форматирования цены в рублях за миллион токенов
export const formatPriceInRubles = (
  promptPrice: number,
  completionPrice: number
): string => {
  if (promptPrice === 0 && completionPrice === 0) {
    return "Бесплатно";
  }

  // Просто умножаем на миллион
  const promptPricePerMillion = promptPrice * 1000000;
  const completionPricePerMillion = completionPrice * 1000000;

  return `${promptPricePerMillion.toFixed(
    2
  )}₽ / ${completionPricePerMillion.toFixed(2)}₽`;
};

export const formatContextLength = (contextLength: number): string => {
  if (contextLength >= 1000000) {
    return `${(contextLength / 1000000).toFixed(1)}M context`;
  } else if (contextLength >= 1000) {
    return `${(contextLength / 1000).toFixed(0)}K context`;
  } else {
    return `${contextLength} context`;
  }
};

// Функция для форматирования модальностей
export const formatModalities = (modalities: string[]): string => {
  const modalityMap: { [key: string]: string } = {
    text: "Текст",
    image: "Изображения",
    audio: "Аудио",
    video: "Видео",
    file: "Файлы",
    function_calling: "Функции",
    json_mode: "JSON",
    vision: "Зрение",
    speech: "Речь",
    multimodal: "Мультимодальный",
  };

  return modalities
    .map((modality) => modalityMap[modality.toLowerCase()] || modality)
    .join(", ");
};

// Функция для обработки данных модели
export const processModelData = (model: ModelData): ProcessedModel => {
  // Извлекаем провайдера из имени (например, "Google: Gemini 2.5" -> "Google")
  const provider = model.name.split(":")[0] || "Unknown";

  // Форматируем цены в рублях за миллион токенов
  const promptPrice = model.pricing?.prompt || 0;
  const completionPrice = model.pricing?.completion || 0;
  const priceText = formatPriceInRubles(promptPrice, completionPrice);

  // Определяем, популярная ли модель (на основе известных моделей)
  const isPopular =
    model.name.toLowerCase().includes("gpt-4") ||
    model.name.toLowerCase().includes("gpt-5") ||
    model.name.toLowerCase().includes("claude") ||
    model.name.toLowerCase().includes("gemini-2.5");

  return {
    id: model.id,
    name: model.name,
    provider,
    description:
      model.description?.length > 100
        ? model.description.substring(0, 100) + "..."
        : model.description || "",
    price: priceText,
    contextLength: model.context_length || 0,
    inputModalities: model.architecture?.input_modalities || [],
    isPopular,
  };
};
