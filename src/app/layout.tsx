import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PF Admin',
  description: 'Standalone admin control plane for ccy.asia.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
