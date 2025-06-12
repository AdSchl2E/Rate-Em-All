'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import clientApi from '@/lib/api/client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        // Message d'erreur plus précis
        if (result.error === 'CredentialsSignin') {
          toast.error('Email ou mot de passe incorrect');
        } else {
          toast.error(`Erreur: ${result.error}`);
        }
      } else {
        toast.success('Connexion réussie!');
        
        try {
          // Utiliser notre nouvelle API client pour récupérer le profil
          await clientApi.auth.getProfile();
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue anyway with redirection
        }
        
        router.push('/');
        router.refresh(); // Rafraîchir l'état de session
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
          placeholder="votre@email.com"
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium" htmlFor="password">
            Mot de passe
          </label>
          <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
            Mot de passe oublié?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
          required
          autoComplete="current-password"
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
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion en cours...
          </>
        ) : 'Se connecter'}
      </button>
      
      <div className="text-center mt-4">
        <p>Pas encore de compte?{' '}
          <Link 
            href="/signup" 
            className="text-blue-500 hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </form>
  );
}