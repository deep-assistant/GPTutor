import { makeAutoObservable } from "mobx";
import { FileInfo } from "../../../api";

/**
 * Тип роли сообщения в чате
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * Информация об использовании токенов и стоимости запроса
 */
export interface MessageUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

/**
 * Вложение изображения
 */
export interface ImageAttachment {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
}

/**
 * Вложение файла
 */
export interface FileAttachment {
  type: "file";
  file: {
    filename: string;
    file_data: string; // URL или base64
    mimeType?: string;
  };
}

/**
 * Цитирование URL
 */
export interface UrlCitation {
  type: "url_citation";
  url_citation: {
    start_index: number;
    end_index: number;
    title: string;
    url: string;
  };
}

/**
 * Модель сообщения в чате
 */
export class MessageModel {
  id: string;
  role: MessageRole;
  content: string;
  reasoning: string = ""; // Рассуждения модели (для моделей с reasoning)
  citations: string[] = []; // Список URL цитирований
  annotations: UrlCitation[] = []; // Аннотации с деталями цитирований
  isTyping: boolean;
  isStreaming: boolean = false; // Идет генерация ответа
  timestamp: Date;
  usage: MessageUsage | null = null;
  images?: ImageAttachment[]; // Изображения от пользователя (входящие)
  files?: FileAttachment[];
  attachedFilesList?: FileInfo[]; // Список прикрепленных файлов для отображения
  generatedImages: ImageAttachment[] = []; // Изображения сгенерированные моделью (исходящие)

  constructor(
    id: string,
    role: MessageRole,
    content: string = "",
    isTyping: boolean = false,
    attachedFiles?: FileInfo[]
  ) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.isTyping = isTyping;
    this.timestamp = new Date();
    this.attachedFilesList = attachedFiles;

    // Преобразуем attachedFiles в images и files для API
    if (attachedFiles && attachedFiles.length > 0) {
      this.images = [];
      this.files = [];

      for (const file of attachedFiles) {
        if (file.type.startsWith('image/')) {
          this.images.push({
            type: "image_url",
            image_url: {
              url: file.url,
              detail: "high"
            }
          });
        } else {
          this.files.push({
            type: "file",
            file: {
              filename: file.name,
              file_data: file.url,
              mimeType: file.type
            }
          });
        }
      }
    }

    makeAutoObservable(this);
  }

  /**
   * Установить полное содержимое сообщения
   */
  setContent(content: string) {
    this.content = content;
  }

  /**
   * Добавить текст к существующему содержимому (для потоковой передачи)
   */
  appendContent(content: string) {
    this.content += content;
  }

  /**
   * Добавить текст к reasoning (для потоковой передачи)
   */
  appendReasoning(reasoning: string) {
    this.reasoning += reasoning;
  }

  /**
   * Установить reasoning
   */
  setReasoning(reasoning: string) {
    this.reasoning = reasoning;
  }

  /**
   * Установить citations
   */
  setCitations(citations: string[]) {
    this.citations = citations;
  }

  /**
   * Установить annotations
   */
  setAnnotations(annotations: UrlCitation[]) {
    this.annotations = annotations;
  }

  /**
   * Установить статус печатания
   */
  setIsTyping(isTyping: boolean) {
    this.isTyping = isTyping;
  }

  /**
   * Установить статус потоковой загрузки
   */
  setIsStreaming(isStreaming: boolean) {
    this.isStreaming = isStreaming;
  }

  /**
   * Установить информацию об использовании токенов
   */
  setUsage(usage: MessageUsage) {
    this.usage = usage;
  }

  /**
   * Добавить сгенерированные изображения (от модели)
   */
  addGeneratedImages(images: ImageAttachment[]) {
    this.generatedImages.push(...images);
  }

  /**
   * Установить сгенерированные изображения (от модели)
   */
  setGeneratedImages(images: ImageAttachment[]) {
    this.generatedImages = images;
  }

  /**
   * Обновить URL конкретного сгенерированного изображения (для замены base64 на серверный URL)
   */
  updateGeneratedImageUrl(imageIndex: number, newUrl: string) {
    if (this.generatedImages[imageIndex]) {
      this.generatedImages[imageIndex].image_url.url = newUrl;
    }
  }

  /**
   * Проверка, является ли сообщение пользовательским
   */
  get isUser() {
    return this.role === "user";
  }

  /**
   * Проверка, является ли сообщение от ассистента
   */
  get isAssistant() {
    return this.role === "assistant";
  }

  /**
   * Проверка, есть ли сгенерированные изображения
   */
  get hasGeneratedImages() {
    return this.generatedImages.length > 0;
  }
}

