import { useState, useEffect, createContext, useContext } from 'react';
import { User, authApi } from '../lib/api/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      console.log('checkUser: starting...');
      const user = await authApi.getCurrentUser();
      console.log('checkUser: completed, user:', user);
      setUser(user);
    } catch (error) {
      console.error('checkUser: error:', error);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    const { user, error } = await authApi.login(email, password);
    if (user) setUser(user);
    return { error };
  };

  const register = async (email: string, password: string, name?: string) => {
    const { user, error } = await authApi.register(email, password, name);
    if (user) setUser(user);
    return { error };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    navigate('/login');
  };

  const updateProfile = async (data: Partial<User>) => {
    const { user, error } = await authApi.updateProfile(data);
    if (user) setUser(user);
    return { error };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}