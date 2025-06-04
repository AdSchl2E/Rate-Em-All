'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { GlobalProvider } from './GlobalProvider';

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