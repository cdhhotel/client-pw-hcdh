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

  // Guardar o Actualizar habitación (Prepara el FormData en snake_case)
  saveRoom: async (formData, isEditMode, selectedRoomId, keepImages, newImages) => {
    const submitData = new FormData();

    // Mapa camelCase → snake_case para que el servidor reciba exactamente lo que espera Zod
    const fieldMap = {
      hotelId:          'hotel_id',
      numero:           'numero',
      nombre:           'nombre',
      tipoHabitacion:   'tipo_habitacion',
      descripcionCorta: 'descripcion_corta',
      descripcionLarga: 'descripcion_larga',
      precioBaseNoche:  'precio_base_noche',
      capacidadMaxima:  'capacidad_maxima',
      numeroCamas:      'numero_camas',
      tipoCamas:        'tipo_camas',
      metrosCuadrados:  'metros_cuadrados',
      estatus:          'estatus',
    };

    // Campos opcionales que se omiten si están vacíos
    const optionalSnakeKeys = new Set([
      'nombre', 'descripcion_corta', 'descripcion_larga', 'tipo_camas', 'metros_cuadrados'
    ]);

    Object.keys(formData).forEach(key => {
      if (key === 'atributosExtra') {
        // El servidor acepta tanto atributosExtra como atributos_extra
        submitData.append('atributos_extra', JSON.stringify(formData.atributosExtra));
        return;
      }
      const snakeKey = fieldMap[key] ?? key;
      const value = formData[key];
      if (optionalSnakeKeys.has(snakeKey) && !value) return; // omitir opcionales vacíos
      submitData.append(snakeKey, value);
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