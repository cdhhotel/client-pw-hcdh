import { Edit2, Trash2 } from 'lucide-react';

const API_BASE = '';

/** Formatea una hora ISO a HH:MM */
function formatTime(isoTime) {
  if (!isoTime) return '—';
  try {
    // El campo Time de Prisma llega como "1970-01-01T07:00:00.000Z" o "07:00:00"
    const str = String(isoTime);
    const match = str.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
    return str.substring(0, 5);
  } catch {
    return isoTime;
  }
}

export const ItineraryRow = ({ item, onEdit, onDelete }) => {
  const extra = item.atributos_extra ?? {};
  const imageUrl = extra.imagen_url
    ? `${API_BASE}${extra.imagen_url}`
    : null;

  return (
    <tr>
      {/* Imagen */}
      <td data-label="Imagen">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.nombre}
            style={{
              width: '64px',
              height: '48px',
              objectFit: 'cover',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border)',
            }}
          />
        ) : (
          <div
            style={{
              width: '64px',
              height: '48px',
              background: 'var(--bg-sand)',
              borderRadius: 'var(--border-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
            }}
          >
            🗺️
          </div>
        )}
      </td>

      {/* Nombre */}
      <td data-label="Nombre">
        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{item.nombre}</span>
      </td>

      {/* Sitio Cercano */}
      <td data-label="Lugar">
        <span>{item.sitio_cercano?.nombre ?? '—'}</span>
        <br />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {item.sitio_cercano?.categoria ?? ''}
        </span>
      </td>

      {/* Horario */}
      <td data-label="Horario">
        <span>{formatTime(item.horario_inicio)} – {formatTime(item.horario_fin)}</span>
      </td>

      {/* Descripción */}
      <td data-label="Descripción">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {extra.descripcion
            ? extra.descripcion.length > 60
              ? extra.descripcion.substring(0, 60) + '...'
              : extra.descripcion
            : '—'}
        </span>
      </td>

      {/* Disponibilidad */}
      <td data-label="Disponibilidad">
        <span
          className={`badge ${item.disponibilidad > 0 ? 'badge-success' : 'badge-danger'}`}
        >
          {item.disponibilidad > 0 ? `${item.disponibilidad} cupos` : 'Lleno'}
        </span>
      </td>

      {/* Acciones */}
      <td data-label="Acciones">
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem' }}
            onClick={() => onEdit(item)}
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="btn btn-outlines"
            style={{ padding: '0.4rem 0.75rem' }}
            onClick={() => onDelete(item.id, item.nombre)}
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
