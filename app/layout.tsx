import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsWrapper from '@/components/AnalyticsWrapper';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coding Kickstarter - AI-Powered Setup Guides for Developers",
  description: "Tell us your project idea and get a beginner-friendly setup guide powered by AI. Generate setup steps, MVP blueprints with EPICs and Features, and PDF guides instantly.",
  keywords: ["coding", "setup guide", "AI", "developer tools", "beginner coding", "project setup"],
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "Coding Kickstarter - AI-Powered Setup Guides",
    description: "Get instant AI-generated setup guides for your coding projects. Turn ideas into MVPs in minutes.",
    type: "website",
    url: "https://codingkickstarter.com",
    locale: "en_US",
    images: [
      {
        url: "https://codingkickstarter.com/Images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Coding Kickstarter - AI-Powered Setup Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Kickstarter - AI-Powered Setup Guides",
    description: "Get instant AI-generated setup guides for your coding projects. Turn ideas into MVPs in minutes.",
    images: ["https://codingkickstarter.com/Images/og-image.png"],
    site: "@CodeKickstarter",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <AnalyticsWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
