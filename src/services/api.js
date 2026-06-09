const API_BASE_URL = '/api';

/**
 * Cliente API centralizado que envuelve fetch
 */
export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('casa_dolores_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // En caso de sesión expirada o token inválido
      if (response.status === 401) {
        localStorage.removeItem('casa_dolores_token');
        localStorage.removeItem('casa_dolores_user');
        // Opcional: recargar para forzar redirección en rutas protegidas
        if (!endpoint.includes('/auth/login')) {
          window.location.href = '/login?expired=true';
        }
      }

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error en la petición');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
