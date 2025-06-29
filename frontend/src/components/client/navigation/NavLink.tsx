'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * NavLink component
 * Navigation link with active state styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - Target URL for the link
 * @param {React.ReactNode} props.children - Link content/label
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.icon] - Optional icon to display before text
 */
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