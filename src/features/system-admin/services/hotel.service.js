import { api } from '../../../services/api';

export const hotelService = {
  /**
   * Obtiene la información del hotel por ID
   */
  getById(id) {
    return api.get(`/hotel/hotels/${id}`);
  },

  /**
   * Actualiza los campos permitidos de un hotel
   */
  update(id, data) {
    return api.put(`/hotel/hotels/${id}`, data);
  },
};
