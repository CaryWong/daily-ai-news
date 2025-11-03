import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daily AI News - AI Updates Delivered Daily',
  description: 'Get the latest AI news and developments delivered to your inbox every morning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
