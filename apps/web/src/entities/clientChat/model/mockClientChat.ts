export type ClientChatMessage = {
  id: string;
  from: "user" | "service";
  text: string;
  at: string;
};

export const CLIENT_CHAT_TEMPLATES = [
  "Когда можно забрать устройство?",
  "Уточните по смете",
  "Спасибо, жду готовности",
];

/** Локальный fallback по orderId (основной чат — API). Мастера: ff ddd, Алексей, Иван Петров. */
export const clientChatByOrderId: Record<string, ClientChatMessage[]> = {
  "r-ff": [
    { id: "1", from: "service", text: "ff ddd: дисплей в пути, завтра установлю. ff6690473@gmail.com", at: "24.03, 09:25" },
    { id: "2", from: "user", text: "Спасибо!", at: "24.03, 10:00" },
  ],
  "r-alex": [
    { id: "1", from: "service", text: "Алексей: АКБ ниже 78%, готовлю замену. +79789195542", at: "24.03, 09:00" },
  ],
  "r-user": [
    {
      id: "1",
      from: "service",
      text: "Иван Петров: жду выбора варианта ремонта MacBook. 98y7tbnb97t@gmail.com",
      at: "23.03, 18:00",
    },
  ],
};

export function getClientChat(orderId: string): ClientChatMessage[] {
  return clientChatByOrderId[orderId] ?? [];
}
