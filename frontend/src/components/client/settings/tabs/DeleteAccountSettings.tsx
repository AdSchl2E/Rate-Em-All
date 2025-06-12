'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import clientApi from '@/lib/api/client';
import SettingsSection from '../ui/SettingsSection';

export default function DeleteAccountSettings() {
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Delete account
  const deleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') {
      toast.error('Veuillez saisir SUPPRIMER pour confirmer');
      return;
    }
    
    setLoading(true);
    try {
      // Utiliser notre nouvel API client
      await clientApi.user.deleteAccount();
      
      toast.success('Votre compte a été supprimé');
      
      // Sign out and redirect to home page
      signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Une erreur s'est produite lors de la suppression de votre compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection>
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
        className={`px-6 py-2 rounded-lg transition ${
          loading || deleteConfirm !== 'SUPPRIMER'
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700'
        } text-white`}
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Supprimer définitivement mon compte'}
      </button>
    </SettingsSection>
  );
}