import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión al cargar
    const storedUser = localStorage.getItem('casa_dolores_user');
    const storedToken = localStorage.getItem('casa_dolores_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error restaurando sesión:', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Intentamos llamar a la API real
      const data = await api.post('/auth/login', { email, password });
      
      if (data.token && data.user) {
        localStorage.setItem('casa_dolores_token', data.token);
        localStorage.setItem('casa_dolores_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.warn('Fallo de API de autenticación, simulando login para desarrollo local:', error);
      
      // Fallback para desarrollo si el servidor aún no tiene implementado /auth/login
      if (email === 'admin@casadolores.com' && password === 'admin123') {
        const mockUser = { id: 1, name: 'Administrador Casa Dolores', email, role: 'admin' };
        const mockToken = 'mock_token_jwt_casa_dolores';
        
        localStorage.setItem('casa_dolores_token', mockToken);
        localStorage.setItem('casa_dolores_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      }
      
      throw new Error('Credenciales incorrectas (Usa admin@casadolores.com / admin123 para desarrollo)');
    }
  };

  const logout = () => {
    localStorage.removeItem('casa_dolores_token');
    localStorage.removeItem('casa_dolores_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
