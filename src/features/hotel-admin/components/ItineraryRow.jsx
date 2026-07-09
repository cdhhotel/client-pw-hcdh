import { Edit2, Trash2 } from 'lucide-react';

export const ItineraryRow = ({ item, type = 'sitio', onEdit, onDelete }) => {
  const isEvento = type === 'evento';

  return (
    <tr>
      {/* Nombre */}
      <td data-label="Nombre">
        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{item.nombre}</span>
      </td>

      {/* Categoría */}
      <td data-label="Categoría">
        <span className={`badge ${isEvento ? 'badge-accent' : 'badge-info'}`}>
          {isEvento ? 'Evento Local' : item.categoria || 'General'}
        </span>
      </td>

      {/* Dirección / Sede */}
      <td data-label={isEvento ? "Sede (Lugar)" : "Dirección"}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isEvento ? (item.sitio_cercano?.nombre || 'Independiente') : (item.direccion || '—')}
        </span>
      </td>

      {/* Horario / Fechas */}
      <td data-label={isEvento ? "Fechas" : "Horario"}>
        <span style={{ fontSize: '0.9rem' }}>
          {isEvento ? (
            item.fecha_inicio ? (
              <>
                {new Date(item.fecha_inicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                {item.fecha_fin ? ` al ${new Date(item.fecha_fin).toLocaleDateString('es-MX', { timeZone: 'UTC' })}` : ''}
              </>
            ) : item.mes_referencia || '—'
          ) : (
            item.horario || '—'
          )}
        </span>
      </td>

      {/* Info Extra / Descripción */}
      <td data-label={isEvento ? "Descripción" : "Info Extra"}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isEvento ? (
            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.descripcion || '—'}
            </span>
          ) : (
            <>
              {item.calificacion ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={14} height={14}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                  <span>{item.calificacion} / 5</span>
                </div>
              ) : null}

              {item.telefono ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={14} height={14}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <span>{item.telefono}</span>
                </div>
              ) : null}

              {item.distancia_km ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={14} height={14}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                  </svg>
                  <span>{item.distancia_km} km</span>
                </div>
              ) : null}

              {!item.calificacion && !item.telefono && !item.distancia_km ? '—' : null}
            </>
          )}
        </div>
      </td>

      {/* Acciones */}
      <td data-label="Acciones">
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem' }}
            onClick={() => onEdit(item, type)}
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="btn btn-outlines"
            style={{ padding: '0.4rem 0.75rem' }}
            onClick={() => onDelete(item.id, item.nombre, type)}
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ItineraryRow;