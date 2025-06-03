import { Metadata } from 'next';
import { ClientLoginForm } from '../../components/client/forms/ClientLoginForm';

export const metadata: Metadata = {
  title: 'Connexion | Rate-Em-All',
  description: 'Connectez-vous à votre compte Rate-Em-All',
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <ClientLoginForm />
    </div>
  );
}
