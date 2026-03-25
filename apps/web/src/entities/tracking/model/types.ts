/** Данные карточки для 3D-карусели отслеживания */
export type TrackingCardData = {
  id: string;
  deviceName: string;
  issueLabel: string;
  imageUrl: string;
  /** 0–100: заполнение прогресс-бара */
  progressPercent: number;
  estimateLabel: string;
  /** Связь с заказом в приложении */
  orderId?: string;
};
