import { Metadata } from 'next';
import { SignupPage } from '@/components/server/auth/SignupPage';

export const metadata: Metadata = {
  title: "Sign Up | Rate 'em All",
  description: "Create your Rate 'em All account to rate and save your favorite Pokémon",
};

// This function is automatically a server component in Next.js App Router
export default function Page() {
  // Uses server component which injects client component where needed
  return <SignupPage />;
}
