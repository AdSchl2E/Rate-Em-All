import { Metadata } from 'next';
import { UserSettingsPage } from '@/components/server/settings/UserSettingsPage';

export const metadata: Metadata = {
  title: 'Paramètres utilisateur | Rate-Em-All',
  description: 'Gérez vos paramètres de compte et vos préférences'
};

export default function Page() {
  return <UserSettingsPage />;
}