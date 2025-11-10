/**
 * Утилита для форматирования текста с цитированиями
 */

/**
 * Заменяет [N] в тексте на кликабельные ссылки
 * @param text Исходный текст с маркерами [1], [2] и т.д.
 * @param citations Массив URL для замены
 * @returns HTML строка с замененными ссылками
 */
export function formatTextWithCitations(text: string, citations: string[]): string {
  if (!citations || citations.length === 0) {
    return text;
  }

  let formattedText = text;
  
  // Заменяем каждое вхождение [N] на ссылку
  citations.forEach((url, index) => {
    const citationNumber = index + 1;
    const citationPattern = new RegExp(`\\[${citationNumber}\\]`, 'g');
    
    // Создаем HTML для ссылки
    const citationLink = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-citation" title="${url}">[${citationNumber}]</a>`;
    
    formattedText = formattedText.replace(citationPattern, citationLink);
  });

  return formattedText;
}

/**
 * Получает домен из URL для отображения
 */
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Форматирует заголовок цитирования
 */
export function formatCitationTitle(title: string, url: string): string {
  if (title && title !== url) {
    return title;
  }
  return getDomainFromUrl(url);
}

