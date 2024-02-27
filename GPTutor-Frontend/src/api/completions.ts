import { EventSourceMessage, fetchEventSource } from "$/utility";
import { miniAppSystem } from "$/services/MiniAppSystem";

const BACKEND_HOST = env.REACT_APP_BACKEND_HOST;

export async function sendChatCompletions(
  body: any,
  onMessage: (content: string, isFirst: boolean) => void,
  onError: () => void,
  controller: AbortController
) {
  let isFirst = true;
  let isHasError = false;

  await fetchEventSource(`${BACKEND_HOST}conversation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + miniAppSystem.getAuthorization(),
    },
    body: JSON.stringify(body),
    signal: controller.signal,
    onmessage(event: EventSourceMessage) {
      if (event.data === "[DONE]") return;
      if (event.data.startsWith("[Error]")) {
        throw new Error(event.data);
      }

      const eventData = JSON.parse(event.data);
      const delta = eventData.choices[0].delta;

      if (!Object.keys(delta).length) return;

      if (!delta.content) return;
      onMessage(delta.content, isFirst);
      isFirst = false;
    },
    onerror(err) {
      if (!isHasError) {
        onError();
        isHasError = true;
      }
    },
  });

  return isHasError;
}
