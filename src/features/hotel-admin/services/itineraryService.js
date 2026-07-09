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
    // Ya no enviamos FormData, enviamos JSON normal
    const payload = { ...formData };
    // Limpiamos campos no necesarios
    delete payload.imagenFile;
    delete payload.remove_image;

    if (isEditMode) {
      return await api.put(`/hotel/sitios-cercanos/${selectedId}`, payload);
    } else {
      return await api.post('/hotel/sitios-cercanos', payload);
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
    const payload = { ...formData };
    if (isEditMode) {
      return await api.put(`/hotel/eventos-locales/${selectedId}`, payload);
    } else {
      return await api.post('/hotel/eventos-locales', payload);
    }
  },
};
