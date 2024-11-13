import { AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/api/v1/auth';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la connexion');
      }

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      // Vérification du token
      if (!data.token) {
        console.error('Structure de la réponse:', data);
        throw new Error('Token manquant dans la réponse');
      }

      // Stockage du token
      localStorage.setItem('authToken', data.token);

      return {
        token: data.token,
        username: data.username,
        role: data.role,
        email: data.email
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role: string
  }): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token utilisé pour la création:', token);

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_URL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'inscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  },

  getAuthorizationHeader() {
    const token = localStorage.getItem('authToken');
    return token ? `Bearer ${token}` : '';
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return Boolean(token);
  },

  logout() {
    localStorage.removeItem('authToken');
  }
};