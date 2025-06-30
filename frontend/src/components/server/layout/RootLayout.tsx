import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
//import { Analytics } from '@vercel/analytics/react';

/**
 * Props for RootLayout component
 */
interface RootLayoutProps {
  /** Child components to render within the layout */
  children: ReactNode;
}

/**
 * RootLayout component
 * 
 * Main application layout that wraps all pages with common elements
 * like navigation bar and footer.
 * 
 * @param props - Component props
 * @returns React component
 */
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