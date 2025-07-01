import SignupForm from '@/components/client/auth/SignupForm';

export function SignupPage() {
  // Server components can perform initial rendering without client-side JavaScript
  // They can also preload data if needed
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800/50 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
      
      {/* Inject client component for interactive part */}
      <SignupForm />
      
    </div>
  );
}