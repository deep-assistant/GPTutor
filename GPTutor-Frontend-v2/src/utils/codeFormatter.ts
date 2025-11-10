import Markdown from '../services/Markdown';

const markdownService = new Markdown();

// Функция для форматирования кода с подсветкой синтаксиса
export const formatCode = (code: string, language: string = 'javascript'): string => {
  const codeBlock = `\`\`\`${language}\n${code}\n\`\`\``;
  return markdownService.render(codeBlock);
};

// Функция для создания HTML с подсветкой синтаксиса
export const createCodeHTML = (code: string, language: string = 'javascript'): string => {
  return formatCode(code, language);
};

// Функция для получения CSS классов для подсветки
export const getCodeStyles = () => {
  return `

  `;
};
