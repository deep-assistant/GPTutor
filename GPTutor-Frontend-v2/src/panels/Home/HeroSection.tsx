import { FC } from "react";
import { DisplayTitle, Div, Group, Headline, Spacing } from "@vkontakte/vkui";

// const DEFAULT_MESSAGE = "Что ты умеешь?";

export const HeroSection: FC = () => {
  // const [message, setMessage] = useState("");
  // const routeNavigator = useRouteNavigator();

  // const handleSendMessage = () => {
  //   const textToSend = message.trim() || DEFAULT_MESSAGE;
  //
  //   // Отправляем сообщение
  //   chatViewModel.sendMessage(textToSend);
  //
  //   // Переходим в чат
  //   routeNavigator.push("/chat");
  // };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSendMessage();
  //   }
  // };

  return (
    <Group>
      <Div>
        <DisplayTitle level="1">
          Единый API интерфейс нейросетей <br /> в одном сервисе!
        </DisplayTitle>
        <Spacing size={8} />
        <Headline level="1" style={{ color: "#9c9c9c" }}>
          Без ВПН и зарубежных карт!
        </Headline>
        {/*<Spacing size={16} />*/}
        {/*<WriteBar*/}
        {/*  style={{*/}
        {/*    border: "1px solid var(--vkui--color_separator_primary)",*/}
        {/*    borderRadius: "var(--vkui--size_border_radius_paper--regular)",*/}
        {/*  }}*/}
        {/*  value={message}*/}
        {/*  onChange={(e) => setMessage(e.target.value)}*/}
        {/*  onKeyDown={handleKeyDown}*/}
        {/*  after={*/}
        {/*    <WriteBarIcon */}
        {/*      mode="send" */}
        {/*      onClick={handleSendMessage}*/}
        {/*    />*/}
        {/*  }*/}
        {/*  placeholder={DEFAULT_MESSAGE}*/}
        {/*/>*/}
      </Div>
    </Group>
  );
};
