import { Metadata } from 'next';
import { UserSettingsClient } from '../../components/client/pages/UserSettingsClient';

export const metadata: Metadata = {
  title: 'Paramètres utilisateur | Rate-Em-All',
  description: 'Gérez vos paramètres de compte et vos préférences'
};

export default function SettingsPage() {
  return <UserSettingsClient />;
}