# 🚀 ФИНАЛЬНАЯ ИНСТРУКЦИЯ ПО ДЕПЛОЮ

## ✅ Все изменения запушены в git!

Коммиты:
1. `bff778f` - feat: single migration with file conversion and caching support
2. `64684bf` - feat: add VK Storage, document conversion, caching, and generated images support

---

## 🔥 НА СЕРВЕРЕ ВЫПОЛНИТЕ (в точности):

```bash
# 1. Перейти в директорию проекта
cd /root/GPTutor
# (или ваш путь к проекту)

# 2. Скачать обновления
git pull

# 3. Остановить backend
docker-compose -f docker-compose-prod.yaml stop backend-prod

# 4. Удалить старый контейнер
docker-compose -f docker-compose-prod.yaml rm -f backend-prod

# 5. ВАЖНО: Удалить старую БД (один раз)
docker volume rm gptutor_backend-db
# Если volume нет, игнорируйте ошибку

# 6. Пересобрать БЕЗ кеша (ОБЯЗАТЕЛЬНО!)
docker-compose -f docker-compose-prod.yaml build --no-cache backend-prod

# 7. Запустить
docker-compose -f docker-compose-prod.yaml up -d backend-prod

# 8. Проверить логи
docker logs -f backend-prod
```

---

## ✅ В логах ДОЛЖНО быть:

```
Database does not exist, creating and applying migrations...
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "prod.db" at "file:/app/prisma/prod.db"

Applying migration `20251009103248_init`

The following migrations have been applied:

migrations/
  └─ 20251009103248_init/
    └─ migration.sql

Migration status:
Database schema is up to date!

Starting application...
```

### ❌ НЕ должно быть:

```
No migration found in prisma/migrations  ← Если это есть - плохо!
```

---

## 🧪 Проверка после деплоя

### 1. Health Check

```bash
curl http://localhost:3001/health
# Ожидаемо: {"status":"ok"}
```

### 2. Проверка миграций

```bash
docker exec backend-prod npx prisma migrate status
# Ожидаемо: 1 migration found, Database schema is up to date!
```

### 3. Проверка структуры БД

```bash
docker exec backend-prod sqlite3 /app/prisma/prod.db "PRAGMA table_info(files);"
# Должны быть поля: notStatic, originalName, originalSize, converted
```

### 4. Тест загрузки DOCX

```bash
curl -X POST http://your-server/upload \
  -H "Authorization: Bearer vk1..." \
  -F "file=@test.docx"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "File converted to PDF and uploaded successfully!",
  "data": {
    "converted": true,
    "fromCache": false,
    "file": {
      "name": "test.pdf",
      "type": "application/pdf"
    }
  }
}
```

### 5. Тест повторной загрузки (кеш)

```bash
curl -X POST http://your-server/upload \
  -H "Authorization: Bearer vk1..." \
  -F "file=@test.docx"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "File already converted and cached!",
  "data": {
    "converted": true,
    "fromCache": true  ← Работает из кеша!
  }
}
```

---

## 🎨 Тест генерации изображений

В приложении отправьте:
```
Нарисуй красивый закат
```

Модель должна:
1. Вернуть текст
2. Вернуть изображение (base64)
3. Изображение отобразится в чате

---

## 🐛 Если что-то пошло не так

### Ошибка: "No migration found"

**Причина:** Старый кеш Docker или миграции не скопировались

**Решение:**
```bash
# Проверить что миграции есть на сервере
ls -la GPTutor-Backend-v2/prisma/migrations/
# Должна быть папка: 20251009103248_init/

# Если её нет:
git pull --force

# Пересобрать БЕЗ кеша
docker-compose -f docker-compose-prod.yaml build --no-cache backend-prod
```

### Ошибка: "column does not exist"

**Причина:** Миграция не применилась

**Решение:**
```bash
docker exec backend-prod npx prisma migrate deploy
docker restart backend-prod
```

### Ошибка: "table does not exist"

**Причина:** БД не была создана

**Решение:**
```bash
# Проверить что БД создалась
docker exec backend-prod ls -la /app/prisma/
# Должен быть файл: prod.db

# Если нет - проверить логи
docker logs backend-prod | grep -i error
```

---

## 📊 Итоговый статус

| Компонент | Статус |
|-----------|--------|
| VK Storage (модель) | ✅ Готово |
| Конвертация DOC/DOCX/PPT/PPTX | ✅ Готово |
| Кеширование конвертаций | ✅ Готово |
| Сгенерированные изображения | ✅ Готово |
| Миграции Prisma | ✅ Исправлено |
| Dockerfile | ✅ Обновлен (LibreOffice) |
| Git | ✅ Все запушено |

---

## 🎉 Готово к деплою!

Просто выполните команды выше на сервере, и всё заработает.

**Время выполнения:** ~3-5 минут

**Важно:** Используйте `--no-cache` при сборке, чтобы миграции точно скопировались!

---

## 📞 Нужна помощь?

Отправьте логи:
```bash
docker logs backend-prod > logs.txt
```

И проверьте:
```bash
# Миграции на сервере
ls -la GPTutor-Backend-v2/prisma/migrations/

# Миграции в контейнере
docker exec backend-prod ls -la /app/prisma/migrations/
```

Если в контейнере миграций нет - значит `build --no-cache` не был выполнен!

---

Удачи! 🍀

