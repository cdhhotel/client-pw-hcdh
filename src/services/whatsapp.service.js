/**
 * Servicio centralizado para generación y envío de notificaciones por WhatsApp.
 */

// Teléfono predeterminado del personal de limpieza / administración (modificable según requerimiento)
export const DEFAULT_CLEANING_WHATSAPP_PHONE = '524181234567';

/**
 * Formatea un número telefónico para la URL de WhatsApp wa.me
 * Si es un número de México de 10 dígitos, le antepone la clave de país 52.
 */
export const formatWhatsAppPhone = (phone) => {
  if (!phone) return '';
  // Eliminar todo lo que no sea dígito
  let cleanPhone = String(phone).replace(/\D/g, '');
  
  // Si el número tiene 10 dígitos (estándar México), agregar prefijo 52
  if (cleanPhone.length === 10) {
    cleanPhone = `52${cleanPhone}`;
  }
  return cleanPhone;
};

/**
 * Abre la URL de WhatsApp en una pestaña nueva con el número y mensaje proporcionados.
 */
export const openWhatsAppUrl = (phone, message) => {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedMsg = encodeURIComponent(message);
  const url = formattedPhone 
    ? `https://wa.me/${formattedPhone}?text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;
    
  window.open(url, '_blank');
};

/**
 * Notificación por WhatsApp al personal de limpieza.
 */
export const sendCleaningWhatsAppNotification = (roomNumber, roomName = '', guestName = '', notes = '', targetPhone = DEFAULT_CLEANING_WHATSAPP_PHONE) => {
  const roomInfo = roomName ? `#${roomNumber} (${roomName})` : `#${roomNumber}`;
  const guestInfo = guestName ? `\n*Huésped:* ${guestName}` : '';
  const extraNotes = notes ? `\n*Nota:* ${notes}` : '';

  const message = `🧹 *SOLICITUD DE LIMPIEZA*\n\n` +
    `La habitación *${roomInfo}* requiere servicio de *LIMPIEZA Y REACONDICIONAMIENTO*.${guestInfo}${extraNotes}\n\n` +
    `Por favor realizar el aseo correspondiente.`;

  openWhatsAppUrl(targetPhone, message);
};

/**
 * Envia el comprobante / resumen de la reservación directamente al WhatsApp del huésped.
 */
export const sendGuestReservationWhatsApp = (reservation) => {
  if (!reservation) return;

  const mainGuest = reservation.huesped_reservacion?.find(hr => hr.es_principal)?.huesped 
    || reservation.huesped_reservacion?.[0]?.huesped
    || {};

  const guestName = mainGuest.nombre ? `${mainGuest.nombre} ${mainGuest.apellidos || ''}`.trim() : 'Huésped';
  const guestPhone = mainGuest.telefono || '';

  const roomNum = reservation.habitacion?.numero || 'N/A';
  const roomName = reservation.habitacion?.nombre || '';
  const roomInfo = roomName ? `#${roomNum} - ${roomName}` : `#${roomNum}`;

  const checkIn = reservation.fecha_entrada ? new Date(reservation.fecha_entrada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const checkOut = reservation.fecha_salida ? new Date(reservation.fecha_salida).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  
  const totalPagar = reservation.total_pagar || reservation.precio_total_noches || 0;
  const statusStr = (reservation.estado || 'pendiente').toUpperCase();

  const message = `🏨 *DETALLES DE RESERVACIÓN - HOTEL CASA DOLORES*\n\n` +
    `¡Hola *${guestName}*! Te compartimos la información de tu reservación:\n\n` +
    `📋 *Folio:* ${reservation.folio || 'N/A'}\n` +
    `🛏️ *Habitación:* ${roomInfo}\n` +
    `📅 *Check-In:* ${checkIn} (15:00 hrs)\n` +
    `📅 *Check-Out:* ${checkOut} (12:00 hrs)\n` +
    `👥 *Huéspedes:* ${reservation.cantidad_huespedes || 1}\n` +
    `💰 *Total:* $${Number(totalPagar).toLocaleString('es-MX')} MXN\n` +
    `📌 *Estado:* ${statusStr}\n\n` +
    `Si tienes alguna duda o requerimiento especial, estamos a tus órdenes.\n` +
    `¡Esperamos tener el gusto de recibirte pronto! ✨`;

  openWhatsAppUrl(guestPhone, message);
};

/**
 * Notificación enviada por un cliente al realizar una reserva desde el flujo público (Booking).
 */
export const sendBookingWhatsApp = (bookingData, hotelPhone = DEFAULT_CLEANING_WHATSAPP_PHONE) => {
  const { foliosStr, formData, selectedRooms, rooms, totalFinal, nights } = bookingData;

  const roomListDetails = (selectedRooms || []).map((item, idx) => {
    const rObj = (rooms || []).find((r) => String(r.id) === String(item.roomId));
    return `  - Habitación ${idx + 1}: ${rObj?.nombre || 'Suite'} (${item.guests} huéspedes)`;
  }).join('\n');

  const message = `*NUEVA RESERVACIÓN - HOTEL CASA DOLORES*\n\n` +
    `*Folio(s):* ${foliosStr}\n` +
    `*Huésped:* ${formData.nombre} ${formData.apellidos}\n` +
    `*Correo:* ${formData.email || 'No proporcionado'}\n` +
    `*Teléfono:* ${formData.telefono}\n\n` +
    `*Detalles de la Estancia:*\n` +
    `${roomListDetails}\n` +
    `- *Fecha de Entrada:* ${formData.checkIn}\n` +
    `- *Fecha de Salida:* ${formData.checkOut}\n` +
    `- *Total Huéspedes:* ${formData.guests} personas\n` +
    `- *Estancia:* ${nights} ${nights === 1 ? 'noche' : 'noches'}\n` +
    `${formData.specialRequests ? `- *Peticiones:* ${formData.specialRequests}\n` : ''}\n` +
    `*Total Confirmado:* $${Number(totalFinal).toLocaleString('es-MX')} MXN\n` +
    `*Estado del Pago:* Pendiente (Efectivo / Transferencia al check-in)`;

  openWhatsAppUrl(hotelPhone, message);
};
