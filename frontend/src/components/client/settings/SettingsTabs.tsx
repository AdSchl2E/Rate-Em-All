'use client';

import { motion } from 'framer-motion';
import { UserIcon, KeyIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SettingsTab } from './SettingsContainer';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    {
      id: 'profile' as SettingsTab,
      label: 'Profil',
      icon: UserIcon,
      activeClass: 'bg-blue-600',
    },
    {
      id: 'security' as SettingsTab,
      label: 'Sécurité',
      icon: KeyIcon,
      activeClass: 'bg-blue-600',
    },
    {
      id: 'delete' as SettingsTab,
      label: 'Supprimer',
      icon: TrashIcon,
      activeClass: 'bg-red-600',
    },
  ];

  return (
    <motion.div 
      className="flex mb-6 bg-gray-800 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 transition-colors ${
            activeTab === tab.id ? tab.activeClass : 'hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center">
            <tab.icon className="h-5 w-5 mr-2" />
            <span>{tab.label}</span>
          </div>
        </button>
      ))}
    </motion.div>
  );
}