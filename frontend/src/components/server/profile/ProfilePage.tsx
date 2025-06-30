import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions as auth } from '@/app/api/auth/[...nextauth]/route';
import ProfileContainer from '@/components/client/profile/ProfileContainer';

/**
 * ProfilePage component
 * 
 * Server component that renders the user profile page.
 * Performs server-side authentication check and redirects if not authenticated.
 * 
 * @returns React server component
 */
export async function ProfilePage() {
  // Check authentication server-side
  const session = await getServerSession(auth);
  
  // Redirect if not logged in
  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="sr-only">My Profile</h1>
      <ProfileContainer />
    </div>
  );
}