import SignupForm from '@/components/client/auth/SignupForm';

export function SignupPage() {
  // Les composants serveur peuvent effectuer des opérations de rendu initial sans JavaScript côté client
  // Ils peuvent aussi précharger des données si nécessaire
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800/50 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">Créer un compte</h1>
      
      {/* Injection du composant client pour la partie interactive */}
      <SignupForm />
      
      {/* Partie statique rendue par le serveur */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>En créant un compte, vous acceptez notre politique de confidentialité et nos conditions d'utilisation.</p>
        <p className="mt-2">Vos données personnelles ne seront jamais partagées avec des tiers.</p>
      </div>
    </div>
  );
}