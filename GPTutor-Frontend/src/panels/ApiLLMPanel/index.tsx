import * as React from "react";
import {
  Button,
  Card,
  CardGrid,
  Div,
  FormItem,
  FormLayoutGroup,
  Input,
  Textarea,
  Slider,
  Select,
  Checkbox,
  IconButton,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Spacing,
  Title,
  Caption,
  Headline,
  Text,
  Separator,
  Group,
  Header,
  SimpleCell,
  Switch,
  FixedLayout,
  Tabbar,
  TabbarItem,
} from "@vkontakte/vkui";
import { AppContainer } from "$/components/AppContainer";
import { useNavigationContext } from "$/NavigationContext";
import PanelTitle from "$/components/PanelTitle";
import { CardBlock } from "$/components/CardBlock";
import {
  Icon20CopyOutline,
  Icon28DocumentOutline,
  Icon24ReplayOutline,
  Icon28SettingsOutline,
  Icon24QuestionOutline,
  Icon24KeyOutline,
  Icon24BrainOutline,
  Icon20CheckCircleFillGreen,
  Icon24ErrorCircleFillRed,
  Icon24MoneyCircleOutline,
  Icon24AddCircleOutline,
  Icon24LightbulbOutline,
  Icon24InfoCircleOutline,
  Icon24DollarCircleOutline,
  Icon24PlayCircle,
} from "@vkontakte/icons";

import classes from "./ApiLLMPanel.module.css";
import TertiaryTitle from "$/components/TertiaryTitle";
import { AppDiv } from "$/components/AppDiv";

interface IProps {
  id: string;
}

interface OpenAIParams {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  userMessage: string;
  stream: boolean;
}

interface UserBalance {
  balance: number;
  currency: string;
}

interface PromptExample {
  title: string;
  systemPrompt: string;
  userMessage: string;
  description: string;
}

