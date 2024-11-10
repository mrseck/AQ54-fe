import { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, AuthUser } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state from localStorage during the initial render
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return {
          token,
          user,
          isAuthenticated: true,
        };
      }
    } catch  {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  });

  // Simplified useEffect that only handles initial auth state check
  useEffect(() => {
    // Just mark loading as complete after initial auth check
    setLoading(false);
  }, []);

  const login = (token: string, user: AuthUser) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        token,
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const contextValue = {
    ...authState,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};