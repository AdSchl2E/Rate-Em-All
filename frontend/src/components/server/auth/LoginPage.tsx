import { serverAuth } from '@/lib/api/server';
import LoginForm from '@/components/client/auth/LoginForm';

export function LoginPage() {
  // Ce composant serveur peut pré-charger des données si nécessaire
  // Les composants serveur peuvent effectuer des opérations de rendu initial sans JavaScript côté client
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800/50 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">Connexion</h1>
      
      {/* Injection du composant client pour la partie interactive */}
      <LoginForm />
      
      {/* Partie statique rendue par le serveur */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>En vous connectant, vous acceptez notre politique de confidentialité et conditions d'utilisation.</p>
      </div>
    </div>
  );
}