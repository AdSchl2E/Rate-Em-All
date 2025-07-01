'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { GlobalProvider } from './GlobalProvider';

/**
 * Client-side providers wrapper component
 * Provides session management, global state, and toast notifications
 * 
 * @param props - Component properties
 * @param props.children - Child components to be wrapped with providers
 * @returns Wrapped component tree with all client-side providers
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlobalProvider>
        {children}
        <Toaster position="bottom-right" />
      </GlobalProvider>
    </SessionProvider>
  );
}