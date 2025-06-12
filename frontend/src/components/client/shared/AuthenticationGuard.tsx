'use client';

import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import { ReactNode } from 'react';

interface AuthenticationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthenticationGuard({ children, fallback }: AuthenticationGuardProps) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}