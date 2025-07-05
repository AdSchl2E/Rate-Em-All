'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { LoadingSpinner } from '../ui/LoadingSpinner';

/**
 * Login form component with authentication functionality
 * Handles user login and displays validation errors
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get('expired') === 'true';
  const [credentials, setCredentials] = useState({ pseudo: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show session expired message if redirected from AuthenticationGuard
    if (isSessionExpired) {
      setError('Your session has expired. Please log in again.');
    }
  }, [isSessionExpired]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.pseudo || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn('credentials', {
        pseudo: credentials.pseudo,
        password: credentials.password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid username or password');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful!');
      
      router.push('/');
      router.refresh(); // Refresh to update authentication state
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error
    ) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="pseudo">
          Username
        </label>
        <input
          id="pseudo"
          name="pseudo"
          type="text"
          value={credentials.pseudo}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
          placeholder="your_username"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <LoadingSpinner size="sm" /> 
            <span className="ml-2">Logging in...</span>
          </div>
        ) : (
          'Login'
        )}
      </button>

      <div className="text-center mt-4">
        <p>Don&apos;t have an account yet?{' '}
          <Link 
            href="/signup" 
            className="text-blue-500 hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
}