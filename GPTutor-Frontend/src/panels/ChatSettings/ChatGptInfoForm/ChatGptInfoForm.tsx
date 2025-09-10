import React, { memo } from "react";

import {
  Div,
  Group,
  Title,
  Text,
  Spacing,
  Card,
} from "@vkontakte/vkui";

import { AppDiv } from "$/components/AppDiv";

function ChatGptInfoForm() {
  return (
    <Group
      mode="plain"
      header={
        <AppDiv>
          <Title level="3" Component="h3">
            Что такое ChatGPT
          </Title>
        </AppDiv>
      }
      description="Информация о ChatGPT и возможностях искусственного интеллекта"
    >
      <Div>
        <Card mode="shadow">
          <Div>
            <Text weight="2">ChatGPT</Text>
            <Spacing size={8} />
            <Text>
              ChatGPT (Chat Generative Pre-trained Transformer) — это продвинутая языковая модель искусственного интеллекта, разработанная компанией OpenAI. Эта модель способна понимать и генерировать человекоподобные текстовые ответы на широкий спектр запросов и вопросов.
            </Text>
          </Div>
        </Card>

        <Spacing size={16} />

        <Card mode="shadow">
          <Div>
            <Text weight="2">Возможности</Text>
            <Spacing size={8} />
            <Text>
              • Отвечает на вопросы по различным темам{"\n"}
              • Помогает с написанием текстов и программного кода{"\n"}
              • Решает математические и логические задачи{"\n"}
              • Переводит тексты между языками{"\n"}
              • Объясняет сложные концепции простым языком{"\n"}
              • Помогает с обучением и образованием
            </Text>
          </Div>
        </Card>

        <Spacing size={16} />

        <Card mode="shadow">
          <Div>
            <Text weight="2">Как использовать</Text>
            <Spacing size={8} />
            <Text>
              1. Задавайте конкретные и четкие вопросы{"\n"}
              2. Используйте системные сообщения для настройки поведения{"\n"}
              3. Разбивайте сложные задачи на более простые{"\n"}
              4. Экспериментируйте с различными формулировками{"\n"}
              5. Проверяйте важную информацию из дополнительных источников
            </Text>
          </Div>
        </Card>

        <Spacing size={16} />

        <Card mode="shadow">
          <Div>
            <Text weight="2">Ограничения</Text>
            <Spacing size={8} />
            <Text>
              • Знания ограничены датой обучения{"\n"}
              • Может содержать неточности в фактической информации{"\n"}
              • Не имеет доступа к интернету в реальном времени{"\n"}
              • Не может выполнять действия в реальном мире{"\n"}
              • Может генерировать правдоподобную, но неверную информацию
            </Text>
          </Div>
        </Card>
      </Div>
    </Group>
  );
}

export default memo(ChatGptInfoForm);