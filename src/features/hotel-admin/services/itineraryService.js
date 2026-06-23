import { api } from '../../../services/api';

export const itineraryService = {
  /** Lista todas las actividades de itinerario */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/itinerary/itinerary?${params}` : '/itinerary/itinerary';
    const result = await api.get(endpoint);
    return result.data || [];
  },

  /** Elimina una actividad */
  delete: async (id) => {
    return await api.delete(`/itinerary/itinerary/${id}`);
  },

  /** Crea o actualiza una actividad de itinerario */
  save: async (formData, isEditMode, selectedId) => {
    const submitData = new FormData();

    // Campos de texto
    const fields = [
      'nombre', 'horario_inicio', 'horario_fin', 'disponibilidad',
      'usuario_id', 'reservacion_id', 'sitio_cercano_id',
      'descripcion', 'categoria', 'remove_image',
    ];

    fields.forEach((key) => {
      const val = formData[key];
      if (val !== undefined && val !== null && val !== '') {
        submitData.append(key, val);
      }
    });

    // Imagen (File object)
    if (formData.imagenFile) {
      submitData.append('imagen', formData.imagenFile);
    }

    if (isEditMode) {
      return await api.put(`/itinerary/itinerary/${selectedId}`, submitData);
    } else {
      return await api.post('/itinerary/itinerary-register', submitData);
    }
  },

  /** Obtiene lista de sitios cercanos para el selector del formulario admin */
  getSitiosCercanos: async () => {
    try {
      const result = await api.get('/hotel/sitios-cercanos');
      return result.data || [];
    } catch {
      return [];
    }
  },
};
