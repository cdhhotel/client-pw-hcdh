import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    name: user.name || (user.nombre ? `${user.nombre} ${user.apellidos || ''}`.trim() : ''),
    role: user.role || user.rol?.nombre || ''
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión al cargar
    const storedUser = localStorage.getItem('casa_dolores_user');
    const storedToken = localStorage.getItem('casa_dolores_token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(normalizeUser(parsed));
      } catch (e) {
        console.error('Error restaurando sesión:', e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const register = async (nombre, apellidos, email, telefono, password) => {
    try {
      // El endpoint /auth/register devuelve solo el usuario creado (sin token).
      // Por eso, tras el registro exitoso, llamamos a login para obtener el token
      // y establecer la sesión automáticamente.
      await api.post('/auth/register', { nombre, apellidos, email, telefono, password });

      // Login automático tras registro exitoso
      const loggedUser = await login(email, password);
      return loggedUser;
    } catch (error) {
      console.warn('Fallo en registro de usuario:', error);
      const message = error?.message || 'Error al registrar usuario';
      throw new Error(message);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      // Soporta ambas formas de respuesta:
      // 1) { token, user }
      // 2) { success: true, data: { token, user } }
      const payload = res?.data ?? res;
      const token = payload?.token ?? payload?.data?.token;
      const rawUser = payload?.user ?? payload?.data?.user;

      if (token && rawUser) {
        const normalized = normalizeUser(rawUser);
        localStorage.setItem('casa_dolores_token', token);
        localStorage.setItem('casa_dolores_user', JSON.stringify(normalized));
        setUser(normalized);
        return normalized;
      }
      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.warn('Fallo de API de autenticación, simulando login para desarrollo local:', error);

      // Fallback para desarrollo si las credenciales son las de prueba
      if (email === 'admin@casadolores.com' && password === 'admin123') {
        const mockUser = normalizeUser({ id: 1, name: 'Administrador Casa Dolores', email, role: 'admin-sistema' });
        const mockToken = 'mock_token_jwt_casa_dolores';

        localStorage.setItem('casa_dolores_token', mockToken);
        localStorage.setItem('casa_dolores_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      }

      const message = error?.message || 'Credenciales incorrectas (Usa admin@casadolores.com / admin123 para desarrollo)';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('casa_dolores_token');
    localStorage.removeItem('casa_dolores_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin-sistema' || user?.role === 'admin-hotel' || user?.role === 'admin' }}>
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
