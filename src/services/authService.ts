import { AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/api/v1/auth';

// Interface pour les options de requête personnalisées
interface RequestOptions extends Omit<RequestInit, 'headers'> {
  authorized?: boolean;
  headers?: Record<string, string>;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await this.fetchWithAuth(`${API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        authorized: false
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

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
      const response = await this.fetchWithAuth(`${API_URL}/create-user`, {
        method: 'POST',
        body: JSON.stringify(userData),
        authorized: true
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  },

  async fetchWithAuth(url: string, options: RequestOptions = {}): Promise<Response> {
    const { authorized = true, headers = {}, ...restOptions } = options;

    // Construction des headers
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Ajout du token si la requête doit être authentifiée
    if (authorized) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: finalHeaders
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Erreur inconnue'
      }));
      
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      throw new Error(errorData.message || 'Erreur lors de la requête');
    }

    return response;
  },

  getAuthorizationHeader(): string {
    const token = localStorage.getItem('authToken');
    return token ? `Bearer ${token}` : '';
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return Boolean(token);
  },

  logout(): void {
    localStorage.removeItem('authToken');
  }
};

// Factory pour créer des services API authentifiés
export const createApiService = (baseUrl: string) => ({
  async get<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    const response = await authService.fetchWithAuth(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'GET'
    });
    return response.json();
  },

  async post<T>(endpoint: string, data: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    const response = await authService.fetchWithAuth(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async put<T>(endpoint: string, data: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    const response = await authService.fetchWithAuth(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    const response = await authService.fetchWithAuth(`${baseUrl}${endpoint}`, {
      ...options,
      method: 'DELETE'
    });
    return response.json();
  }
});