/** Card data for 3D tracking carousel */
export type TrackingCardData = {
  id: string;
  deviceName: string;
  issueLabel: string;
  imageUrl: string;
  /** 0–100: filling the progress bar */
  progressPercent: number;
  estimateLabel: string;
  /** Connection with the order in the application */
  orderId?: string;
};
