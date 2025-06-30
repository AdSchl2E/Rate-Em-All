'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { SecuritySettings } from './tabs/SecuritySettings';
import { DeleteAccountSettings } from './tabs/DeleteAccountSettings';

interface SettingsTabsProps {
  session: Session | null;
}

type TabId = 'security' | 'delete-account';

/**
 * SettingsTabs component
 * Tabbed interface for user settings sections
 * 
 * @param {Object} props - Component props
 * @param {Session|null} props.session - User session data
 * @returns {JSX.Element} Settings tabs with tab-specific content
 */
export default function SettingsTabs({ session }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('security');
  
  /**
   * Get CSS classes for tab button based on active state
   * @param {TabId} tabId - ID of the tab to check
   * @returns {string} CSS classes for the tab
   */
  const getTabClasses = (tabId: TabId) => {
    return activeTab === tabId
      ? 'bg-blue-500 text-white'
      : 'hover:bg-gray-700 text-gray-300';
  };
  
  return (
    <div>
      {/* Tabs navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b border-gray-700 mb-6 pb-2">
        
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-md flex items-center transition ${getTabClasses('security')}`}
        >
          <LockClosedIcon className="h-5 w-5 mr-2" />
          <span>Security</span>
        </button>
        
        <button
          onClick={() => setActiveTab('delete-account')}
          className={`px-4 py-2 rounded-md flex items-center transition ${getTabClasses('delete-account')}`}
        >
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <span>Delete Account</span>
        </button>
      </div>
      
      {/* Tab content */}
      <div className="space-y-6">
        
        {activeTab === 'security' && (
          <SecuritySettings />
        )}
        
        {activeTab === 'delete-account' && (
          <DeleteAccountSettings />
        )}
      </div>
    </div>
  );
}