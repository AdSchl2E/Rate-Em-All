import { Metadata } from 'next';
import { ProfilePage } from '@/components/server/profile/ProfilePage';

export const metadata: Metadata = {
  title: "My Profile | Rate 'em All",
  description: "Manage your profile and view your favorite Pokémon and ratings",
};

export default function Page() {
  return <ProfilePage />;
}
