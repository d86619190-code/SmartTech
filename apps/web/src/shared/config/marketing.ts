/** Marketing content according to technical requirements (landing page, process, reviews) */

export const HERO = {
  title: "Repair of phones, tablets and laptops in 1 day with a guarantee of up to 1 year.",
  subtitle: "Choose the cost yourself and monitor the repair in real time.",
} as const;

export const BENEFITS: string[] = [
  "Free diagnostics",
  "Masters with more than 5 years of experience",
  "Payment only upon successful repair",
  "Repair tracking 24/7 in your personal account",
  "Original and tested spare parts",
  "Repair without data loss with official guarantee",
  "Transparent cost without hidden conditions",
];

export type ProcessStep = {
  n: number;
  imageUrl: string;
  title: string;
  body: string;
};

/** Screen 2 - 5 steps of transparency */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    n: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=640&h=420&fit=crop&auto=format&q=80",
    title: "Leave a request",
    body:
      "Choose a convenient format: leave a request online, wait for a call, or come to the service in person at a convenient time from 10:00 to 20:00.",
  },
  {
    n: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=640&h=420&fit=crop&auto=format&q=80",
    title: "We carry out diagnostics",
    body:
      "We check the device completely free of charge and accurately determine the breakdown and repair time. Diagnostics remain free in any case - even if you decide to refuse repairs.",
  },
  {
    n: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=640&h=420&fit=crop&auto=format&q=80",
    title: "We agree on the cost",
    body:
      'After diagnostics, we offer several repair options with different costs, depending on the type of spare parts. All details are in the “Order Tracking” section. You see in advance the price and terms, what is in stock and what will have to wait. Choose an option and confirm online - no hidden fees.',
  },
  {
    n: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=640&h=420&fit=crop&auto=format&q=80",
    title: "We carry out repairs",
    body:
      'We begin work only after your consent. The stages are displayed in the “Order Tracking” section - you can check the status or contact the manager at any time.',
  },
  {
    n: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=640&h=420&fit=crop&auto=format&q=80",
    title: "Returning the device",
    body:
      "You receive a working device without data loss with an official guarantee. Payment is only after completion of the repair, in cash or by card.",
  },
];

export const GUARANTEE = {
  title: "Guarantee for every repair",
  subtitle: "We document every job. You know the warranty period in advance and receive confirmation in your hands.",
  imageUrl:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=640&fit=crop&auto=format&q=80",
  items: [
    "Display - up to 24 months",
    "Power socket - up to 6 months",
    "Battery - up to 12 months",
    "Glass and touchscreen - up to 12 months",
  ],
} as const;

export type ReviewCard = {
  id: string;
  rating: number;
  name: string;
  text: string;
};

export const REVIEWS: ReviewCard[] = [
  {
    id: "r1",
    rating: 5,
    name: "Anna",
    text: "They replaced the screen in a day, and everything was explained transparently about the price. I recommend it.",
  },
  {
    id: "r2",
    rating: 5,
    name: "Michael",
    text: "Diagnostics is free, repairs are agreed upon online - without intrusive calls.",
  },
  {
    id: "r3",
    rating: 5,
    name: "Elena",
    text: "The data was saved and the warranty card was issued on the spot. I'm very pleased.",
  },
  {
    id: "r4",
    rating: 5,
    name: "Dmitry",
    text: "The status in the application was updated, I came to pick it up - everything works.",
  },
];

export type FaqItem = { q: string; a: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How long does the repair take?",
    a: "In most cases - from several hours to 1 day. We will inform you about the exact timing after diagnosis.",
  },
  {
    q: "Do I need to pay for diagnostics?",
    a: "No, diagnostics are always free - even if you refuse repairs.",
  },
  {
    q: "Is it possible to save the data?",
    a: "Yes, we perform repairs without data loss in most cases.",
  },
  {
    q: "How can I find out the repair status?",
    a: "You can track all stages online in the “Order Tracking” section or contact the manager.",
  },
  {
    q: "What spare parts are used?",
    a: "We offer several options: original, refurbished or high-quality analogues - you choose.",
  },
];
