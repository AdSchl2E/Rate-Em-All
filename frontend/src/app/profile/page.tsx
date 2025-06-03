import { Metadata } from 'next';
import { ClientProfilePage } from '../../components/client/pages/ClientProfilePage';

export const metadata: Metadata = {
  title: 'Mon profil | Rate-Em-All',
  description: "Gérez votre profil et consultez vos Pokémon favoris",
};

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Mon profil</h1>
      <ClientProfilePage />
    </div>
  );
}
