import React, { useState, useEffect, useMemo } from "react";

import { AppPanelHeader } from "$/components/AppPanelHeader";
import { Panel, PanelHeaderBack, Button, File, Div, Input, Card, Paragraph, Text } from "@vkontakte/vkui";
import { AppContainer } from "$/components/AppContainer";
import { useNavigationContext } from "$/NavigationContext";
import { FullscreenButton } from "$/components/FullscreenButton";
import Markdown from "$/services/Markdown";

import classes from "./MarkdownReader.module.css";

interface IProps {
  id: string;
}

function MarkdownReader({ id }: IProps) {
  const { goBack } = useNavigationContext();
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const markdown = useMemo(() => new Markdown(), []);
  const html = markdownContent ? markdown.render(markdownContent) : "";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/markdown") {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdownContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(urlInput);
      if (response.ok) {
        const content = await response.text();
        setMarkdownContent(content);
        setFileName(urlInput.split('/').pop() || 'loaded-file.md');
      } else {
        console.error('Failed to load markdown file from URL');
      }
    } catch (error) {
      console.error('Error loading markdown file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleMarkdown = `# Добро пожаловать в Markdown Reader

## Что это такое?

Это средство для чтения и просмотра Markdown файлов с поддержкой:

- **Выделения кода** с подсветкой синтаксиса
- Математических формул с MathJax
- Сносок и ссылок
- И многого другого!

## Пример кода

\`\`\`javascript
function hello() {
  console.log("Привет, мир!");
}
\`\`\`

## Математика

Inline формула: $E = mc^2$

Block формула:
$$\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n$$

> Это цитата с важной информацией

Используйте загрузку файла или URL для просмотра ваших Markdown документов!`;

  useEffect(() => {
    if (!markdownContent) {
      setMarkdownContent(sampleMarkdown);
      setFileName("sample.md");
    }
  }, []);

  return (
    <Panel id={id}>
      <AppContainer
        withoutTabbar
        headerChildren={
          <AppPanelHeader
            before={<PanelHeaderBack onClick={goBack} />}
            after={<FullscreenButton />}
          >
            Markdown Reader
          </AppPanelHeader>
        }
      >
        <div className={classes.container}>
          <Card>
            <Div>
              <Text weight="2">Загрузить Markdown файл</Text>
              <input
                type="file"
                accept=".md,.markdown"
                onChange={handleFileUpload}
                style={{ marginTop: 12, marginBottom: 12 }}
              />
              
              <Input
                placeholder="Или введите URL к .md файлу"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              
              <Button
                onClick={handleUrlLoad}
                disabled={!urlInput.trim() || isLoading}
                size="s"
                mode="secondary"
              >
                {isLoading ? "Загрузка..." : "Загрузить по URL"}
              </Button>
              
              {fileName && (
                <Paragraph style={{ marginTop: 12 }}>
                  <Text weight="2">Текущий файл:</Text> {fileName}
                </Paragraph>
              )}
            </Div>
          </Card>

          <div className={classes.markdownContent}>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </AppContainer>
    </Panel>
  );
}

export default MarkdownReader;