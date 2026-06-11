import { Calendar, Bed, TrendingUp, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const Dashboard = () => {
  // Mock de datos de reservaciones recientes
  const recentReservations = [
    {
      id: 'CD-839212',
      customer: 'Alejandro Moreno',
      room: 'Master Suite Presidencial',
      checkIn: '2026-06-05',
      checkOut: '2026-06-08',
      status: 'confirmed', // confirmed, pending, canceled
      total: 11400,
    },
    {
      id: 'CD-109483',
      customer: 'Sofía Rodríguez',
      room: 'Junior Suite Dolores',
      checkIn: '2026-06-06',
      checkOut: '2026-06-07',
      status: 'pending',
      total: 2400,
    },
    {
      id: 'CD-748392',
      customer: 'John Doe',
      room: 'Estándar Colonial Sencilla',
      checkIn: '2026-06-10',
      checkOut: '2026-06-12',
      status: 'confirmed',
      total: 3000,
    },
    {
      id: 'CD-382910',
      customer: 'María Elena Gómez',
      room: 'Doble Colonial Deluxe',
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
      status: 'canceled',
      total: 6600,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Estadísticas Generales</h1>
        <p style={{ color: 'var(--text-muted)' }}>Resumen del estado y reservaciones del hotel.</p>
      </div>

      {/* Grid de Tarjetas de Indicadores */}
      <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
        
        {/* Ocupación */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ocupación</span>
            <Bed size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>75%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 500 }}>6 de 8 habitaciones ocupadas</div>
        </div>

        {/* Llegadas Hoy */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Llegadas Hoy</span>
            <Calendar size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>4 Check-ins</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendientes por arribar</div>
        </div>

        {/* Reservas del Mes */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reservas Activas</span>
            <Users size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>24</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 500 }}>+12% vs mes anterior</div>
        </div>

        {/* Ingresos Estimados */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ingresos Mes</span>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>$48,600</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Moneda Nacional MXN</div>
        </div>

      </div>

      {/* Reservaciones Recientes */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Reservaciones Recientes</h2>
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Reserva</th>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 'bold' }}>{res.id}</td>
                  <td>{res.customer}</td>
                  <td>{res.room}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {res.checkIn} al {res.checkOut}
                  </td>
                  <td>
                    {res.status === 'confirmed' && (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={10} /> Confirmada
                      </span>
                    )}
                    {res.status === 'pending' && (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={10} /> Pendiente
                      </span>
                    )}
                    {res.status === 'canceled' && (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={10} /> Cancelada
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>${res.total.toLocaleString()} MXN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
