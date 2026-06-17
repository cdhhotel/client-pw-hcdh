import { api } from '../../../services/api';

export const roomService = {
  // Obtener todas las habitaciones y hoteles de manera simultánea
  getInitialData: async () => {
    const [roomsRes, hotelsRes] = await Promise.all([
      api.get('/room/rooms'),
      api.get('/hotel/hotels')
    ]);
    
    const rooms = roomsRes.data || [];
    const hotels = Array.isArray(hotelsRes) ? hotelsRes : (hotelsRes.data || []);
    
    return { rooms, hotels };
  },

  // Eliminar habitación
  deleteRoom: async (id) => {
    return await api.delete(`/room/rooms/${id}`);
  },

  // Guardar o Actualizar habitación (Prepara el FormData)
  saveRoom: async (formData, isEditMode, selectedRoomId, keepImages, newImages) => {
    const submitData = new FormData();
    const optionalFields = ['nombre', 'descripcionCorta', 'descripcionLarga', 'tipoCamas', 'metrosCuadrados'];

    Object.keys(formData).forEach(key => {
      if (key === 'atributosExtra') {
        submitData.append('atributosExtra', JSON.stringify(formData.atributosExtra));
      } else if (optionalFields.includes(key) && !formData[key]) {
        // Omitir campos opcionales vacíos para evitar fallos de Zod en backend
      } else {
        submitData.append(key, formData[key]);
      }
    });

    // Agregar imágenes por subir
    newImages.forEach(imageFile => {
      submitData.append('imagenes', imageFile);
    });

    if (isEditMode) {
      submitData.append('imagenes_actuales', JSON.stringify(keepImages));
      return await api.put(`/room/rooms/${selectedRoomId}`, submitData);
    } else {
      return await api.post('/room/room-register', submitData);
    }
  }
};