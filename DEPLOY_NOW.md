# 🚀 ДЕПЛОЙ СЕЙЧАС

## ✅ Что сделано локально

- Создана **одна чистая миграция** с всеми полями
- `init-db.sh` исправлен (использует `prisma migrate deploy`)
- Всё закоммичено и запушено в git

## 🔥 НА СЕРВЕРЕ ВЫПОЛНИТЕ:

```bash
# 1. Pull обновлений
cd /root/GPTutor  # или ваш путь к проекту
git pull

# 2. Удалить старую БД (если есть)
docker-compose -f docker-compose-prod.yaml down backend-prod
docker volume rm gptutor_backend-db 2>/dev/null || true

# 3. Пересобрать и запустить
docker-compose -f docker-compose-prod.yaml build backend-prod
docker-compose -f docker-compose-prod.yaml up -d backend-prod

# 4. Проверить логи
docker logs -f backend-prod
```

## ✅ Что должно быть в логах:

```
Database does not exist, creating and applying migrations...
Applying migration `20251009103248_init`
Migration status: All migrations applied ✅
Starting application...
```

## 🎯 Проверка работы:

```bash
# Загрузить файл
curl -X POST http://your-server/upload \
  -H "Authorization: Bearer vk1..." \
  -F "file=@test.docx"
```

**Ожидается:**
- ✅ Файл загружается
- ✅ Конвертируется в PDF  
- ✅ НЕТ ошибок `column does not exist`
- ✅ НЕТ ошибок `table does not exist`

## 🎉 Готово!

После деплоя всё будет работать!

