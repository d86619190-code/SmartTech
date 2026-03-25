import type { StreamStatus } from "./openSseStream";

export function streamStatusLabel(status: StreamStatus): string {
  switch (status) {
    case "connected":
      return "Соединение: онлайн";
    case "reconnecting":
      return "Соединение: переподключение...";
    case "auth_error":
      return "Сессия истекла — обновите страницу или войдите снова";
    default:
      return "Соединение: подключение...";
  }
}

/** Тот же смысл, что `streamStatusLabel`, но для списка сообщений (не «соединение», а «обновления»). */
export function streamUpdatesLabel(status: StreamStatus): string {
  return streamStatusLabel(status).replace("Соединение", "Обновления");
}
