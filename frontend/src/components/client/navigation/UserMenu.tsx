'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Session } from 'next-auth';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

/**
 * Props for the UserMenu component
 */
interface UserMenuProps {
  /** User session data */
  session: Session | null;
  /** Authentication status */
  status: "loading" | "authenticated" | "unauthenticated";
}

/**
 * UserMenu component
 * 
 * Displays a user menu dropdown with authentication options.
 * Shows login/signup buttons when unauthenticated,
 * and profile menu with avatar when authenticated.
 * 
 * @param props - Component props
 * @returns React component
 */
export function UserMenu({ session, status }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ callbackUrl: '/' });
  };

  if (status === "loading") {
    return (
      <div className="ml-4 h-10 w-10 rounded-full bg-slate-800 animate-pulse"></div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex space-x-2 ml-4">
        <Link 
          href="/login"
          className="btn btn-primary"
        >
          Sign in
        </Link>
        <Link 
          href="/signup"
          className="btn btn-secondary hidden sm:inline-block"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative ml-4" ref={menuRef}>
      <button 
        className="flex items-center space-x-2 group"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-800 ring-2 ring-slate-700 group-hover:ring-blue-500 transition-all">
          {session?.user?.image ? (
            <Image 
              src={session.user.image} 
              width={40} 
              height={40} 
              alt={`Avatar for ${session.user.pseudo}`}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-500">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <span className="hidden md:inline-block text-sm font-medium group-hover:text-blue-400 transition-colors">
          {session?.user?.pseudo || 'User'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700 animate-fade-in z-30">
          <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-violet-500/10">
            <p className="text-sm font-medium">{session?.user?.pseudo}</p>
          </div>
          
          <div className="py-1">
            <Link 
              href="/profile"
              className="flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="mr-3 h-5 w-5 text-slate-400" />
              My profile
            </Link>
            
            <Link 
              href="/settings"
              className="flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Cog6ToothIcon className="mr-3 h-5 w-5 text-slate-400" />
              Settings
            </Link>
          </div>
          
          <div className="border-t border-slate-700 mt-1 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}