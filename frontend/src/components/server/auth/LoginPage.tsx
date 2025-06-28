import { serverAuth } from '@/lib/api/server';
import LoginForm from '@/components/client/auth/LoginForm';

export function LoginPage() {
  // This server component can pre-load data if needed
  // Server components can perform initial rendering without client-side JavaScript
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800/50 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      
      {/* Inject client component for interactive part */}
      <LoginForm />
      
      {/* Static part rendered by server */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>By logging in, you agree to our privacy policy and terms of use.</p>
      </div>
    </div>
  );
}