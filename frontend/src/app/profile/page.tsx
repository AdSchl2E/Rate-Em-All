import { Metadata } from 'next';
import { ProfilePage } from '@/components/server/profile/ProfilePage';

export const metadata: Metadata = {
  title: 'Mon profil | Rate-Em-All',
  description: "Gérez votre profil et consultez vos Pokémon favoris et vos notes",
};

export default function Page() {
  return <ProfilePage />;
}
