'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * Call-to-action component for authentication
 * Displays a prompt for users to sign up when not logged in
 */
export function AuthCTA() {
  const { data: session, status } = useSession();
  
  // Don't display anything if the user is logged in or if the session is loading
  if (status === 'loading' || session) {
    return null;
  }
  
  // Only show the CTA if the user is NOT logged in
  return (
    <section className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Ready to join Rate &apos;em All?</h2>
      <p className="mb-6 max-w-2xl mx-auto">
        Create a free account to start rating your favorite Pokémon,
        track your favorites and be part of the trainer community.
      </p>
      <Link href="/signup" className="btn px-8 py-3 bg-white text-gray-900 hover:bg-gray-100">
        Sign up for free
      </Link>
    </section>
  );
}