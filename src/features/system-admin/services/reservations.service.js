import { api } from '../../../services/api';

export const reservationsService = {
  /**
   * Obtiene todas las reservaciones
   */
  getAll() {
    return api.get('/reservations');
  },

  /**
   * Cancela una reservación por ID
   */
  cancel(id) {
    return api.post(`/reservations/${id}/cancelar`);
  },

  confirm(id) {
    return api.post(`/reservations/${id}/confirmar`);
  },

  /**
   * Elimina una reservación por ID
   */
  delete(id) {
    return api.delete(`/reservations/${id}`);
  }
}

