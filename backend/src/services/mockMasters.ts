/** Тестовые мастера (как в админке) — имена, контакты и аватары для моков переписок и техпанели. */

export type MockMaster = {
  id: "ff" | "alex" | "user";
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

export const MOCK_MASTERS: Record<MockMaster["id"], MockMaster> = {
  ff: {
    id: "ff",
    name: "ff ddd",
    email: "ff6690473@gmail.com",
    phone: "+7 900 669-04-73",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ff6690473",
  },
  alex: {
    id: "alex",
    name: "Алексей",
    email: "",
    phone: "+79789195542",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aleksej799",
  },
  user: {
    id: "user",
    name: "Иван Петров",
    email: "98y7tbnb97t@gmail.com",
    phone: "+7 900 000-00-01",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=98y7tbnb97t",
  },
};
