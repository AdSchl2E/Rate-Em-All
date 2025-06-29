'use client';

import { motion } from 'framer-motion';
import { Session } from 'next-auth';
import Link from 'next/link';
import SettingsTabs from './SettingsTabs';
import AuthenticationGuard from '@/components/client/shared/AuthenticationGuard';

interface SettingsContainerProps {
  session: Session | null;
}

/**
 * SettingsContainer component
 * Main container for the user settings page
 * 
 * @param {Object} props - Component props
 * @param {Session|null} props.session - User session data
 * @returns {JSX.Element} Settings container with tabs
 */
export default function SettingsContainer({ session }: SettingsContainerProps) {
  return (
    <AuthenticationGuard
      fallback={
        <div className="text-center py-10">
          <p className="mb-4">Please log in to access your settings.</p>
          <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
            Log in
          </Link>
        </div>
      }
    >
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gray-900/50 rounded-xl p-6 shadow-lg">
          <SettingsTabs session={session} />
        </div>
      </motion.div>
    </AuthenticationGuard>
  );
}