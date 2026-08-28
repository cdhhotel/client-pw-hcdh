import Swal from 'sweetalert2';

/**
 * Exporta una lista de reservaciones a formato CSV/Excel con codificación UTF-8 BOM.
 * @param {Array} reservationsList Lista de objetos de reservación
 * @param {string} filenamePrefix Prefijo del nombre del archivo descargado
 */
export const exportReservationsToExcel = (reservationsList, filenamePrefix = 'Reporte_Reservaciones_Hotel_Casa_Dolores') => {
  if (!reservationsList || reservationsList.length === 0) {
    Swal.fire({
      title: 'Sin datos',
      text: 'No hay reservaciones disponibles para exportar en este momento.',
      icon: 'info',
      confirmButtonColor: '#3d2b1f'
    });
    return;
  }

  // Encabezados descriptivos para el reporte
  const headers = [
    'Folio Reservación',
    'Fecha de Creación',
    'Huésped Principal',
    'Correo Electrónico',
    'Teléfono',
    'Tipo Documento',
    'Número Documento',
    'Habitación',
    'Número de Habitación',
    'Fecha Check-In',
    'Fecha Check-Out',
    'Noches Reservadas',
    'Total Huéspedes',
    'Precio Noches (MXN)',
    'Descuento Aplicado (MXN)',
    'Total a Pagar (MXN)',
    'Estado de Reservación',
    'Comentarios / Peticiones Especiales'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = reservationsList.map((res) => {
    const principalHR = res.huesped_reservacion?.find((hr) => hr.es_principal) || res.huesped_reservacion?.[0];
    const guest = principalHR?.huesped;
    const guestName = guest ? `${guest.nombre} ${guest.apellidos}`.trim() : (res.guestName || 'Sin huésped registrado');
    const guestEmail = guest?.email || res.email || '';
    const guestPhone = guest?.telefono || res.telefono || '';
    const docType = guest?.tipo_documento || 'ID';
    const docNum = guest?.numero_documento || '';

    const roomName = res.habitacion?.nombre || res.roomName || '—';
    const roomNum = res.habitacion?.numero || '—';

    const checkIn = res.fecha_entrada ? new Date(res.fecha_entrada).toLocaleDateString('es-MX') : '';
    const checkOut = res.fecha_salida ? new Date(res.fecha_salida).toLocaleDateString('es-MX') : '';

    let nights = 0;
    if (res.fecha_entrada && res.fecha_salida) {
      const diff = new Date(res.fecha_salida) - new Date(res.fecha_entrada);
      nights = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    }

    const createdDate = res.created_at ? new Date(res.created_at).toLocaleDateString('es-MX') : '';

    return [
      escapeCSV(res.folio || ''),
      escapeCSV(createdDate),
      escapeCSV(guestName),
      escapeCSV(guestEmail),
      escapeCSV(guestPhone),
      escapeCSV(docType),
      escapeCSV(docNum),
      escapeCSV(roomName),
      escapeCSV(roomNum),
      escapeCSV(checkIn),
      escapeCSV(checkOut),
      escapeCSV(nights),
      escapeCSV(res.total_huespedes || res.guests || 1),
      escapeCSV(Number(res.precio_total_noches || 0).toFixed(2)),
      escapeCSV(Number(res.descuento_aplicado || 0).toFixed(2)),
      escapeCSV(Number(res.total_pagar || 0).toFixed(2)),
      escapeCSV((res.estado || '').toUpperCase()),
      escapeCSV(res.comentarios || '')
    ].join(',');
  });

  // \uFEFF fuerza codificación UTF-8 en Excel para tildes y caracteres especiales en español
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateSuffix = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateSuffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  Swal.fire({
    title: '¡Reporte Generado!',
    text: `Se ha descargado el archivo con ${reservationsList.length} reservaciones correctamente.`,
    icon: 'success',
    confirmButtonColor: '#3d2b1f',
    timer: 2500,
    showConfirmButton: false
  });
};
