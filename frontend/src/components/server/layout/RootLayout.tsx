import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { MobileNavBar } from '@/components/client/navigation';
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
 * like navigation bar, mobile navigation bar and footer.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop navbar - hidden on mobile */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Main content with padding to avoid overlap with mobile navbar */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-20 md:pb-6 animate-fade-in">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Mobile navigation bar - only visible on mobile */}
      <MobileNavBar />
      
      {/* Analytics */}
      {/*<Analytics />*/}
    </div>
  );
}