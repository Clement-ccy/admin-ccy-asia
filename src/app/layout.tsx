import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PF Admin',
  description: 'Standalone admin control plane for ccy.asia.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-poster-paper)] text-[var(--color-poster-ink)] antialiased relative">
        <main className="mx-auto w-full min-h-screen">{children}</main>
      </body>
    </html>
  );
}
