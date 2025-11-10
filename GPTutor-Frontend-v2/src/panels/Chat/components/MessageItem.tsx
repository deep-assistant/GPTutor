import React, { useMemo, useState } from "react";
import { Avatar, Button, Skeleton, Spinner, Text } from "@vkontakte/vkui";
import {
  Icon16ArrowDownOutline,
  Icon16ArrowUpOutline,
  Icon24MoneyCircleOutline,
  Icon28MessageOutline,
  Icon28MoneyCircleOutline,
  Icon28UserCircleOutline,
} from "@vkontakte/icons";
import { MessageItemProps } from "../types";
import Markdown from "../../../services/Markdown";
import { useCodeCopyButtons } from "../../../hooks";
import { FileDisplay } from "./FileDisplay";
import { CitationLink } from "../../../components/CitationLink";
import {
  formatTextWithCitations,
  getDomainFromUrl,
} from "../../../utils/citationFormatter";
import { observer } from "mobx-react-lite";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { DEFAULT_VIEW_PANELS } from "../../../routes.ts";
import { CopyButton } from "../../../components";
import bridge from "@vkontakte/vk-bridge";
import { filesApi } from "../../../api";

const markdown = new Markdown();

export const MessageItem: React.FC<MessageItemProps> = observer(
  ({ message, userViewModel, getUserName }) => {
    const containerRef = useCodeCopyButtons(message.isTyping);
    const routeNavigator = useRouteNavigator();

    // Состояние загрузки изображений: imageIndex -> uploading
    const [uploadingImages, setUploadingImages] = useState<
      Record<number, boolean>
    >({});

    // Проверяем, это ошибка недостаточного баланса
    const isInsufficientBalance = message.content.includes(
      "Недостаточно средств на балансе"
    );

    // Проверка, является ли URL base64
    const isBase64Image = (url: string): boolean => {
      return url.startsWith("data:image/");
    };

    // Функция для конвертации base64 в File
    const base64ToFile = (base64String: string, fileName: string): File => {
      // Извлекаем mime type и данные из base64
      const arr = base64String.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], fileName, { type: mime });
    };

    // Функция для загрузки base64 изображения на сервер и получения URL
    const uploadImageToServer = async (
      base64Image: string,
      imageIndex: number
    ): Promise<string | null> => {
      try {
        setUploadingImages((prev) => ({
          ...prev,
          [imageIndex]: true,
        }));

        const mimeMatch = base64Image.match(/data:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/png";
        const extension = mime.split("/")[1] || "png";
        const fileName = `generated_image_${Date.now()}.${extension}`;

        const file = base64ToFile(base64Image, fileName);

        const uploadResult = await filesApi.uploadFile(file);
        const serverUrl = uploadResult.file.url;

        message.updateGeneratedImageUrl(imageIndex, serverUrl);

        setUploadingImages((prev) => ({
          ...prev,
          [imageIndex]: false,
        }));

        return serverUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        setUploadingImages((prev) => ({
          ...prev,
          [imageIndex]: false,
        }));

        // Показываем ошибку через bridge
        bridge.send("VKWebAppTapticNotificationOccurred", { type: "error" });
        return null;
      }
    };

    // Функция для показа изображения (загружает на сервер если нужно)
    const handleImageClick = async (imageUrl: string, imageIndex: number) => {
      // Если сейчас загружается, ничего не делаем
      if (uploadingImages[imageIndex]) {
        return;
      }

      // Если это не base64 (уже серверная ссылка), показываем сразу
      if (!isBase64Image(imageUrl)) {
        bridge
          .send("VKWebAppShowImages", {
            images: [imageUrl],
          })
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.log(error);
          });
        return;
      }

      // Это base64 - загружаем на сервер и показываем
      const serverUrl = await uploadImageToServer(imageUrl, imageIndex);
      if (serverUrl) {
        bridge
          .send("VKWebAppShowImages", {
            images: [serverUrl],
          })
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };

    // Форматируем контент с цитированиями
    const formattedContent = useMemo(() => {
      const renderedMarkdown = markdown.render(message.content);

      if (message.citations && message.citations.length > 0) {
        console.log("Formatting content with citations:", {
          citationsCount: message.citations.length,
          citations: message.citations,
          contentLength: message.content.length,
        });
        const formatted = formatTextWithCitations(
          renderedMarkdown,
          message.citations
        );
        console.log("Formatted content preview:", formatted.substring(0, 500));
        return formatted;
      }

      return renderedMarkdown;
    }, [message.content, message.citations]);

    // Обработчик перехода на профиль

    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "2px",
          paddingTop: "2px",
          marginTop: "2px",
          marginBottom: "2px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            opacity: 0.6,
            zIndex: 1,
          }}
        >
          <CopyButton
            textToCopy={message.content}
            disabled={message.isStreaming}
            style={{
              cursor: message.isStreaming ? "not-allowed" : "pointer",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            paddingRight: "32px",
          }}
        >
          <div
            style={{
              position: "relative",
              top: "6px",
              marginRight: "12px",
            }}
          >
            <Avatar
              size={32}
              src={
                message.isUser && userViewModel.user?.photo_200
                  ? userViewModel.user.photo_200
                  : message.isAssistant
                  ? "https://storage.yandexcloud.net/giga-router/aphex-twin.png"
                  : undefined
              }
              fallbackIcon={
                message.isAssistant ? (
                  <Icon28MessageOutline />
                ) : (
                  <Icon28UserCircleOutline />
                )
              }
              style={{
                backgroundColor: message.isAssistant
                  ? "var(--vkui--color_icon_secondary)"
                  : "var(--vkui--color_accent_blue)",
              }}
            />
          </div>

          <div style={{ display: "grid", width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Text
                weight="3"
                style={{
                  position: "relative",
                  top: "6px",
                  fontSize: "15px",
                }}
              >
                {message.isAssistant ? "Giga Router" : getUserName()}
              </Text>
            </div>

            <div
              style={{
                marginBottom: "4px",
              }}
            >
              {message.isTyping ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: 14,
                  }}
                >
                  <Skeleton width="90%" height={16} />
                  <Skeleton width="75%" height={16} />
                  <Skeleton width="60%" height={16} />
                </div>
              ) : (
                <>
                  {/* Отображение прикрепленных файлов */}
                  {message.attachedFilesList &&
                    message.attachedFilesList.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "14px",
                        }}
                      >
                        {message.attachedFilesList.map((file) => (
                          <FileDisplay
                            key={file.id}
                            file={file}
                            showRemoveButton={false}
                          />
                        ))}
                      </div>
                    )}

                  {/* Отображение сгенерированных изображений */}
                  {message.generatedImages &&
                    message.generatedImages.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          marginTop: "14px",
                        }}
                      >
                        {message.generatedImages.map((image, index) => {
                          const isUploading = uploadingImages[index];
                          return (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                borderRadius: "8px",
                                overflow: "hidden",
                                maxWidth: "100%",
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  maxWidth: "512px",
                                }}
                              >
                                <img
                                  onClick={() => {
                                    handleImageClick(
                                      image.image_url.url,
                                      index
                                    );
                                  }}
                                  src={image.image_url.url}
                                  alt={`Generated image ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    display: "block",
                                    borderRadius: "8px",
                                    cursor: isUploading ? "wait" : "pointer",
                                    opacity: isUploading ? 0.7 : 1,
                                    transition: "opacity 0.2s ease",
                                  }}
                                  loading="lazy"
                                />

                                {/* Индикатор загрузки */}
                                {isUploading && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "50%",
                                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backdropFilter: "blur(4px)",
                                    }}
                                  >
                                    <Spinner
                                      size="m"
                                      style={{ color: "#fff" }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Блок reasoning если есть */}
                  {message.reasoning && (
                    <div
                      style={{
                        marginTop: "20px",
                        marginBottom: "12px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "var(--vkui--color_background_secondary)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--vkui--color_accent_blue)",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        🧠 Reasoning
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "var(--vkui--color_text_secondary)",
                          fontStyle: "italic",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.reasoning}
                      </div>
                    </div>
                  )}

                  <div
                    ref={containerRef}
                    className="code-block"
                    style={{
                      fontSize: "15px",
                      lineHeight: "20px",
                      color: "var(--vkui--color_text_primary)",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formattedContent,
                    }}
                  />

                  {/* Предупреждение о недостаточном балансе */}
                  {isInsufficientBalance && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                        border: "2px solid #ffc107",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#856404",
                          fontWeight: 600,
                          fontSize: "15px",
                        }}
                      >
                        <Icon28MoneyCircleOutline width={24} height={24} />
                        <span>Недостаточно средств</span>
                      </div>
                      <Text
                        style={{
                          color: "#856404",
                          fontSize: "14px",
                          lineHeight: "20px",
                        }}
                      >
                        Для продолжения работы необходимо пополнить баланс.
                        Перейдите в профиль, чтобы пополнить счет.
                      </Text>
                      <Button
                        mode="primary"
                        size="m"
                        onClick={() => {
                          routeNavigator.push(
                            `/${DEFAULT_VIEW_PANELS.PROFILE}`
                          );
                        }}
                        before={
                          <Icon28MoneyCircleOutline width={20} height={20} />
                        }
                        style={{
                          background: "#ffc107",
                          color: "#856404",
                          fontWeight: 600,
                        }}
                      >
                        Пополнить баланс
                      </Button>
                    </div>
                  )}

                  {/* Список цитирований */}
                  {message.citations && message.citations.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      {message.citations.map((url, index) => {
                        const domain = getDomainFromUrl(url);
                        return (
                          <CitationLink key={index} url={url} domain={domain} />
                        );
                      })}
                    </div>
                  )}

                  {message.isAssistant && message.usage && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: "var(--vkui--color_background_secondary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "12px",
                        fontSize: "12px",
                        color: "var(--vkui--color_text_secondary)",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon16ArrowDownOutline />
                        {message.usage.promptTokens} In
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon16ArrowUpOutline />
                        {message.usage.completionTokens} Out
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Icon24MoneyCircleOutline width={16} height={16} />
                        {message.usage.cost.toFixed(4)} ₽
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
