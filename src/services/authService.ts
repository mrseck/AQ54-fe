  // src/services/authService.ts
  import { AuthResponse } from '../types/auth';

  const API_URL = 'http://localhost:3000/api/v1/auth';

  export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Échec de la connexion');
      }

      return response.json();
    },

    async register(userData: {
      username: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }): Promise<AuthResponse> {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Échec de l\'inscription');
      }

      return response.json();
    },
  };