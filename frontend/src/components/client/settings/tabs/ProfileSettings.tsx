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
      const currentUsername = session.user.name || '';
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
      // Récupérer l'ID utilisateur de la session
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User ID not found in session');
      }
      
      // Mettre à jour le profil via l'API client
      await clientUser.updateProfile(username);
      
      // Mettre à jour la session NextAuth
      await update({
        ...session,
        user: {
          ...session?.user,
          name: username
        }
      });
      
      // Mettre à jour l'état local
      setOriginalUsername(username);
      
      toast.success('Profil mis à jour avec succès!');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Une erreur s'est produite lors de la mise à jour de votre profil");
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
              alt="Photo de profil"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">Informations de profil</h2>
          <p className="text-gray-400">Gérez vos informations personnelles</p>
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
        
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={session?.user?.email || ''}
            disabled
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 opacity-70"
          />
          <p className="text-xs text-gray-400 mt-1">
            L'adresse email ne peut pas être modifiée
          </p>
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
          {loading ? <LoadingSpinner size="sm" /> : 'Enregistrer les modifications'}
        </button>
      </form>
    </SettingsSection>
  );
}