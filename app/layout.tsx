import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  description: "Tell us your project idea and get a beginner-friendly setup guide powered by AI. Generate setup steps, kanban boards, and PDF guides instantly.",
  keywords: ["coding", "setup guide", "AI", "developer tools", "beginner coding", "project setup"],
  openGraph: {
    title: "Coding Kickstarter - AI-Powered Setup Guides",
    description: "Get instant AI-generated setup guides for your coding projects",
    type: "website",
    url: "https://codingkickstarter.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
