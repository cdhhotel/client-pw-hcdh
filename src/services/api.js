const API_BASE_URL = '/api';

/**
 * Cliente API centralizado que envuelve fetch.
 * Detecta automáticamente FormData y NO serializa ni sobreescribe Content-Type en ese caso,
 * ya que el navegador lo hace solo (incluyendo el boundary del multipart).
 */
export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('casa_dolores_token');

    const isFormData = options.body instanceof FormData || options.data instanceof FormData;

    const headers = { ...options.headers };

    // Solo añadir Content-Type JSON si NO es FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };


    // Manejar body enviado como `data` (estilo axios) o como `body` directo
    if (config.data instanceof FormData) {
      config.body = config.data;
      delete config.data;
    } else if (config.data && typeof config.data === 'object') {
      config.body = JSON.stringify(config.data);
      delete config.data;
    } else if (config.body && !isFormData && typeof config.body === 'object') {
      // Serializar a JSON solo si el body es un objeto plano (no FormData)
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Sesión expirada o token inválido
      if (response.status === 401) {
        localStorage.removeItem('casa_dolores_token');
        localStorage.removeItem('casa_dolores_user');
        if (!endpoint.includes('/auth/login')) {
          window.location.href = '/login?expired=true';
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverMsg = data.message || data.error || JSON.stringify(data);
        console.error(`API ${response.status} [${endpoint}]:`, serverMsg);
        throw new Error(serverMsg || 'Ocurrió un error en la petición');
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
