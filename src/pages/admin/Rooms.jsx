import { Bed } from 'lucide-react';

export const Rooms = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Control de Habitaciones</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestión de tarifas, disponibilidad y limpieza de suites.</p>
      </div>

      <div className="glass-panel text-center" style={{ padding: '4rem 2rem', borderRadius: 'var(--border-radius-md)' }}>
        <Bed size={48} style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }} />
        <h3>Inventario de Habitaciones</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '500px', marginInline: 'auto' }}>
          Este módulo está listo para gestionar el inventario de las 8 suites coloniales de Casa Dolores, habilitando la edición de tarifas por temporada alta/baja y estado de mantenimiento.
        </p>
      </div>
    </div>
  );
};
export default Rooms;
