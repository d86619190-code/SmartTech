# API (Express)

Авторизация по телефону: OTP (код из SMS), JWT access + refresh, данные в JSON-файле (`DB_PATH`).

## Запуск

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

`GET http://localhost:4000/health`

## Переменные окружения

См. `.env.example`. В разработке без SMS код пишется в консоль (`[sms:dev]`). С `OTP_DEV_PLAINTEXT=1` код также возвращается в теле ответа `send-code`.

## Эндпоинты

Базовый префикс: `/api/v1/auth`

| Метод | Путь | Описание |
|--------|------|----------|
| POST | `/phone/send-code` | Тело: `{ "phone": "+79991234567" }` |
| POST | `/phone/verify` | `{ "phone": "...", "code": "123456" }` → user, accessToken, refreshToken |
| POST | `/refresh` | `{ "refreshToken": "..." }` |
| GET | `/me` | Заголовок `Authorization: Bearer <access>` |
| POST | `/logout` | Опционально `{ "refreshToken": "..." }` для отзыва refresh |
| POST | `/google` | `{ "credential": "<JWT от Google Identity Services>" }` — вход через Google |

Номер нормализуется к виду `+7XXXXXXXXXX` (российский формат).

### Google

1. В [Google Cloud Console](https://console.cloud.google.com/) создайте OAuth Client ID **Web application**.
2. **Authorized JavaScript origins** добавьте фронт, например `http://localhost:5173`.
3. В `.env` бэкенда задайте `GOOGLE_CLIENT_ID` (тот же Client ID).
4. Во фронте задайте `VITE_GOOGLE_CLIENT_ID` и при необходимости `VITE_API_ORIGIN` (по умолчанию `http://localhost:4000`).

## Production SMS

В `src/services/sms.ts` подключите провайдера (Twilio и т.д.). Пока `NODE_ENV=production` без реализации SMS запрос на отправку кода вернёт 500.

## Частые ошибки

### `EADDRINUSE` / порт 4000 занят

Уже запущен другой процесс (старый `bun run dev`, другой сервис). Варианты: закройте его или в `.env` укажите `PORT=4001` и то же значение во фронте в `VITE_API_ORIGIN`, если вы меняли порт API.

### `better-sqlite3` / Python / `node-gyp`

В этом проекте **нет** `better-sqlite3` — данные в JSON (`DB_PATH`). Если при `bun install` / `npm install` всё равно тянется сборка `better-sqlite3`, удалите `backend/node_modules` и lock-файл (`bun.lock` / `package-lock.json`), убедитесь, что в `package.json` нет `better-sqlite3`, затем установите зависимости снова.