function ApiLLMPanel({ id }: IProps) {
  const { goBack } = useNavigationContext();
  const [activeTab, setActiveTab] = React.useState("settings");
  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState("");
  const [error, setError] = React.useState("");
  const [userBalance, setUserBalance] = React.useState<UserBalance>({
    balance: 15.5,
    currency: "USD",
  });
  const [estimatedCost, setEstimatedCost] = React.useState(0);

  const [params, setParams] = React.useState<OpenAIParams>({
    apiKey: "",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: "You are a helpful assistant.",
    userMessage: "",
    stream: false,
  });

  const models = [
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
    { label: "GPT-4", value: "gpt-4" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo-preview" },
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini" },
  ];

  const promptExamples: PromptExample[] = [
    {
      title: "Программист-помощник",
      description: "Помощь с написанием и отладкой кода",
      systemPrompt:
        "Ты опытный программист. Помогай писать чистый, эффективный код и объясняй сложные концепции простым языком.",
      userMessage: "Напиши функцию на Python для сортировки массива пузырьком",
    },
    {
      title: "Переводчик",
      description: "Профессиональный перевод текстов",
      systemPrompt:
        "Ты профессиональный переводчик. Переводи тексты точно, сохраняя смысл и стиль оригинала.",
      userMessage:
        "Переведи на английский: 'Привет, как дела? Надеюсь, у тебя все хорошо.'",
    },
    {
      title: "Аналитик данных",
      description: "Анализ и интерпретация данных",
      systemPrompt:
        "Ты эксперт по анализу данных. Помогай интерпретировать данные, находить закономерности и делать выводы.",
      userMessage: "Объясни, что такое корреляция и как её интерпретировать",
    },
    {
      title: "Творческий писатель",
      description: "Создание креативного контента",
      systemPrompt:
        "Ты творческий писатель с богатым воображением. Создавай интересные истории, стихи и креативный контент.",
      userMessage:
        "Напиши короткий рассказ о роботе, который учится быть человеком",
    },
  ];

  const modelPricing = {
    "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
    "gpt-4": { input: 0.03, output: 0.06 },
    "gpt-4-turbo-preview": { input: 0.01, output: 0.03 },
    "gpt-4o": { input: 0.005, output: 0.015 },
    "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  };

  const handleParamChange = (key: keyof OpenAIParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    if (
      key === "model" ||
      key === "maxTokens" ||
      key === "userMessage" ||
      key === "systemPrompt"
    ) {
      calculateEstimatedCost({ ...params, [key]: value });
    }
  };

  const calculateEstimatedCost = (currentParams: OpenAIParams) => {
    const pricing =
      modelPricing[currentParams.model as keyof typeof modelPricing];
    if (!pricing) return;

    // Примерная оценка токенов (1 токен ≈ 4 символа)
    const inputTokens = Math.ceil(
      (currentParams.systemPrompt.length + currentParams.userMessage.length) / 4
    );
    const outputTokens = currentParams.maxTokens;

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;

    setEstimatedCost(totalCost);
  };

  const applyPromptExample = (example: PromptExample) => {
    setParams((prev) => ({
      ...prev,
      systemPrompt: example.systemPrompt,
      userMessage: example.userMessage,
    }));
    calculateEstimatedCost({
      ...params,
      systemPrompt: example.systemPrompt,
      userMessage: example.userMessage,
    });
  };

  const handleTopUpBalance = () => {
    // Здесь будет логика пополнения баланса
    alert("Функция пополнения баланса будет реализована позже");
  };

  React.useEffect(() => {
    calculateEstimatedCost(params);
  }, [params.model, params.maxTokens, params.userMessage, params.systemPrompt]);

  const handleTestAPI = async () => {
    if (!params.apiKey.trim()) {
      setError("API ключ обязателен");
      return;
    }
    if (!params.userMessage.trim()) {
      setError("Сообщение пользователя обязательно");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const requestBody = {
        model: params.model,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userMessage },
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        top_p: params.topP,
        frequency_penalty: params.frequencyPenalty,
        presence_penalty: params.presencePenalty,
        stream: params.stream,
      };

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${params.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Ошибка API");
      }

      setResponse(data.choices[0].message.content);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const executeCode = (codeType: "python" | "javascript" | "curl") => {
    let code = "";
    switch (codeType) {
      case "python":
        code = generatePythonCode();
        break;
      case "javascript":
        code = generateJavaScriptCode();
        break;
      case "curl":
        code = generateCurlCode();
        break;
    }

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openai_example.${
      codeType === "curl" ? "sh" : codeType === "python" ? "py" : "js"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePythonCode = () => {
    return `import openai
import json

# Настройка API ключа
openai.api_key = "${params.apiKey || "YOUR_API_KEY"}"

# Параметры запроса
response = openai.ChatCompletion.create(
    model="${params.model}",
    messages=[
        {"role": "system", "content": "${params.systemPrompt}"},
        {"role": "user", "content": "${params.userMessage || "Ваше сообщение"}"}
    ],
    temperature=${params.temperature},
    max_tokens=${params.maxTokens},
    top_p=${params.topP},
    frequency_penalty=${params.frequencyPenalty},
    presence_penalty=${params.presencePenalty},
    stream=${params.stream ? "True" : "False"}
)

print(json.dumps(response, indent=2, ensure_ascii=False))`;
  };

  const generateJavaScriptCode = () => {
    return `const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: '${params.apiKey || "YOUR_API_KEY"}',
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: '${params.systemPrompt}' },
      { role: 'user', content: '${params.userMessage || "Ваше сообщение"}' }
    ],
    model: '${params.model}',
    temperature: ${params.temperature},
    max_tokens: ${params.maxTokens},
    top_p: ${params.topP},
    frequency_penalty: ${params.frequencyPenalty},
    presence_penalty: ${params.presencePenalty},
    stream: ${params.stream}
  });

  console.log(completion.choices[0].message.content);
}

main();`;
  };

  const generateCurlCode = () => {
    const requestBody = {
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userMessage || "Ваше сообщение" },
      ],
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
      stream: params.stream,
    };

    return `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${params.apiKey || "YOUR_API_KEY"}" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`;
  };

  return (
    <Panel id={id}>
      <AppContainer
        isSecondary
        withoutTabbar
        headerChildren={
          <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
            <PanelTitle title="OpenAI API" mobileTitle="OpenAI API" />
          </PanelHeader>
        }
        childrenWithHeight={(height) => (
          <div style={{ maxHeight: height, overflow: "auto" }}>
            <FixedLayout vertical="bottom">
              <Tabbar>
                <TabbarItem
                  onClick={() => setActiveTab("settings")}
                  selected={activeTab === "settings"}
                  text="Настройки"
                >
                  <Icon28SettingsOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setActiveTab("test")}
                  selected={activeTab === "test"}
                  text="Тест API"
                >
                  <Icon24ReplayOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setActiveTab("code")}
                  selected={activeTab === "code"}
                  text="Примеры кода"
                >
                  <Icon28DocumentOutline />
                </TabbarItem>
              </Tabbar>
            </FixedLayout>

            <Div style={{ paddingBottom: 70 }}>
              {activeTab === "settings" && (
                <Group>
                  <Header mode="secondary">Баланс пользователя</Header>
                  <Card mode="outline" className={classes.balanceCard}>
                    <Div>
                      <div className={classes.balanceHeader}>
                        <Icon24DollarCircleOutline />
                        <div>
                          <Title level="2" weight="2">
                            ${userBalance.balance.toFixed(2)}{" "}
                            {userBalance.currency}
                          </Title>
                          <Caption
                            level="1"
                            weight="3"
                            className={classes.balanceSubtitle}
                          >
                            Доступный баланс
                          </Caption>
                        </div>
                      </div>
                      <Spacing size={12} />
                      <div className={classes.balanceActions}>
                        <Button
                          size="m"
                          mode="primary"
                          onClick={handleTopUpBalance}
                          before={<Icon24AddCircleOutline />}
                          stretched
                        >
                          Пополнить баланс
                        </Button>
                        {estimatedCost > 0 && (
                          <div className={classes.costEstimate}>
                            <Icon24InfoCircleOutline />
                            <Text>
                              Примерная стоимость запроса: $
                              {estimatedCost.toFixed(6)}
                            </Text>
                          </div>
                        )}
                      </div>
                    </Div>
                  </Card>

                  <Spacing size={20} />

                  <Header mode="secondary">API Конфигурация</Header>
                  <FormLayoutGroup>
                    <FormItem top="API Ключ" required>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={params.apiKey}
                        onChange={(e) =>
                          handleParamChange("apiKey", e.target.value)
                        }
                        before={<Icon24KeyOutline />}
                      />
                    </FormItem>

                    <FormItem top="Модель">
                      <Select
                        value={params.model}
                        onChange={(e) =>
                          handleParamChange("model", e.target.value)
                        }
                        options={models}
                      />
                    </FormItem>
                  </FormLayoutGroup>

                  <Spacing size={16} />

                  <Header mode="secondary">Параметры генерации</Header>
                  <FormLayoutGroup>
                    <FormItem
                      top={`Temperature: ${params.temperature}`}
                      bottom="Контролирует случайность ответов (0.0 - 2.0)"
                    >
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={params.temperature}
                        onChange={(value) =>
                          handleParamChange("temperature", value)
                        }
                      />
                    </FormItem>

                    <FormItem
                      top={`Max Tokens: ${params.maxTokens}`}
                      bottom="Максимальное количество токенов в ответе"
                    >
                      <Slider
                        min={1}
                        max={4000}
                        step={50}
                        value={params.maxTokens}
                        onChange={(value) =>
                          handleParamChange("maxTokens", value)
                        }
                      />
                    </FormItem>

                    <FormItem
                      top={`Top P: ${params.topP}`}
                      bottom="Альтернатива temperature (0.0 - 1.0)"
                    >
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={params.topP}
                        onChange={(value) => handleParamChange("topP", value)}
                      />
                    </FormItem>

                    <FormItem
                      top={`Frequency Penalty: ${params.frequencyPenalty}`}
                      bottom="Штраф за повторение слов (-2.0 - 2.0)"
                    >
                      <Slider
                        min={-2}
                        max={2}
                        step={0.1}
                        value={params.frequencyPenalty}
                        onChange={(value) =>
                          handleParamChange("frequencyPenalty", value)
                        }
                      />
                    </FormItem>

                    <FormItem
                      top={`Presence Penalty: ${params.presencePenalty}`}
                      bottom="Штраф за повторение тем (-2.0 - 2.0)"
                    >
                      <Slider
                        min={-2}
                        max={2}
                        step={0.1}
                        value={params.presencePenalty}
                        onChange={(value) =>
                          handleParamChange("presencePenalty", value)
                        }
                      />
                    </FormItem>

                    <FormItem>
                      <Checkbox
                        checked={params.stream}
                        onChange={(e) =>
                          handleParamChange("stream", e.target.checked)
                        }
                      >
                        Потоковая передача ответа
                      </Checkbox>
                    </FormItem>
                  </FormLayoutGroup>

                  <Spacing size={16} />

                  <Header mode="secondary">Промпты</Header>
                  <FormLayoutGroup>
                    <FormItem top="Системный промпт">
                      <Textarea
                        placeholder="Опишите роль и поведение ассистента..."
                        value={params.systemPrompt}
                        onChange={(e) =>
                          handleParamChange("systemPrompt", e.target.value)
                        }
                        rows={3}
                      />
                    </FormItem>
                  </FormLayoutGroup>
                </Group>
              )}

              {activeTab === "test" && (
                <Group>
                  <Header mode="secondary">Готовые примеры</Header>
                  <div className={classes.examplesGrid}>
                    {promptExamples.map((example, index) => (
                      <Card
                        key={index}
                        mode="outline"
                        className={classes.exampleCard}
                      >
                        <Div>
                          <div className={classes.exampleHeader}>
                            <Icon24LightbulbOutline />
                            <Title level="3" weight="2">
                              {example.title}
                            </Title>
                          </div>
                          <Text className={classes.exampleDescription}>
                            {example.description}
                          </Text>
                          <Spacing size={12} />
                          <Button
                            size="s"
                            mode="secondary"
                            onClick={() => applyPromptExample(example)}
                            before={<Icon24PlayCircle />}
                            stretched
                          >
                            Применить пример
                          </Button>
                        </Div>
                      </Card>
                    ))}
                  </div>

                  <Spacing size={20} />

                  <Header mode="secondary">Тестирование API</Header>
                  <FormLayoutGroup>
                    <FormItem top="Сообщение пользователя" required>
                      <Textarea
                        placeholder="Введите ваш вопрос или запрос..."
                        value={params.userMessage}
                        onChange={(e) =>
                          handleParamChange("userMessage", e.target.value)
                        }
                        rows={4}
                      />
                    </FormItem>
                  </FormLayoutGroup>

                  <Spacing size={16} />

                  <Button
                    size="l"
                    stretched
                    onClick={handleTestAPI}
                    loading={isLoading}
                    disabled={!params.apiKey || !params.userMessage}
                    before={<Icon24ReplayOutline />}
                  >
                    Отправить запрос
                  </Button>

                  {error && (
                    <>
                      <Spacing size={16} />
                      <Card mode="outline" className={classes.errorCard}>
                        <Div>
                          <div className={classes.errorHeader}>
                            <Icon24ErrorCircleFillRed />
                            <Title level="3" weight="2">
                              Ошибка
                            </Title>
                          </div>
                          <Text>{error}</Text>
                        </Div>
                      </Card>
                    </>
                  )}

                  {response && (
                    <>
                      <Spacing size={16} />
                      <Card mode="outline">
                        <Div>
                          <div className={classes.responseHeader}>
                            <Icon20CheckCircleFillGreen />
                            <Title level="3" weight="2">
                              Ответ
                            </Title>
                            <IconButton
                              onClick={() => copyToClipboard(response)}
                              className={classes.copyIcon}
                            >
                              <Icon20CopyOutline />
                            </IconButton>
                          </div>
                          <Text className={classes.responseText}>
                            {response}
                          </Text>
                        </Div>
                      </Card>
                    </>
                  )}
                </Group>
              )}

              {activeTab === "code" && (
                <Group>
                  <Header mode="secondary">Примеры кода</Header>

                  <Card mode="outline">
                    <Div>
                      <div className={classes.codeHeader}>
                        <Title level="3" weight="2">
                          Python
                        </Title>
                        <div className={classes.codeActions}>
                          <IconButton
                            onClick={() => executeCode("python")}
                            className={classes.downloadIcon}
                          >
                            <Icon24PlayCircle />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              copyToClipboard(generatePythonCode())
                            }
                            className={classes.copyIcon}
                          >
                            <Icon20CopyOutline />
                          </IconButton>
                        </div>
                      </div>
                      <pre className={classes.codeBlock}>
                        <code>{generatePythonCode()}</code>
                      </pre>
                    </Div>
                  </Card>

                  <Spacing size={16} />

                  <Card mode="outline">
                    <Div>
                      <div className={classes.codeHeader}>
                        <Title level="3" weight="2">
                          JavaScript
                        </Title>
                        <div className={classes.codeActions}>
                          <IconButton
                            onClick={() => executeCode("javascript")}
                            className={classes.downloadIcon}
                          >
                            <Icon24PlayCircle />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              copyToClipboard(generateJavaScriptCode())
                            }
                            className={classes.copyIcon}
                          >
                            <Icon20CopyOutline />
                          </IconButton>
                        </div>
                      </div>
                      <pre className={classes.codeBlock}>
                        <code>{generateJavaScriptCode()}</code>
                      </pre>
                    </Div>
                  </Card>

                  <Spacing size={16} />

                  <Card mode="outline">
                    <Div>
                      <div className={classes.codeHeader}>
                        <Title level="3" weight="2">
                          cURL
                        </Title>
                        <div className={classes.codeActions}>
                          <IconButton
                            onClick={() => executeCode("curl")}
                            className={classes.downloadIcon}
                          >
                            <Icon24PlayCircle />
                          </IconButton>
                          <IconButton
                            onClick={() => copyToClipboard(generateCurlCode())}
                            className={classes.copyIcon}
                          >
                            <Icon20CopyOutline />
                          </IconButton>
                        </div>
                      </div>
                      <pre className={classes.codeBlock}>
                        <code>{generateCurlCode()}</code>
                      </pre>
                    </Div>
                  </Card>
                </Group>
              )}
            </Div>
          </div>
        )}
      />
    </Panel>
  );
}

export default ApiLLMPanel;
