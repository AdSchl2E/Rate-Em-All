/**
 * Server component for the login page
 * Contains the layout and imports the client-side LoginForm component
 */
import { Suspense } from "react";
import { LoginForm } from "@/components/client/auth/LoginForm";

export function LoginPage() {
  // Server component can perform initial rendering without client-side JavaScript
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800/50 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      
      {/* Inject client component for interactive part */}
      <Suspense fallback={<div className="animate-pulse bg-gray-700 h-64 rounded"></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}