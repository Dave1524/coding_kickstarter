export const featureFlags = {
  showPricing: process.env.NEXT_PUBLIC_SHOW_PRICING === 'true',
} as const;

