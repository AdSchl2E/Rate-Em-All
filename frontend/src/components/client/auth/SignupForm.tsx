'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import clientApi from '@/lib/api/client';

/**
 * SignupForm component
 * Handles user registration and automatic login after successful signup
 */
export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pseudo: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle input field changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event from input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user modifies the field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form fields before submission
   * @returns {boolean} - True if validation passes, false otherwise
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pseudo) {
      newErrors.pseudo = 'Please enter a username';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please enter a password';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission for signup
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use our new client API
      await clientApi.auth.register({
        pseudo: formData.pseudo,
        password: formData.password
      });
      
      toast.success('Account created successfully');
      
      // Automatic login
      const signInResult = await signIn('credentials', {
        pseudo: formData.pseudo,
        password: formData.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        console.error('Auto-login error:', signInResult.error);
        toast.error("Account created but error during automatic login");
        router.push('/login');
      } else {
        toast.success('Welcome to Rate \'em All!');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific errors returned by API
      if (error.message?.includes('pseudo already exists')) {
        setErrors(prev => ({ ...prev, pseudo: 'This username is already taken' }));
      } else {
        toast.error(error.message || 'An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="pseudo">
          Username
        </label>
        <input
          id="pseudo"
          name="pseudo"
          type="text"
          value={formData.pseudo}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.pseudo ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          placeholder="PokeMaster"
        />
        {errors.pseudo && <p className="mt-1 text-sm text-red-500">{errors.pseudo}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white`}
          placeholder="8 characters minimum"
          autoComplete="new-password"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
          Confirm Password
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
            Signing up...
          </>
        ) : 'Create account'}
      </button>
      
      <div className="text-center mt-4">
        <p>Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-blue-500 hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}