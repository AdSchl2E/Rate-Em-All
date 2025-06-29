import { Metadata, Viewport } from 'next';
import ClientProviders from "@/providers/ClientProviders";
import RootLayout from '@/components/server/layout/RootLayout';
import "@/styles/globals.css";

// Server-side generated metadata
export const metadata: Metadata = {
  title: "Rate 'em All",
  description: 'Explore and rate your favorite Pokémon',
  icons: {
    icon: [
      { url: '/icon/favicon.ico' }
    ]
  }
};

// Move themeColor from metadata to viewport
export const viewport: Viewport = {
  themeColor: '#0F172A',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-900 text-gray-100">
        <ClientProviders>
          <RootLayout>
            {children}
          </RootLayout>
        </ClientProviders>
      </body>
    </html>
  );
}