'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserIcon } from '@heroicons/react/24/outline';
import { Session } from 'next-auth';
import UsernameInput from '../ui/UsernameInput';
import SettingsSection from '../ui/SettingsSection';
import clientApi from '@/lib/api/client';
import { useGlobal } from '@/providers/GlobalProvider';

interface ProfileSettingsProps {
  session: Session | null;
}

/**
 * ProfileSettings component
 * User profile settings form allowing username updates
 * 
 * @param {Object} props - Component props
 * @param {Session|null} props.session - User session data
 * @returns {JSX.Element} Profile settings form
 */
export function ProfileSettings({ session }: ProfileSettingsProps) {
  const globalContext = useGlobal();
  
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with data from session
  useEffect(() => {
    if (session?.user?.pseudo) {
      setUsername(session.user.pseudo);
      setOriginalUsername(session.user.pseudo);
    }
  }, [session]);
  
  // Check if form has been modified
  const hasChanges = username !== originalUsername;
  
  /**
   * Handle profile update submission
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      return;
    }
    
    // Validate form
    if (!username) {
      toast.error('Username is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile using client API
      await clientApi.user.updateProfile(username);
      
      toast.success('Profile updated successfully');
      setOriginalUsername(username);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SettingsSection>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <UserIcon className="h-6 w-6 mr-2" />
          Profile Information
        </h2>
        <p className="text-gray-400 mt-1">
          Update your profile settings and account information.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Username field */}
          <div>
            <UsernameInput
              value={username}
              onChange={setUsername}
              originalUsername={originalUsername}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!hasChanges || isSubmitting}
              className={`px-6 py-2 rounded-lg transition ${
                !hasChanges || isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </SettingsSection>
  );
}