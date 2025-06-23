import './globals.css';
import { Inter } from 'next/font/google';
import SessionProvider from './components/SessionProvider';
import { ThemeProvider } from './components/ThemeProvider';
import ToastProvider from './components/ToastProvider';
import type { Metadata } from "next";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import AppLayout from './components/AppLayout';
import ThemeAwareTopLoader from './components/ThemeAwareTopLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice Generator',
  description: 'Generate professional invoices with ease',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider>
            <ThemeAwareTopLoader />
            <AppLayout>
              {children}
            </AppLayout>
            <ToastProvider />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
