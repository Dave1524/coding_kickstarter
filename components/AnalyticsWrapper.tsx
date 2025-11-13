'use client';

import dynamic from 'next/dynamic';

// Dynamically import Analytics with no SSR to avoid build-time resolution issues
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }
);

export default function AnalyticsWrapper() {
  return <Analytics />;
}

