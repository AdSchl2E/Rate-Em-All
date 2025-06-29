'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import clientApi from '@/lib/api/client';
import SettingsSection from '../ui/SettingsSection';

/**
 * SecuritySettings component
 * Form for updating user password with validation
 * 
 * @returns {JSX.Element} Password change form
 */
export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Reset form fields
   */
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  /**
   * Handle form submission for password change
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await clientApi.user.changePassword(currentPassword, newPassword);
      
      toast.success('Password changed successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error?.message || 'Error changing password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsSection>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <LockClosedIcon className="h-6 w-6 mr-2" />
          Security Settings
        </h2>
        <p className="text-gray-400 mt-1">
          Update your password to keep your account secure.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium mb-1">
            Current Password
          </label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your current password"
            autoComplete="current-password"
          />
        </div>
        
        {/* New Password */}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium mb-1">
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 6 characters long.
          </p>
        </div>
        
        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>
        
        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
            className={`px-6 py-2 rounded-lg transition ${
              isSubmitting || !currentPassword || !newPassword || !confirmPassword
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </SettingsSection>
  );
}