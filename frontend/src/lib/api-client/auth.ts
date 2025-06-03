import { API_CONFIG } from '../api-config';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  pseudo?: string;
}

export async function registerUser(userData: RegisterUserData) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erreur lors de l\'inscription');
  }

  return response.json();
}

export async function getUserProfile(accessToken: string) {
  const response = await fetch('/api/user/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }

  return response.json();
}