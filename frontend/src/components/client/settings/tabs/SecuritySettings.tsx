'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import clientApi from '@/lib/api/client';
import SettingsSection from '../ui/SettingsSection';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Change password
  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    try {
      // Use our client API
      await clientApi.user.changePassword(currentPassword, newPassword);
      
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.message?.includes('incorrect password')) {
        toast.error('Current password is incorrect');
      } else {
        toast.error("An error occurred while changing your password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection>
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
          <ShieldCheckIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Security</h2>
          <p className="text-gray-400">Manage your password</p>
        </div>
      </div>
      
      <form onSubmit={changePassword}>
        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-400 mt-1">
            Password must be at least 8 characters
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full p-2 bg-gray-700 rounded-lg border ${
              confirmPassword && newPassword !== confirmPassword
                ? 'border-red-500'
                : 'border-gray-600'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              Passwords do not match
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={
            loading || 
            !currentPassword || 
            !newPassword || 
            newPassword !== confirmPassword || 
            newPassword.length < 8
          }
          className={`px-6 py-2 rounded-lg transition ${
            loading || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Change Password'}
        </button>
      </form>
    </SettingsSection>
  );
}