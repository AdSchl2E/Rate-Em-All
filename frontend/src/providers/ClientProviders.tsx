'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { FavoritesProvider } from './FavoritesProvider';
import { RatingsProvider } from './RatingsProvider';
import { ClientNavbarWrapper } from "../components/client/navigation/ClientNavbarWrapper";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FavoritesProvider>
        <RatingsProvider>
          {/* Ce composant ajoute les fonctionnalités client à la navbar serveur */}
          <ClientNavbarWrapper />
          {children}
          <Toaster position="bottom-right" />
        </RatingsProvider>
      </FavoritesProvider>
    </SessionProvider>
  );
}