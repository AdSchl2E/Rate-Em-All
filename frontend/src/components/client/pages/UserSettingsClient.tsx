'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useGlobal } from '../../../providers/GlobalProvider';
import { 
  UserIcon, 
  KeyIcon, 
  ShieldCheckIcon, 
  TrashIcon,
  ArrowLeftIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

export function UserSettingsClient() {
  const { data: session, update, status } = useSession();
  const { favorites, userRatings, username: globalUsername, setUsername: setGlobalUsername } = useGlobal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'delete'>('profile');
  
  // Init form with current user data
  useEffect(() => {
    if (session?.user) {
      setUsername(globalUsername || session.user.name || '');
      setOriginalUsername(globalUsername || session.user.name || '');
    }
  }, [session, globalUsername]);
  
  // Check username availability
  useEffect(() => {
    if (username && username !== originalUsername) {
      const checkUsername = async () => {
        setChecking(true);
        try {
          const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
          
          if (!response.ok) {
            throw new Error('Erreur lors de la vérification du pseudo');
          }
          
          const data = await response.json();
          setUsernameAvailable(data.available);
        } catch (error) {
          console.error('Error checking username:', error);
          setUsernameAvailable(false);
        } finally {
          setChecking(false);
        }
      };
      
      // Debounce the check
      const timeout = setTimeout(checkUsername, 500);
      return () => clearTimeout(timeout);
    } else {
      setUsernameAvailable(true);
    }
  }, [username, originalUsername]);
  
  // Update profile information
  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable || !username) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log('Profile updated:', data);
        
        // Update both the session and our global state
        const result = await update({
          ...session,
          user: {
            ...session?.user,
            name: username
          }
        });
        console.log('Session updated:', result);
        
        // Update our global context username - this will propagate to all components
        setGlobalUsername(username);
        
        setOriginalUsername(username);
        toast.success('Profil mis à jour avec succès!');
        
        router.refresh();
      } else {
        toast.error(data.error || 'Échec de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Une erreur s'est produite lors de la mise à jour de votre profil");
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success('Mot de passe changé avec succès!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Échec du changement de mot de passe');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Une erreur s'est produite lors du changement de votre mot de passe");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete account
  const deleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') {
      toast.error('Veuillez saisir SUPPRIMER pour confirmer');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Votre compte a été supprimé');
        // Redirection vers la déconnexion après un court délai
        setTimeout(() => {
          router.push('/api/auth/signout');
        }, 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Échec de la suppression du compte');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Une erreur s'est produite lors de la suppression de votre compte");
    } finally {
      setLoading(false);
    }
  };
  
  // Rendu conditionnel selon l'état d'authentification
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Paramètres utilisateur</h1>
        <p>Veuillez vous connecter pour accéder à vos paramètres</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-block">
          Se connecter
        </Link>
      </div>
    );
  }
  
  // Stats utilisateur
  const favCount = favorites?.length || 0;
  const ratedCount = Object.keys(userRatings).length || 0;
  
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Bouton Retour et Titre */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/profile" className="flex items-center text-gray-400 hover:text-white transition">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span>Retour au profil</span>
        </Link>
        <h1 className="text-2xl font-bold">Paramètres utilisateur</h1>
      </div>
      
      {/* Stats utilisateur */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-around">
        <div className="text-center">
          <div className="text-sm text-gray-400">Compte créé</div>
          <div className="font-medium">
            {new Date(session?.user?.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Favoris</div>
          <div className="font-medium text-red-400">{favCount}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Pokémon notés</div>
          <div className="font-medium text-amber-400">{ratedCount}</div>
        </div>
      </div>
      
      {/* Onglets de navigation */}
      <div className="flex mb-6 bg-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 px-4 ${activeTab === 'profile' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
          <div className="flex items-center justify-center">
            <UserIcon className="h-5 w-5 mr-2" />
            <span>Profil</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-3 px-4 ${activeTab === 'security' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
          <div className="flex items-center justify-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            <span>Sécurité</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('delete')}
          className={`flex-1 py-3 px-4 ${activeTab === 'delete' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
        >
          <div className="flex items-center justify-center">
            <TrashIcon className="h-5 w-5 mr-2" />
            <span>Supprimer</span>
          </div>
        </button>
      </div>
      
      {/* Profil */}
      {activeTab === 'profile' && (
        <section className="bg-gray-800 rounded-xl p-6">
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
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Pseudo
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full p-2 bg-gray-700 rounded-lg border ${
                    !usernameAvailable && username !== originalUsername
                      ? 'border-red-500'
                      : 'border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {checking && (
                  <div className="absolute right-3 top-2.5">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
                
                {!checking && username && username !== originalUsername && (
                  <div className="absolute right-3 top-2.5">
                    {usernameAvailable ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {!checking && !usernameAvailable && username !== originalUsername && (
                <p className="text-red-500 text-sm mt-1">
                  Ce pseudo est déjà utilisé
                </p>
              )}
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
              className={`btn ${
                loading || !usernameAvailable || username === originalUsername || !username
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-6 py-2`}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Enregistrer les modifications'}
            </button>
          </form>
        </section>
      )}
      
      {/* Sécurité */}
      {activeTab === 'security' && (
        <section className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Sécurité</h2>
              <p className="text-gray-400">Gérez votre mot de passe</p>
            </div>
          </div>
          
          <form onSubmit={changePassword}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                Mot de passe actuel
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
                Nouveau mot de passe
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
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirmer le nouveau mot de passe
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
                  Les mots de passe ne correspondent pas
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
              className={`btn ${
                loading || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-6 py-2`}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Changer le mot de passe'}
            </button>
          </form>
        </section>
      )}
      
      {/* Suppression de compte */}
      {activeTab === 'delete' && (
        <section className="bg-gray-800 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-500 flex items-center">
              <TrashIcon className="h-6 w-6 mr-2" />
              Supprimer votre compte
            </h2>
          </div>
          
          <div className="bg-gray-900 border border-red-900/50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-red-400 mb-2">Attention</h3>
            <p className="text-gray-400 mb-2">
              Cette action est <span className="font-bold">permanente et irréversible</span>. Toutes vos données, y compris vos favoris et vos évaluations, seront définitivement supprimées.
            </p>
            <p className="text-gray-400">
              Si vous souhaitez simplement faire une pause, nous vous recommandons de vous déconnecter plutôt que de supprimer votre compte.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Confirmez en écrivant "SUPPRIMER"
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="SUPPRIMER"
            />
          </div>
          
          <button
            onClick={deleteAccount}
            disabled={loading || deleteConfirm !== 'SUPPRIMER'}
            className={`btn ${
              loading || deleteConfirm !== 'SUPPRIMER'
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            } text-white px-6 py-2`}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Supprimer définitivement mon compte'}
          </button>
        </section>
      )}
    </div>
  );
}