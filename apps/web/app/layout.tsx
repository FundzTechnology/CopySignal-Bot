import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CopySignal Bot | Auto-Execute Crypto Signals by Fundz Technology",
  description: "Instantly auto-execute trades from any Telegram signal channel on Bybit or Binance. The ultimate automated crypto trading bot built and owned by Fundz Technology.",
  keywords: ["Crypto Trading Bot", "Telegram Signal Copier", "Auto-Execute Signals", "Fundz Technology", "Binance Bot", "Bybit Bot", "Crypto Automation"],
  authors: [{ name: "Fundz Technology" }],
  openGraph: {
    title: "CopySignal Bot | Fundz Technology",
    description: "Automate your crypto trading. Instantly copy signals from Telegram to Bybit & Binance. Built by Fundz Technology.",
    url: "https://copysignal-bot.fundztechnology.com",
    siteName: "CopySignal Bot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CopySignal Bot | Auto-Execute Crypto Signals",
    description: "Instantly auto-execute trades from any Telegram signal channel on Bybit or Binance. Built by Fundz Technology.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
