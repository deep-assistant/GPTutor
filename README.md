# GPTutor

GPTutor — это платформа для создания AI-ассистентов и чат-ботов с поддержкой различных интеграций (VK, Telegram) и приложений (GPTutor, Stable Art, AiHumor).

## Архитектура проекта

Проект состоит из четырех основных компонентов:

- **GPTutor-Frontend** — React-приложение для веб-интерфейса
- **GPTutor-Backend** — Spring Boot бэкенд с REST API и WebSocket поддержкой  
- **GPTutor-Models** — сервис машинного обучения для обработки запросов
- **GPTutor-Rag** — система поиска и обработки документов

## Технологический стек

### Frontend
- React 18.2.0 с TypeScript
- VK UI Kit для интерфейса VK Mini Apps
- Telegram SDK для Telegram Bot Platform
- Monaco Editor для редактирования кода
- Markdown-it для рендеринга разметки

### Backend  
- Spring Boot 3.0.5 (Java 17)
- Spring WebSocket для real-time коммуникации
- PostgreSQL для хранения данных
- AWS S3 для файлового хранилища

### Инфраструктура
- Docker и Docker Compose для контейнеризации
- Nginx для проксирования запросов
- Traefik для автоматического SSL
- Let's Encrypt (certbot) для SSL сертификатов

## Процессы разработки и развертывания

### Локальная разработка

#### Запуск для разработки
```bash
./local-run.sh
```

Этот скрипт:
1. Запускает PostgreSQL и backend в Docker
2. Запускает models сервис
3. Устанавливает зависимости frontend через npm
4. Запускает frontend в режиме разработки на порту 10888

#### Локальная сборка с Nginx
```bash
./build-local-frontend-nginx.sh
```

Этот процесс:
1. Загружает переменные окружения
2. Удаляет старые volumes
3. Пересобирает и запускает frontend контейнер
4. Перезапускает Nginx для обновления конфигурации

#### Полная локальная сборка
```bash
./deploy-local-all.sh
```

Выполняет:
1. Установку frontend зависимостей и запуск в dev режиме
2. Перезапуск PostgreSQL с новой сборкой
3. Перезапуск backend с новой сборкой

### Производственное развертывание

#### Полное развертывание
```bash
./deploy-all.sh
```

Процесс включает:

**Production окружение:**
1. Загрузка переменных из `.env.sh`
2. Checkout и pull основной ветки
3. Остановка и пересборка frontend
4. Очистка Docker volumes
5. Последовательный запуск всех сервисов:
   - frontend (основное приложение)
   - nginx (прокси-сервер)
   - postgresql (база данных)
   - backend (API сервер)
   - certbot (SSL сертификаты)

**Stage окружение:**
1. Загрузка переменных из `.env-stage.sh`
2. Checkout ветки develop
3. Аналогичный процесс для stage версий сервисов

#### Отдельные процессы развертывания

**Frontend:**
```bash
./deploy-frontend.sh        # Production
./deploy-frontend-stage.sh  # Staging
```

**Backend:**
```bash
./deploy-backend.sh
```

**Stage окружение:**
```bash
./deploy-stage.sh
```

### Конфигурация окружений

#### Переменные окружения

- `.env.example` — пример базовой конфигурации
- `.env-prod.example` — пример production конфигурации  
- `.env-stage.example` — пример staging конфигурации
- `.env-frontend.example` — пример frontend конфигурации

Базовые переменные:
```bash
EMAIL=your-email@domain.com  # Для SSL сертификатов
HOST=your-domain.com         # Основной домен
```

#### Docker Compose файлы

- `docker-compose-dev.yaml` — локальная разработка
- `docker-compose-prod.yaml` — производственное окружение
- `docker-compose-stage.yaml` — staging окружение  
- `docker-compose-infra.yaml` — инфраструктурные сервисы
- `docker-compose-gpt.yaml` — специфичные GPT сервисы

### Поддерживаемые платформы и приложения

Система поддерживает несколько приложений на разных платформах:

#### Приложения:
- **GPTutor** — основное приложение для обучения
- **Stable Art** — генерация изображений  
- **AiHumor** — генерация юмористического контента

#### Платформы:
- **VK Mini Apps** — интеграция с ВКонтакте
- **Telegram Bot Platform** — Telegram боты

#### Production домены:
- `gptutor.prod.${HOST}` — основное приложение GPTutor
- `deep-gpt.prod.${HOST}` — Telegram версия GPTutor
- `stable-art.prod.${HOST}` — Stable Art приложение
- `ai-humor.prod.${HOST}` — AiHumor приложение

### Мониторинг и логирование

- Все сервисы работают в Docker контейнерах с автоматическим перезапуском
- Nginx логи доступны через Docker logs
- Backend логирование через Spring Boot
- Автоматическое обновление SSL сертификатов через certbot

### База данных

- PostgreSQL 13.1-alpine для production
- Отдельные инстансы для prod и stage окружений
- Persistent volumes для сохранения данных
- Автоматические миграции через Spring Boot

### Безопасность

- Автоматические SSL сертификаты через Let's Encrypt
- Traefik reverse proxy с автоматическим TLS
- Изоляция сервисов через Docker networks
- Переменные окружения для sensitive данных

## Быстрый старт

1. Клонируйте репозиторий
2. Скопируйте `.env.example` в `.env` и настройте переменные
3. Для локальной разработки: `./local-run.sh`
4. Для production: `./deploy-all.sh`

## Требования к системе

- Docker и Docker Compose
- Node.js 12+ для локальной разработки frontend
- Java 17 для локальной разработки backend
- 2GB+ RAM для всех сервисов
- SSL домен для production развертывания