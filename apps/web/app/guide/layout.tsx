import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Guide | CopySignal Bot by Fundz Technology',
  description: 'Complete guide to CopySignal Bot — how to set up exchange APIs, connect Telegram, format signals for your channel, and start automated trading. Built by Fundz Technology.',
  keywords: ['CopySignal Bot Guide', 'Telegram Trading Bot Setup', 'Bybit API Setup', 'Binance API Key', 'Signal Format Guide', 'Fundz Technology', 'Crypto Bot Tutorial'],
  authors: [{ name: 'Fundz Technology' }],
  openGraph: {
    title: 'CopySignal Bot System Guide | Fundz Technology',
    description: 'Step-by-step guide: API setup, Telegram connection, signal format for channel admins, and paper trading on testnet.',
    url: 'https://copysignal-bot.fundztechnology.com/guide',
    siteName: 'CopySignal Bot',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
