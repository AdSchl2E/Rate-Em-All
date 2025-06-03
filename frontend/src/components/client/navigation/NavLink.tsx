'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function NavLink({ href, children, icon, className = '' }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  return (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2
        ${isActive 
          ? 'bg-blue-600/20 text-blue-400 font-medium' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        } ${className}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </Link>
  );
}