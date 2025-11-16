'use client';

import Script from 'next/script';

export default function AnalyticsWrapper() {
  return (
    <Script
      strategy="afterInteractive"
      src="https://vercel.live/script.js"
      data-vercel-analytics="true"
    />
  );
}

