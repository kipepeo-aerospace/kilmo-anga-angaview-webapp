import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('kilimo-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data (in real app, this would come from API)
    const mockUser: User = {
      clientId: 'client001',
      email,
      signupDate: '2024-01-15'
    };
    
    setUser(mockUser);
    localStorage.setItem('kilimo-user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (clientId: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock signup with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      clientId,
      email,
      signupDate: new Date().toISOString().split('T')[0]
    };
    
    setUser(newUser);
    localStorage.setItem('kilimo-user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kilimo-user');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};