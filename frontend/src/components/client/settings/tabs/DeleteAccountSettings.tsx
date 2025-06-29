'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import clientApi from '@/lib/api/client';
import SettingsSection from '../ui/SettingsSection';
import { useGlobal } from '@/providers/GlobalProvider';

/**
 * DeleteAccountSettings component
 * Provides account deletion functionality with confirmation steps
 * 
 * @returns {JSX.Element} Account deletion form with confirmation dialog
 */
export function DeleteAccountSettings() {
  const router = useRouter();
  const globalContext = useGlobal();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle account deletion
   * Validates password and calls API to delete the user account
   */
  const handleDeleteAccount = async () => {
    if (!password) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    try {
      setIsSubmitting(true);

      await clientApi.user.deleteAccount();
      
      // Sign out and redirect
      await signOut({ redirect: false });
      
      // Show success message
      toast.success('Your account has been deleted successfully');
      
      // Redirect to home page
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error?.message || 'Error deleting your account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsSection>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-red-500 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
          Delete Account
        </h2>
        <p className="text-gray-400 mt-1">
          Permanently delete your account and all associated data.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 text-red-100">
          <div className="flex items-start mb-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <h3 className="font-medium">Warning: This action is irreversible</h3>
          </div>
          <p className="text-sm text-red-200/70 pl-8">
            Deleting your account will permanently remove all your data, including your ratings,
            favorites, and account settings. This action cannot be undone.
          </p>
        </div>

        {isConfirmOpen ? (
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="password" className="block text-sm mb-1">
                Enter your password to confirm:
              </label>
              <input 
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 p-2 rounded-md"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-md text-white flex items-center"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
              <button 
                onClick={() => {
                  setIsConfirmOpen(false);
                  setPassword('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-md text-white"
          >
            Delete My Account
          </button>
        )}
      </div>
    </SettingsSection>
  );
}