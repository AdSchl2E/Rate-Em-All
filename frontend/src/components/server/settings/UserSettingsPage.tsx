import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions as auth } from '@/app/api/auth/[...nextauth]/route';
import SettingsContainer from '@/components/client/settings/SettingsContainer';

export async function UserSettingsPage() {
  // Server-side authentication check
  const session = await getServerSession(auth);
  
  // Redirect if user is not logged in
  if (!session) {
    redirect('/login?callbackUrl=/settings');
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <SettingsContainer />
    </div>
  );
}