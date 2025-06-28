import { Metadata } from 'next';
import { LoginPage } from '@/components/server/auth/LoginPage';

export const metadata: Metadata = {
  title: 'Login | Rate \'em All',
  description: 'Log into your Rate \'em All account to rate your favorite Pokemon',
};

// This function is automatically a server component in Next.js App Router
export default function Page() {
  // Uses server component which injects client component where needed
  return <LoginPage />;
}
