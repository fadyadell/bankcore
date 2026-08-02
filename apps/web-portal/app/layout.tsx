import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BankCore Web Portal',
  description: 'BankCore customer-facing web portal foundation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
