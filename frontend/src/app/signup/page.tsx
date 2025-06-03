import { Metadata } from 'next';
import { ClientSignupForm } from '../../components/client/forms/ClientSignupForm';

export const metadata: Metadata = {
  title: 'Inscription | Rate-Em-All',
  description: 'Créez votre compte Rate-Em-All pour noter et sauvegarder vos Pokémon préférés',
};

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inscription</h1>
      <ClientSignupForm />
    </div>
  );
}
