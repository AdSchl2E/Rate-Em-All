'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useGlobal } from '@/providers/GlobalProvider';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';
import Link from 'next/link';
import SettingsHeader from './SettingsHeader';
import SettingsTabs from './SettingsTabs';
import ProfileSettings from './tabs/ProfileSettings';
import SecuritySettings from './tabs/SecuritySettings';
import DeleteAccountSettings from './tabs/DeleteAccountSettings';
import AuthenticationGuard from '@/components/client/shared/AuthenticationGuard';

export type SettingsTab = 'profile' | 'security' | 'delete';

export default function SettingsContainer() {
  const { data: session } = useSession();
  const { favorites, userRatings } = useGlobal();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // User stats for display
  const userStats = {
    createdAt: session?.user?.createdAt
      ? new Date(session.user.createdAt)
      : new Date(),
    favoritesCount: favorites?.length || 0,
    ratedCount: Object.keys(userRatings).length || 0,
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'delete':
        return <DeleteAccountSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <AuthenticationGuard
      fallback={
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">User Settings</h1>
          <p className="mb-6">Please log in to access your settings</p>
          <Link 
            href="/login?callbackUrl=/settings" 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block transition"
          >
            Login
          </Link>
        </div>
      }
    >
      <div className="animate-fade-in max-w-4xl mx-auto">
        {/* Header and stats */}
        <SettingsHeader stats={userStats} />
        
        {/* Tab navigation */}
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Active tab content */}
        {renderTabContent()}
      </div>
    </AuthenticationGuard>
  );
}