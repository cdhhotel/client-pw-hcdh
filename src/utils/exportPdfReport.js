import Swal from 'sweetalert2';

/**
 * Procesa la lista de reservaciones y genera una ventana de reporte imprimible / guardable como PDF con gráficos y tablas.
 * @param {Array} reservationsList Lista de reservaciones
 */
export const generatePdfAnalyticsReport = (reservationsList) => {
  if (!reservationsList || reservationsList.length === 0) {
    Swal.fire({
      title: 'Sin datos',
      text: 'No hay datos de reservaciones suficientes para generar el reporte.',
      icon: 'info',
      confirmButtonColor: '#3d2b1f'
    });
    return;
  }

  const totalRes = reservationsList.length;

  // 1. Duración de estancia (Promedio y Distribución)
  let totalNights = 0;
  const stayDistribution = { '1 Noche': 0, '2 Noches': 0, '3-4 Noches': 0, '5+ Noches': 0 };

  // 2. Desglose por Mes y Año
  const monthYearMap = {}; // { 'Agosto 2026': { count: X, revenue: Y } }

  // 3. Habitaciones más reservadas
  const roomMap = {}; // { 'Suite Dolores': count }

  // 4. Días de la semana con mayor reservación (Entradas)
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayOfWeekMap = { 'Domingo': 0, 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 };

  let totalRevenue = 0;

  reservationsList.forEach((res) => {
    // Noches
    let nights = 1;
    if (res.fecha_entrada && res.fecha_salida) {
      const diff = new Date(res.fecha_salida) - new Date(res.fecha_entrada);
      nights = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    }
    totalNights += nights;

    if (nights === 1) stayDistribution['1 Noche']++;
    else if (nights === 2) stayDistribution['2 Noches']++;
    else if (nights >= 3 && nights <= 4) stayDistribution['3-4 Noches']++;
    else stayDistribution['5+ Noches']++;

    // Total ingresos
    const totalPagar = Number(res.total_pagar || 0);
    totalRevenue += totalPagar;

    // Mes y Año
    const entryDate = res.fecha_entrada ? new Date(res.fecha_entrada) : (res.created_at ? new Date(res.created_at) : new Date());
    const monthYearKey = entryDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const formattedMonthKey = monthYearKey.charAt(0).toUpperCase() + monthYearKey.slice(1);

    if (!monthYearMap[formattedMonthKey]) {
      monthYearMap[formattedMonthKey] = { count: 0, revenue: 0 };
    }
    monthYearMap[formattedMonthKey].count++;
    monthYearMap[formattedMonthKey].revenue += totalPagar;

    // Día de la semana
    const dayOfWeek = dayNames[entryDate.getDay()];
    if (dayOfWeekMap[dayOfWeek] !== undefined) {
      dayOfWeekMap[dayOfWeek]++;
    }

    // Habitación
    const roomName = res.habitacion?.nombre || res.roomName || 'Habitación General';
    if (!roomMap[roomName]) {
      roomMap[roomName] = 0;
    }
    roomMap[roomName]++;
  });

  const avgNights = (totalNights / totalRes).toFixed(1);

  // Ordenar Habitaciones por más reservadas
  const sortedRooms = Object.entries(roomMap)
    .map(([nombre, count]) => ({ nombre, count, percentage: Math.round((count / totalRes) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Ordenar Meses
  const monthEntries = Object.entries(monthYearMap).map(([mesAno, data]) => ({
    mesAno,
    count: data.count,
    revenue: data.revenue
  }));

  // Encontrar el día de la semana pico
  const peakDay = Object.entries(dayOfWeekMap).sort((a, b) => b[1] - a[1])[0];

  // Ventana de impresión limpia HTML/CSS
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    Swal.fire({
      title: 'Bloqueador de ventanas',
      text: 'Por favor permite ventanas emergentes para abrir el reporte en PDF.',
      icon: 'warning',
      confirmButtonColor: '#3d2b1f'
    });
    return;
  }

  const currentDateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Reservaciones</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #2d2926;
          background-color: #ffffff;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify: space-between;
          align-items: center;
          border-bottom: 3px solid #A0442A;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .header-title h1 {
          margin: 0;
          color: #A0442A;
          font-size: 22px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header-title p {
          margin: 4px 0 0 0;
          color: #776e65;
          font-size: 13px;
        }
        .header-meta {
          text-align: right;
          font-size: 12px;
          color: #776e65;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }
        .kpi-card {
          background-color: #fdfaf7;
          border: 1px solid #ede4db;
          border-radius: 6px;
          padding: 12px 15px;
          text-align: center;
        }
        .kpi-title {
          font-size: 11px;
          text-transform: uppercase;
          color: #776e65;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 22px;
          font-weight: 800;
          color: #A0442A;
          margin-top: 4px;
        }
        .section-title {
          font-size: 15px;
          color: #3d2b1f;
          border-bottom: 2px solid #ede4db;
          padding-bottom: 6px;
          margin-top: 25px;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 15px;
        }
        th {
          background-color: #f5eeea;
          color: #5c4d42;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          text-align: left;
          border-bottom: 2px solid #e0d5cb;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #eee7e0;
        }
        tr:nth-child(even) {
          background-color: #fcfbf9;
        }
        .bar-container {
          width: 100%;
          background-color: #eee7e0;
          height: 10px;
          border-radius: 5px;
          overflow: hidden;
          margin-top: 4px;
        }
        .bar-fill {
          height: 100%;
          background-color: #A0442A;
          border-radius: 5px;
        }
        .bar-fill-accent {
          background-color: #B38A3A;
        }
        .actions-btn {
          position: fixed;
          top: 15px;
          right: 15px;
          background-color: #A0442A;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 9999;
        }
        .actions-btn:hover {
          background-color: #853721;
        }
        @media print {
          .actions-btn {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <button class="actions-btn" onclick="window.print()">
        🖨 Guardar / Imprimir PDF
      </button>

      <!-- Encabezado del Reporte -->
      <div class="header">
        <div class="header-title">
          <h1>Hotel Casa Dolores Hidalgo</h1>
          <p>Reporte de Reservaciones y Demanda</p>
        </div>
        <div class="header-meta">
          <strong>Fecha de emisión:</strong> ${currentDateStr}<br>
          <strong>Total analizado:</strong> ${totalRes} reservaciones
        </div>
      </div>

      <!-- Tarjetas KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Total Reservaciones</div>
          <div class="kpi-value">${totalRes}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Estancia Promedio</div>
          <div class="kpi-value">${avgNights} días</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Día de Mayor Entrada</div>
          <div class="kpi-value" style="font-size: 16px; margin-top: 8px;">${peakDay[0]} (${peakDay[1]} res.)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Ingresos Totales</div>
          <div class="kpi-value" style="font-size: 17px; margin-top: 8px;">$${totalRevenue.toLocaleString('es-MX')} MXN</div>
        </div>
      </div>

      <div class="grid-2">
        <!-- 1. Habitaciones más reservadas -->
        <div>
          <div class="section-title">Habitaciones Más Reservadas</div>
          <table>
            <thead>
              <tr>
                <th>Habitación</th>
                <th style="text-align: center;">Reservas</th>
                <th style="text-align: right;">% del Total</th>
              </tr>
            </thead>
            <tbody>
              ${sortedRooms.map(r => `
                <tr>
                  <td>
                    <strong>${r.nombre}</strong>
                    <div class="bar-container">
                      <div class="bar-fill" style="width: ${r.percentage}%;"></div>
                    </div>
                  </td>
                  <td style="text-align: center; font-weight: bold;">${r.count}</td>
                  <td style="text-align: right; color: #A0442A; font-weight: bold;">${r.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 2. Duración Promedio de Estancia -->
        <div>
          <div class="section-title">Duración Promedio de Estancia</div>
          <table>
            <thead>
              <tr>
                <th>Duración de Estancia</th>
                <th style="text-align: center;">Reservaciones</th>
                <th style="text-align: right;">% Distribución</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(stayDistribution).map(([label, count]) => {
                const pct = Math.round((count / totalRes) * 100);
                return `
                  <tr>
                    <td>
                      <strong>${label}</strong>
                      <div class="bar-container">
                        <div class="bar-fill bar-fill-accent" style="width: ${pct}%;"></div>
                      </div>
                    </td>
                    <td style="text-align: center; font-weight: bold;">${count}</td>
                    <td style="text-align: right; color: #B38A3A; font-weight: bold;">${pct}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Reservaciones e Ingresos por Mes y Año -->
      <div class="section-title">Desglose de Reservaciones por Mes y Año</div>
      <table>
        <thead>
          <tr>
            <th>Mes / Año</th>
            <th style="text-align: center;">Cantidad de Reservaciones</th>
            <th style="text-align: right;">Ingresos Totales</th>
            <th style="text-align: right;">Promedio por Reservación</th>
          </tr>
        </thead>
        <tbody>
          ${monthEntries.map(m => `
            <tr>
              <td><strong>${m.mesAno}</strong></td>
              <td style="text-align: center; font-weight: bold;">${m.count} reservaciones</td>
              <td style="text-align: right; font-weight: bold; color: #A0442A;">$${m.revenue.toLocaleString('es-MX')} MXN</td>
              <td style="text-align: right; color: #776e65;">$${Math.round(m.revenue / m.count).toLocaleString('es-MX')} MXN</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 4. Fechas y Días de Mayor Demanda -->
      <div class="section-title">Preferencia de Entradas por Día de la Semana</div>
      <table>
        <thead>
          <tr>
            <th>Día de la Semana</th>
            <th style="text-align: center;">Llegadas Registradas</th>
            <th style="text-align: right;">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(dayOfWeekMap).map(([dia, count]) => {
            const pct = Math.round((count / totalRes) * 100);
            return `
              <tr>
                <td><strong>${dia}</strong></td>
                <td style="text-align: center; font-weight: bold;">${count} entradas</td>
                <td style="text-align: right; font-weight: bold;">${pct}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #eee7e0; text-align: center; font-size: 11px; color: #998e83;">
        Hotel Casa Dolores &copy; ${new Date().getFullYear()} — Reporte generado automáticamente para análisis ejecutivo de ocupación y estancia.
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
