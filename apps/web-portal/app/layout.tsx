import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BankCore Web Portal',
  description: 'BankCore customer-facing web portal foundation',
};

import { SessionProvider } from './providers/SessionProvider';
import { SocketProvider } from './providers/SocketProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
