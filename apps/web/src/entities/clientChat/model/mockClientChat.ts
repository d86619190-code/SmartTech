export type ClientChatMessage = {
  id: string;
  from: "user" | "service";
  text: string;
  at: string;
};

export const CLIENT_CHAT_TEMPLATES = [
  "When can I pick up the device?",
  "Check the estimate",
  "Thank you, I'm waiting for you to be ready",
];

/** Local fallback by orderId (main chat - API). Masters: ff ddd, Alexey, Ivan Petrov. */
export const clientChatByOrderId: Record<string, ClientChatMessage[]> = {
  "r-ff": [
    { id: "1", from: "service", text: "ff ddd: The display is on the way, I'll install it tomorrow. ff6690473@gmail.com", at: "24.03, 09:25" },
    { id: "2", from: "user", text: "Thank you!", at: "24.03, 10:00" },
  ],
  "r-alex": [
    { id: "1", from: "service", text: "Alexey: The battery is below 78%, I’m preparing a replacement. +79789195542", at: "24.03, 09:00" },
  ],
  "r-user": [
    {
      id: "1",
      from: "service",
      text: "Ivan Petrov: I’m waiting to choose the MacBook repair option. 98y7tbnb97t@gmail.com",
      at: "23.03, 18:00",
    },
  ],
};

export function getClientChat(orderId: string): ClientChatMessage[] {
  return clientChatByOrderId[orderId] ?? [];
}
