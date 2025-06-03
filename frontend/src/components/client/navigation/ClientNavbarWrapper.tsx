'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { NavLink } from './NavLink';
import { UserMenu } from './UserMenu';
import { MapIcon, FireIcon, HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function ClientNavbarWrapper() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  return (
    <div className="flex items-center">
      {/* Bouton menu mobile */}
      <button 
        className="md:hidden mr-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
      
      {/* Navigation */}
      <div className={`
        ${menuOpen 
          ? 'flex flex-col absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 shadow-lg py-2 px-4 space-y-2 z-50' 
          : 'hidden md:flex items-center space-x-1'
        }
      `}>
        <NavLink href="/explorer" icon={<MapIcon className="h-5 w-5" />}>Explorer</NavLink>
        <NavLink href="/top-rated" icon={<FireIcon className="h-5 w-5" />}>Top Pokémon</NavLink>
        {status === 'authenticated' && (
          <NavLink href="/favorites" icon={<HeartIcon className="h-5 w-5" />}>Favoris</NavLink>
        )}
      </div>

      {/* Menu utilisateur toujours visible */}
      <UserMenu session={session} status={status} />
    </div>
  );
}