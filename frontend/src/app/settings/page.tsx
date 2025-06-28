import { Metadata } from 'next';
import { UserSettingsPage } from '@/components/server/settings/UserSettingsPage';

export const metadata: Metadata = {
  title: 'User Settings | Rate \'em All',
  description: 'Manage your account settings and preferences'
};

export default function Page() {
  return <UserSettingsPage />;
}