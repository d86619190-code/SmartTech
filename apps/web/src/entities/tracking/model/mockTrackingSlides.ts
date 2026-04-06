import type { TrackingCardData } from "./types";

export const mockTrackingSlides: TrackingCardData[] = [
  {
    id: "t1",
    deviceName: "iPhone 13 mini",
    issueLabel: "ff ddd · display replacement",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80",
    progressPercent: 72,
    estimateLabel: "Repair",
    orderId: "r-ff",
  },
  {
    id: "t2",
    deviceName: "Samsung Galaxy S21",
    issueLabel: "Alexey · Battery",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop&q=80",
    progressPercent: 40,
    estimateLabel: "Diagnostics",
    orderId: "r-alex",
  },
  {
    id: "t3",
    deviceName: "MacBook Air M2",
    issueLabel: "Ivan Petrov · approval",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&q=80",
    progressPercent: 48,
    estimateLabel: "Price",
    orderId: "r-user",
  },
];
