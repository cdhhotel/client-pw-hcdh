import { Calendar } from 'lucide-react';

export const Hotel = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Administración de Reservaciones</h1>
        <p style={{ color: 'var(--text-muted)' }}>Lista y filtros de todas las reservas de Casa Dolores.</p>
      </div>

      <div className="glass-panel text-center" style={{ padding: '4rem 2rem', borderRadius: 'var(--border-radius-md)' }}>
        <Calendar size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h3>Listado Detallado de Huéspedes</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '500px', marginInline: 'auto' }}>
          Este módulo está listo para enlazarse con los servicios de base de datos de PostgreSQL y mostrar todas las reservaciones programadas, activas e inactivas.
        </p>
      </div>
    </div>
  );
};
export default Hotel;
