'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { UserIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import { clientUser } from '@/lib/api/client';
import SettingsSection from '../ui/SettingsSection';
import UsernameInput from '../ui/UsernameInput';

export default function ProfileSettings() {
  const router = useRouter();
  const { data: session, update } = useSession();
  
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Init form with current user data
  useEffect(() => {
    if (session?.user) {
      const currentUsername = session.user.pseudo || '';
      setUsername(currentUsername);
      setOriginalUsername(currentUsername);
    }
  }, [session]);
  
  // Update profile information
  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable || !username || username === originalUsername) return;
    
    setLoading(true);
    try {
      // Get user ID from session
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User ID not found in session');
      }
      
      // Update profile via client API
      await clientUser.updateProfile(username);
      
      // Update NextAuth session
      await update({
        ...session,
        user: {
          ...session?.user,
          pseudo: username
        }
      });
      
      // Update local state
      setOriginalUsername(username);
      
      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection>
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex-shrink-0 mr-4">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              width={64}
              height={64}
              alt="Profile picture"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p className="text-gray-400">Manage your personal information</p>
        </div>
      </div>
      
      <form onSubmit={updateProfile}>
        <div className="mb-4">
          <UsernameInput 
            value={username}
            onChange={setUsername}
            originalUsername={originalUsername}
            onAvailabilityChange={setUsernameAvailable}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !usernameAvailable || username === originalUsername || !username}
          className={`px-6 py-2 rounded-lg transition ${
            loading || !usernameAvailable || username === originalUsername || !username
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Save changes'}
        </button>
      </form>
    </SettingsSection>
  );
}