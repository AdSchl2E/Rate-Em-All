import Link from 'next/link';
import Image from 'next/image';
import { ClientNavbarWrapper } from '../../client/navigation/ClientNavbarWrapper';

export function ServerNavbar() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo and title */}
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
          
          {/* Client navigation */}
          <ClientNavbarWrapper />
        </nav>
      </div>
    </header>
  );
}