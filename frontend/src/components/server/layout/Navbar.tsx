import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions as auth } from '@/lib/auth/config';
import NavigationLinks from '@/components/client/navigation/NavigationLinks';
import UserMenuButton from '@/components/client/navigation/UserMenuButton';

/**
 * Navbar component
 * 
 * Server component that renders the application's navigation bar for desktop view.
 * Gets the user's session server-side for initial render optimization.
 * 
 * @returns React server component
 */
export default async function Navbar() {
  // Get session server-side for initial optimization
  const session = await getServerSession(auth);
  
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 overflow-hidden">
              <Image
                src="/images/logo.webp"
                alt="Rate 'em All Logo"
                width={30}
                height={30}
                className="object-contain group-hover:scale-110 transition-transform"
                priority
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Rate &apos;em All
            </span>
          </Link>
          
          <div className="flex items-center">
            {/* Navigation links */}
            <NavigationLinks 
              isAuthenticated={!!session} 
              userRole={'user'}
            />
            
            {/* User menu */}
            <UserMenuButton
              initialSession={session}
              username={session?.user?.pseudo || undefined}
              userImage={session?.user?.image || undefined}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}