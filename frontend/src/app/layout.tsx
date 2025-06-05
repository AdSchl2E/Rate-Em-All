import { Metadata, Viewport } from 'next';
import ClientProviders from "../providers/ClientProviders";
import "../styles/globals.css";
import { ServerNavbar } from '../components/server/layout/ServerNavbar';

// Métadonnées générées côté serveur
export const metadata: Metadata = {
  title: 'Rate-Em-All',
  description: 'Explore and rate your favorite Pokémon',
  icons: {
    icon: [
      { url: '/icon/favicon.ico' }
    ]
  }
};

// Déplacement de themeColor des métadonnées vers le viewport
export const viewport: Viewport = {
  themeColor: '#0F172A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <ClientProviders>
          {/* Assurez-vous que ServerNavbar n'est importé qu'ici et nulle part ailleurs */}
          <ServerNavbar />
          
          <main className="flex-grow container mx-auto px-4 py-6 animate-fade-in">
            {children}
          </main>
          
          <footer className="mt-auto py-6 bg-gray-900 border-t border-gray-800">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Rate-Em-All</p>
              <p className="mt-1">All Pokémon rights belong to Nintendo</p>
            </div>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}