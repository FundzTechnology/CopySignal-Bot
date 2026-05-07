import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Control Panel — CopySignal Bot',
  robots: { index: false, follow: false }, // Prevent indexing
};

export default function ControlPanelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
