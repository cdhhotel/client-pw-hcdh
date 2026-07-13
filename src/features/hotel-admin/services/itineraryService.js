import { api } from '../../../services/api';

export const itineraryService = {
  /** Lista todas las actividades/sitios cercanos */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/hotel/sitios-cercanos?${params}` : '/hotel/sitios-cercanos';
    const result = await api.get(endpoint);
    // Extraemos `data` ya que el backend devuelve { success: true, data: [...] }
    return result.data?.data || result.data || [];
  },

  /** Elimina una actividad */
  delete: async (id) => {
    return await api.delete(`/hotel/sitios-cercanos/${id}`);
  },

  /** Crea o actualiza una actividad / sitio cercano */
  save: async (formData, isEditMode, selectedId) => {
    const data = new FormData();
    for (const key in formData) {
      if (key === 'imagenFile' && formData[key]) {
        data.append('imagenFile', formData[key]);
      } else if (key !== 'imagenFile' && key !== 'remove_image') {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== '') {
          if (typeof val === 'object' && !(val instanceof File)) {
            data.append(key, JSON.stringify(val));
          } else {
            data.append(key, val);
          }
        }
      }
    }

    if (isEditMode) {
      return await api.put(`/hotel/sitios-cercanos/${selectedId}`, data);
    } else {
      return await api.post('/hotel/sitios-cercanos', data);
    }
  },

  /** Obtiene lista de sitios cercanos (ahora hace lo mismo que getAll, pero lo dejamos por retrocompatibilidad temporal si se necesita en otro lado) */
  getSitiosCercanos: async () => {
    try {
      const result = await api.get('/hotel/sitios-cercanos');
      return result.data?.data || result.data || [];
    } catch {
      return [];
    }
  },

  /** Lista todos los eventos locales */
  getEventos: async () => {
    const result = await api.get('/hotel/eventos-locales');
    return result.data?.data || result.data || [];
  },

  /** Elimina un evento local */
  deleteEvento: async (id) => {
    return await api.delete(`/hotel/eventos-locales/${id}`);
  },

  /** Crea o actualiza un evento local */
  saveEvento: async (formData, isEditMode, selectedId) => {
    const data = new FormData();
    for (const key in formData) {
      if (key === 'imagenFile' && formData[key]) {
        data.append('imagenFile', formData[key]);
      } else if (key !== 'imagenFile' && key !== 'remove_image') {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== '') {
          if (typeof val === 'object' && !(val instanceof File)) {
            data.append(key, JSON.stringify(val));
          } else {
            data.append(key, val);
          }
        }
      }
    }

    if (isEditMode) {
      return await api.put(`/hotel/eventos-locales/${selectedId}`, data);
    } else {
      return await api.post('/hotel/eventos-locales', data);
    }
  },
};
