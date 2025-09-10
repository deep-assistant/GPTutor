import bridge from "@vkontakte/vk-bridge";

class ShareService {
  shareLink(url: string) {
    console.log(`{photo}{548334196}_{${url}}`);
    bridge
      .send("VKWebAppShowWallPostBox", {
        message:
          "Генерирую нейрокартинки в Stable Art!. https://vk.com/app51602327",
        attachments:
          "https://cdn2.stablediffusionapi.com/generations/46acd46f-004d-4c58-884f-ce4e9796cdf6-0.png",
      })
      .then((data) => {
        console.log(data);
      });
  }

  forwardMessage(messageContent: string, senderName: string) {
    const forwardText = `Сообщение от ${senderName}:\n\n${messageContent}\n\nПередано через GPTutor: https://vk.com/app51602327`;
    
    return bridge
      .send("VKWebAppShowWallPostBox", {
        message: forwardText,
      })
      .then((data) => {
        console.log("Message forwarded successfully:", data);
        return data;
      })
      .catch((error) => {
        console.error("Error forwarding message:", error);
        throw error;
      });
  }
}

export const shareService = new ShareService();
