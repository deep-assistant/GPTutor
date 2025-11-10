# Models API Documentation

API для получения информации о моделях LLM с ценами в рублях.

## Endpoints

### GET /v1/models

Получить модели только от популярных провайдеров с ценами в рублях. **Публичный endpoint - авторизация не требуется.**

**Поддерживаемые провайдеры:** x-ai, deepseek, google, qwen, perplexity, mistralai, openai

**Фильтрация:** Исключены бесплатные модели (содержащие ":free" в названии)

**Сортировка:** Модели отсортированы по цене (самые дорогие сверху), затем по дате создания (самые новые сверху)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "google/gemini-2.5-flash-lite-preview-09-2025",
        "name": "Google: Gemini 2.5 Flash Lite Preview 09-2025",
        "description": "Gemini 2.5 Flash-Lite is a lightweight reasoning model...",
        "context_length": 1048576,
        "architecture": {
          "modality": "text+image->text",
          "input_modalities": ["file", "image", "text", "audio"],
          "output_modalities": ["text"],
          "tokenizer": "Gemini",
          "instruct_type": null
        },
        "pricing_rub": {
          "prompt": 0.000009,
          "completion": 0.000036,
          "request": 0,
          "image": 0,
          "web_search": 0,
          "internal_reasoning": 0
        },
        "top_provider": {
          "context_length": 1048576,
          "max_completion_tokens": 65536,
          "is_moderated": false
        },
        "supported_parameters": [
          "include_reasoning",
          "max_tokens",
          "reasoning",
          "response_format",
          "seed",
          "stop",
          "structured_outputs",
          "temperature",
          "tool_choice",
          "tools",
          "top_p"
        ]
      }
    ],
    "total": 45,
    "providers": ["x-ai", "deepseek", "google", "qwen", "perplexity", "mistralai", "openai"],
    "currency": "RUB",
    "exchangeRate": 90,
    "lastUpdated": "2025-01-28T10:30:00.000Z"
  }
}
```

## Коды ошибок

- `400 Bad Request` - неверные параметры запроса
- `500 Internal Server Error` - внутренняя ошибка сервера

## Примеры использования

### Получение моделей популярных провайдеров
```bash
curl -X GET "http://localhost:3001/v1/models"
```

## Структура ценообразования

Все цены возвращаются в рублях и рассчитываются по формуле:
```
цена_в_рублях = цена_в_долларах * курс_USD_to_RUB
```

Текущий курс: 90 рублей за доллар (можно изменить через `setUsdToRubRate()`).

### Типы цен:
- `prompt` - цена за входной токен
- `completion` - цена за выходной токен  
- `request` - фиксированная цена за запрос
- `image` - цена за изображение
- `web_search` - цена за веб-поиск
- `internal_reasoning` - цена за внутренние рассуждения
