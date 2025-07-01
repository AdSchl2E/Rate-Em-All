'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
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
 * and redirects to login page if user is not authenticated or session has expired.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function AuthenticationGuard({ children, fallback }: AuthenticationGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  
  useEffect(() => {
    // Check if session is still valid by making a simple API request
    const validateSession = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/users', { cache: 'no-store' });
          const data = await response.json();
          
          if (response.status === 401 || data.error === 'Unauthorized' || data.requiresLogin) {
            console.warn('Session expired or invalid, redirecting to login');
            await signOut({ redirect: false });
            router.push('/login?expired=true');
            return;
          }
          
          setIsSessionChecked(true);
        } catch (error) {
          console.error('Error validating session:', error);
          setIsSessionChecked(true);
        }
      } else {
        setIsSessionChecked(true);
      }
    };
    
    validateSession();
  }, [session, router]);

  useEffect(() => {
    // Handle authentication status
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setIsSessionChecked(true);
    }
  }, [status, router]);

  // Show loading spinner while checking authentication
  if (status === 'loading' || !isSessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authenticated, render the protected content
  if (status === 'authenticated' && isSessionChecked) {
    return <>{children}</>;
  }

  // Default fallback - should not normally be reached
  return null;
}