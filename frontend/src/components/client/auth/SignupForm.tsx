'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import clientApi from '@/lib/api/client';

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    pseudo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Veuillez entrer votre nom';
    }
    
    if (!formData.email) {
      newErrors.email = 'Veuillez entrer votre email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.pseudo) {
      newErrors.pseudo = 'Veuillez choisir un pseudo';
    }
    
    if (!formData.password) {
      newErrors.password = 'Veuillez entrer un mot de passe';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Utiliser notre nouvelle API client
      await clientApi.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        pseudo: formData.pseudo
      });
      
      toast.success('Compte créé avec succès');
      
      // Connexion automatique
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        console.error('Auto-login error:', signInResult.error);
        toast.error("Création réussie mais erreur lors de la connexion automatique");
        router.push('/login');
      } else {
        toast.success('Bienvenue sur Rate-Em-All!');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Gestion des erreurs spécifiques retournées par l'API
      if (error.message?.includes('email already exists')) {
        setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
      } else if (error.message?.includes('pseudo already exists')) {
        setErrors(prev => ({ ...prev, pseudo: 'Ce pseudo est déjà pris' }));
      } else {
        toast.error(error.message || 'Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          placeholder="John Doe"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          placeholder="votre@email.com"
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="pseudo">
          Pseudo
        </label>
        <input
          id="pseudo"
          name="pseudo"
          type="text"
          value={formData.pseudo}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.pseudo ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          placeholder="PokéMaster"
        />
        {errors.pseudo && <p className="mt-1 text-sm text-red-500">{errors.pseudo}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          placeholder="8 caractères minimum"
          autoComplete="new-password"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          autoComplete="new-password"
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
            Inscription en cours...
          </>
        ) : 'Créer un compte'}
      </button>
      
      <div className="text-center mt-4">
        <p>Déjà un compte?{' '}
          <Link 
            href="/login" 
            className="text-blue-500 hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}