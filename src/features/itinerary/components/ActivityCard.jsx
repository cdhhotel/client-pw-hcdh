import { useState } from 'react';
// import { Instagram } from 'lucide-react';
import { MapPin, Clock, Star, Navigation, Plus, Check, Globe, Share2 } from 'lucide-react';

const CATEGORIA_CONFIG = {
  'Gastronomía': { bg: '#FFF3E0', color: '#E65100', icon: '' },
  'Cultura': { bg: '#F3E5F5', color: '#6A1B9A', icon: '' },
  'Naturaleza': { bg: '#E8F5E9', color: '#2E7D32', icon: '' },
  'Aventura': { bg: '#FFF8E1', color: '#F57F17', icon: '' },
  'Compras': { bg: '#FCE4EC', color: '#880E4F', icon: '' },
  'Historia': { bg: '#EFEBE9', color: '#4E342E', icon: '' },
  'Arte': { bg: '#E8EAF6', color: '#283593', icon: '' },
  'Deporte': { bg: '#E3F2FD', color: '#1565C0', icon: '' },
  'Relax': { bg: '#F9FBE7', color: '#558B2F', icon: '' },
  'Tour': { bg: '#FFF9E6', color: '#A0442A', icon: '' },
  'Restaurante': { bg: '#FFF3E0', color: '#BF360C', icon: '' },
  'Museo': { bg: '#E8EAF6', color: '#283593', icon: '' },
  'Actividad Recreativa': { bg: '#E8F5E9', color: '#2E7D32', icon: '' },
  'default': { bg: '#F5F0E6', color: '#6B4A2F', icon: '' },
};

function getCatStyle(categoria) {
  return CATEGORIA_CONFIG[categoria] ?? CATEGORIA_CONFIG['default'];
}

/** Próximos eventos del sitio (máximo 2) */
function UpcomingEvents({ eventos }) {
  if (!eventos?.length) return null;
  const now = new Date();
  const upcoming = eventos
    .filter(e => !e.fecha_fin || new Date(e.fecha_fin) >= now)
    .slice(0, 2);
  if (!upcoming.length) return null;

  return (
    <div style={{
      marginTop: '0.5rem',
      paddingTop: '0.5rem',
      borderTop: '1px dashed var(--border)',
    }}>
      <p style={{
        fontSize: '0.68rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--gold)',
        fontWeight: 700,
        margin: '0 0 0.3rem 0',
      }}>
        Próximos eventos
      </p>
      {upcoming.map(ev => (
        <div key={ev.id} style={{ marginBottom: '0.2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', margin: 0 }}>
            {ev.nombre}
          </p>
          {(ev.mes_referencia || ev.fecha_inicio) && (
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0 }}>
              {ev.mes_referencia ?? new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

import { motion } from 'framer-motion';

export const ActivityCard = ({ activity, isSelected, onToggle }) => {
  const [hovered, setHovered] = useState(false);
  const catStyle = getCatStyle(activity.categoria);

  // El sitio puede tener imagen en atributos_extra (futuro) o placeholder por categoría
  const imageUrl = activity.imagen_url ?? null;

  return (
    <motion.div
      onClick={() => onToggle(activity)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: isSelected ? 'var(--bg-sand)' : 'var(--white)',
        border: 'none',
        borderRadius: '16px', // un poco más redondo
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 10px 30px rgba(179,138,58,0.25), inset 0 0 0 2px var(--gold)'
          : hovered
            ? '0 15px 35px rgba(0,0,0,0.1)'
            : '0 5px 15px rgba(0,0,0,0.05)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Badge seleccionado / agregar */}
      <motion.div 
        animate={{ scale: isSelected ? 1 : 0.9, opacity: isSelected ? 1 : hovered ? 0.9 : 0.6 }}
        style={{
        position: 'absolute', top: '0.8rem', right: '0.8rem', zIndex: 10,
        width: '32px', height: '32px', borderRadius: '50%',
        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.95)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      }}>
        {isSelected
          ? <Check size={16} style={{ color: 'white' }} />
          : <Plus size={16} style={{ color: 'var(--primary)' }} />
        }
      </motion.div>

      {/* ── Imagen / Placeholder con categoría ── */}
      <div style={{ height: '148px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.nombre}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${catStyle.bg} 0%, var(--bg-sand) 100%)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}>
            <span style={{ fontSize: '2.6rem' }}>{catStyle.icon}</span>
            <span style={{
              fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px',
              color: catStyle.color, fontWeight: 700,
            }}>
              {activity.categoria}
            </span>
          </div>
        )}
        {/* Overlay degradado hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(107,74,47,0.3) 0%, transparent 55%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }} />

        {/* Distancia badge */}
        {activity.distancia_km && (
          <span style={{
            position: 'absolute', bottom: '0.5rem', left: '0.5rem',
            background: 'rgba(73,55,42,0.85)',
            color: 'var(--bg-linen)',
            fontSize: '0.68rem', fontWeight: 600,
            padding: '0.18rem 0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            backdropFilter: 'blur(4px)',
          }}>
            <Navigation size={9} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
            {Number(activity.distancia_km).toFixed(1)} km
          </span>
        )}
      </div>

      {/* ── Contenido ── */}
      <div style={{ padding: '0.9rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

        {/* Badge categoría */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.15rem 0.55rem',
          borderRadius: '50px',
          fontSize: '0.68rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.4px',
          background: catStyle.bg, color: catStyle.color,
          alignSelf: 'flex-start',
          marginBottom: '0.15rem',
        }}>
          {catStyle.icon} {activity.categoria}
        </span>

        {/* Nombre */}
        <h4 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1rem',
          color: 'var(--secondary)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {activity.nombre}
        </h4>

        {/* Dirección */}
        {activity.direccion && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
            <MapPin size={11} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {activity.direccion}
            </span>
          </div>
        )}

        {/* Horario */}
        {activity.horario && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activity.horario}
            </span>
          </div>
        )}

        {/* Tiempo estimado */}
        {activity.tiempo_estimado_minutos && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Navigation size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ~{activity.tiempo_estimado_minutos} min desde el hotel
            </span>
          </div>
        )}

        {/* Descripción (truncada) */}
        {activity.descripcion && (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            margin: '0.1rem 0 0 0',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {activity.descripcion}
          </p>
        )}

        {/* Servicios / incluye (truncado) */}
        {activity.servicios && (
          <p style={{
            fontSize: '0.73rem',
            color: 'var(--accent)',
            margin: '0.1rem 0 0 0',
            fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            Incluye: {activity.servicios}
          </p>
        )}

        {/* Links externos */}
        {(activity.sitio_web || activity.redes_sociales) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}
            onClick={e => e.stopPropagation()}>
            {activity.sitio_web && (
              <a href={activity.sitio_web} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-muted)' }} title="Sitio web">
                <Globe size={13} />
              </a>
            )}
            {activity.redes_sociales && (
              <a href={activity.redes_sociales} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-muted)' }} title="Redes sociales">
                {/* <Instagram size={13} /> */}
              </a>
            )}
          </div>
        )}

        {/* Calificación + estado selección */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {activity.calificacion ? (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={10} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
              {Number(activity.calificacion).toFixed(1)}
            </span>
          ) : <span />}
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
          }}>
            {isSelected ? '✓ Agregado' : '+ Agregar'}
          </span>
        </div>

        {/* Próximos eventos del lugar */}
        <UpcomingEvents eventos={activity.evento_local} />
      </div>
    </motion.div>
  );
};

export default ActivityCard;
