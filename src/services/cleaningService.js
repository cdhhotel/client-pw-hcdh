import { api } from './api';

/**
 * Número de teléfono del personal de limpieza / administración para recibir notificaciones por WhatsApp.
 */
import { sendCleaningWhatsAppNotification as sendWaNotification, DEFAULT_CLEANING_WHATSAPP_PHONE } from './whatsapp.service';

export const CLEANING_WHATSAPP_PHONE = DEFAULT_CLEANING_WHATSAPP_PHONE;

export const sendCleaningWhatsAppNotification = (roomNumber, roomName = '', guestName = '', notes = '') => {
  return sendWaNotification(roomNumber, roomName, guestName, notes);
};

/**
 * Actualiza el estatus de una habitación en el servidor.
 */
export const updateRoomStatus = async (roomId, newStatus) => {
  return await api.put(`/room/rooms/${roomId}`, { estatus: newStatus });
};

/**
 * Calcula el número de días de estancia entre dos fechas.
 */
export const getStayDays = (fechaEntrada, fechaSalida) => {
  if (!fechaEntrada || !fechaSalida) return 0;
  const start = new Date(fechaEntrada);
  const end = new Date(fechaSalida);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
