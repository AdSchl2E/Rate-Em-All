import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions as auth } from '@/app/api/auth/[...nextauth]/route';
import NavigationLinks from '@/components/client/navigation/NavigationLinks';
import UserMenuButton from '@/components/client/navigation/UserMenuButton';

export default async function Navbar() {
  // Récupération de la session côté serveur pour l'optimisation initiale
  const session = await getServerSession(auth);
  
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 overflow-hidden">
              <Image
                src="/images/logo.webp"
                alt="Rate-Em-All Logo"
                width={30}
                height={30}
                className="object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Rate-Em-All
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