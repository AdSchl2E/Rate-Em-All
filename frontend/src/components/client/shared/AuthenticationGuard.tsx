'use client';

import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import { ReactNode } from 'react';

/**
 * Props for the AuthenticationGuard component
 */
interface AuthenticationGuardProps {
  /** Child components to render when authenticated */
  children: ReactNode;
  /** Content to display when user is not authenticated */
  fallback?: ReactNode;
}

/**
 * AuthenticationGuard component
 * 
 * Protects content that requires authentication.
 * Shows a loading indicator while checking authentication status,
 * and renders either the protected content or a fallback when not authenticated.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function AuthenticationGuard({ children, fallback }: AuthenticationGuardProps) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400">Verifying authentication...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}