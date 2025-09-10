# Руководство по тестированию GPTutor

Данное руководство описывает настройку и запуск тестов для всех компонентов системы GPTutor.

## Структура тестирования

Проект состоит из 4 основных компонентов, каждый из которых имеет свою тестовую среду:

### 1. GPTutor-Backend (Java Spring Boot)
- **Фреймворк**: Spring Boot Test, JUnit 5, Mockito
- **База данных для тестов**: H2 in-memory
- **Конфигурация**: `src/test/resources/application-test.properties`

### 2. GPTutor-Frontend (React TypeScript)
- **Фреймворк**: Jest, React Testing Library
- **Конфигурация**: `package.json` (секция jest)
- **Файл настройки**: `src/setupTests.ts`

### 3. GPTutor-Models (Python Flask)
- **Фреймворк**: pytest, pytest-flask
- **Конфигурация**: `pytest.ini`

### 4. GPTutor-Rag (Node.js TypeScript)
- **Фреймворк**: Jest, Supertest
- **Конфигурация**: `jest.config.js`

## Запуск тестов

### Backend (Java)
```bash
cd GPTutor-Backend

# Запуск всех тестов
./mvnw test

# Запуск с подробным выводом
./mvnw test -Dtest.verbose=true

# Запуск конкретного теста
./mvnw test -Dtest=ChatGptApplicationTests
```

### Frontend (React)
```bash
cd GPTutor-Frontend

# Установка зависимостей (если не установлены)
npm install

# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm test -- --watch

# Запуск тестов с покрытием кода
npm test -- --coverage --watchAll=false
```

### Models (Python)
```bash
cd GPTutor-Models

# Установка зависимостей для тестирования
pip install -r requirements.txt

# Запуск всех тестов
pytest

# Запуск с подробным выводом
pytest -v

# Запуск с покрытием кода
pytest --cov=.
```

### RAG (Node.js)
```bash
cd GPTutor-Rag

# Установка зависимостей (если не установлены)
npm install

# Запуск всех тестов
npm test

# Запуск в режиме наблюдения
npm run test:watch

# Запуск с покрытием кода
npm run test:coverage
```

## Запуск всех тестов одной командой

Создан скрипт для запуска всех тестов:

```bash
# Из корневой директории проекта
./run-all-tests.sh
```

## Настройка CI/CD

### GitHub Actions
Рекомендуемая конфигурация для `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Test Backend
        run: |
          cd GPTutor-Backend
          ./mvnw test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test Frontend
        run: |
          cd GPTutor-Frontend
          npm ci
          npm test -- --coverage --watchAll=false

  test-models:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Test Models
        run: |
          cd GPTutor-Models
          pip install -r requirements.txt
          pytest

  test-rag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test RAG
        run: |
          cd GPTutor-Rag
          npm ci
          npm test
```

## Рекомендации по написанию тестов

### Backend (Java)
- Используйте `@WebMvcTest` для тестирования контроллеров
- Используйте `@SpringBootTest` для интеграционных тестов
- Мокайте внешние сервисы с помощью `@MockBean`
- Создавайте отдельные тестовые конфигурации

### Frontend (React)
- Используйте React Testing Library вместо Enzyme
- Тестируйте поведение пользователя, а не реализацию
- Используйте `screen.getByRole()` для поиска элементов
- Мокайте API вызовы

### Models (Python)
- Используйте фикстуры pytest для подготовки данных
- Тестируйте каждый endpoint отдельно
- Мокайте внешние API (OpenAI, VK API)
- Проверяйте статус коды и структуру ответов

### RAG (TypeScript)
- Мокайте сложные зависимости (LangChain, векторные базы)
- Используйте supertest для тестирования HTTP endpoints
- Тестируйте обработку ошибок
- Проверяйте типы TypeScript

## Отладка тестов

### Проблемы с зависимостями
```bash
# Backend
./mvnw dependency:tree

# Frontend и RAG
npm ls

# Models  
pip list
```

### Проблемы с конфигурацией
- Проверьте файлы конфигурации тестов
- Убедитесь, что переменные окружения установлены
- Проверьте пути к файлам в конфигурациях

### Логирование
- Backend: настройте уровень логирования в `application-test.properties`
- Frontend: используйте `console.log` в тестах для отладки
- Python: используйте `pytest -s` для вывода print statements

## Покрытие кода

Каждый компонент настроен для сбора метрик покрытия кода:

- **Backend**: JaCoCo (можно добавить в pom.xml)
- **Frontend**: Jest встроенное покрытие
- **Models**: pytest-cov
- **RAG**: Jest встроенное покрытие

## Полезные команды

```bash
# Очистка кэшей тестов
cd GPTutor-Frontend && npm test -- --clearCache
cd GPTutor-Rag && npm test -- --clearCache

# Обновление снапшотов
cd GPTutor-Frontend && npm test -- --updateSnapshot

# Запуск только измененных тестов
cd GPTutor-Frontend && npm test -- --onlyChanged
```