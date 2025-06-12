import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
//import { Analytics } from '@vercel/analytics/react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
      
      <Footer />
      
      {/* Analytics */}
      {/*<Analytics />*/}
    </>
  );
}