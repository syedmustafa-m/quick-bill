import './globals.css';
import { Inter } from 'next/font/google';
import SessionProvider from './components/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import AppLayout from './components/AppLayout';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Invoice Generator',
  description: 'Generate and manage your invoices with ease.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <NextTopLoader color="#3b82f6" showSpinner={false} />
        <SessionProvider session={session}>
          {session ? (
            <AppLayout>{children}</AppLayout>
          ) : (
            <main className="flex items-center justify-center min-h-screen">
              {children}
            </main>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
