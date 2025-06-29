'use client';

import { useState } from 'react';
import { NavLink } from './NavLink';
import { MapIcon, FireIcon, HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavigationLinksProps {
  isAuthenticated?: boolean;
  userRole?: string;
}

/**
 * NavigationLinks component
 * Responsive navigation menu with mobile support
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.isAuthenticated=false] - Whether the user is authenticated
 * @param {string} [props.userRole='user'] - User role for conditional rendering
 */
export default function NavigationLinks({ isAuthenticated = false, userRole = 'user' }: NavigationLinksProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  return (
    <div className="flex items-center">
      {/* Mobile menu button */}
      <button 
        className="md:hidden mr-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        onClick={toggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
      
      {/* Navigation menu */}
      <div className={`
        ${menuOpen 
          ? 'flex flex-col absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 shadow-lg py-2 px-4 space-y-2 z-50' 
          : 'hidden md:flex items-center space-x-2'
        }
      `}>
        <NavLink href="/explorer" icon={<MapIcon className="h-5 w-5" />}>Explore</NavLink>
        <NavLink href="/top-rated" icon={<FireIcon className="h-5 w-5" />}>Top Pokémon</NavLink>
        
        {isAuthenticated && (
          <NavLink href="/favorites" icon={<HeartIcon className="h-5 w-5" />}>Favorites</NavLink>
        )}
        
        {userRole === 'admin' && (
          <NavLink href="/admin" className="!text-amber-400">Admin</NavLink>
        )}
      </div>
    </div>
  );
}