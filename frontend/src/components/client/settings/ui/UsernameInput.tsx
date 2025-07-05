'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  originalUsername?: string;
  onAvailabilityChange?: (available: boolean) => void;
  disabled?: boolean;
}

/**
 * UsernameInput component
 * Input field for username with availability checking
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current username value
 * @param {Function} props.onChange - Callback for username changes
 * @param {string} [props.originalUsername=''] - Original username for comparison
 * @param {Function} [props.onAvailabilityChange] - Callback when availability changes
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @returns {JSX.Element} Username input with validation feedback
 */
export default function UsernameInput({ 
  value, 
  onChange, 
  originalUsername = '',
  onAvailabilityChange = () => {},
  disabled = false
}: UsernameInputProps) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(true);
  
  // Check username availability
  useEffect(() => {
    if (value && value !== originalUsername) {
      const checkUsername = async () => {
        setChecking(true);
        try {
          const result = await api.user.checkUsername(value);
          setAvailable(result.available);
          onAvailabilityChange(result.available);
        } catch (error) {
          console.error('Error checking username:', error);
          setAvailable(false);
          onAvailabilityChange(false);
        } finally {
          setChecking(false);
        }
      };
      
      // Debounce the check
      const timeout = setTimeout(checkUsername, 500);
      return () => clearTimeout(timeout);
    } else {
      setAvailable(true);
      onAvailabilityChange(true);
    }
  }, [value, originalUsername, onAvailabilityChange]);

  return (
    <div>
      <label htmlFor="username" className="block text-sm font-medium mb-1">
        Username
      </label>
      <div className="relative">
        <input
          type="text"
          id="username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full p-2 ${disabled ? 'bg-gray-700/50 cursor-not-allowed' : 'bg-gray-700'} rounded-lg border ${
            !available && value !== originalUsername
              ? 'border-red-500'
              : 'border-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {checking && (
          <div className="absolute right-3 top-2.5">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {!checking && value && value !== originalUsername && (
          <div className="absolute right-3 top-2.5">
            {available ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {!checking && !available && value !== originalUsername && (
        <p className="text-red-500 text-sm mt-1">
          This username is already taken
        </p>
      )}
    </div>
  );
}