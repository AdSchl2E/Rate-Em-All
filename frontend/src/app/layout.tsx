"use client";

import "./globals.css";
import Navbar from "../components/navigation/navbar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { RatingsProvider } from '../contexts/RatingsContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <FavoritesProvider>
            <RatingsProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-6">
                {children}
              </main>
              <Toaster position="bottom-right" />
            </RatingsProvider>
          </FavoritesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
