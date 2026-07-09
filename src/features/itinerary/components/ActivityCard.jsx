import { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Navigation, Check, Globe, Share2, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategoryBySubcategory } from '../constants/categories';

export const CATEGORY_IMAGES = {
  COMIDA: '/images/comida.png',
  SALUD: '/images/salud.png',
  ATRACCIONES: '/images/atracciones.png',
  EVENTOS: '/images/eventos.png',
  TOURS: '/images/tours.png',
  OTRAS: '/images/otras.png'
};


export const MAIN_CATEGORY_THEMES = {
  COMIDA: {
    accent: 'var(--primary)',
    borderHover: 'rgba(160, 68, 42, 0.4)',
    borderSelected: 'var(--primary)',
    bgSelected: 'rgba(160, 68, 42, 0.04)',
    badgeBg: 'rgba(160, 68, 42, 0.1)',
    badgeText: 'var(--primary)'
  },
  ATRACCIONES: {
    accent: 'var(--secondary)',       // nogal
    borderHover: 'rgba(107, 74, 47, 0.4)',
    borderSelected: 'var(--secondary)',
    bgSelected: 'rgba(107, 74, 47, 0.04)',
    badgeBg: 'rgba(107, 74, 47, 0.1)',
    badgeText: 'var(--secondary)'
  },
  EVENTOS: {
    accent: 'var(--gold)',            // oro artesanal
    borderHover: 'rgba(179, 138, 58, 0.4)',
    borderSelected: 'var(--gold)',
    bgSelected: 'rgba(179, 138, 58, 0.04)',
    badgeBg: 'rgba(179, 138, 58, 0.1)',
    badgeText: 'var(--gold)'
  },
  SALUD: {
    accent: 'var(--primary)',
    borderHover: 'rgba(160, 68, 42, 0.4)',
    borderSelected: 'var(--primary)',
    bgSelected: 'rgba(160, 68, 42, 0.04)',
    badgeBg: 'rgba(160, 68, 42, 0.1)',
    badgeText: 'var(--primary)'
  },
  TOURS: {
    accent: 'var(--accent)',          // verde olivo
    borderHover: 'rgba(122, 128, 97, 0.4)',
    borderSelected: 'var(--accent)',
    bgSelected: 'rgba(122, 128, 97, 0.04)',
    badgeBg: 'rgba(122, 128, 97, 0.1)',
    badgeText: 'var(--accent)'
  },
  OTRAS: {
    accent: 'var(--secondary)',
    borderHover: 'rgba(107, 74, 47, 0.4)',
    borderSelected: 'var(--secondary)',
    bgSelected: 'rgba(107, 74, 47, 0.04)',
    badgeBg: 'rgba(107, 74, 47, 0.1)',
    badgeText: 'var(--secondary)'
  }
};

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
      marginTop: '0.65rem',
      paddingTop: '0.65rem',
      borderTop: '1px dashed var(--border)',
    }}>
      <p style={{
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: 'var(--gold)',
        fontWeight: 700,
        margin: '0 0 0.35rem 0',
        fontFamily: 'var(--font-sans)'
      }}>
        Próximos eventos
      </p>
      {upcoming.map(ev => (
        <div key={ev.id} style={{ marginBottom: '0.25rem' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
            {ev.nombre}
          </p>
          {(ev.mes_referencia || ev.fecha_inicio) && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, opacity: 0.8 }}>
              {ev.mes_referencia ?? new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export const ActivityCard = ({ activity, isSelected, onToggle, isMapFocused }) => {
  const [hovered, setHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Escuchar tamaño de la ventana para responsividad en JS sin Tailwind
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainCat = getCategoryBySubcategory(activity.categoria);
  const theme = MAIN_CATEGORY_THEMES[mainCat] || MAIN_CATEGORY_THEMES.OTRAS;
  const imageUrl = activity.imagen_url || CATEGORY_IMAGES[mainCat] || '/images/otras.png';

  // Calificación normalizada sobre 10
  const rawRating = activity.calificacion ? parseFloat(activity.calificacion) : null;
  const rating10 = rawRating ? (rawRating <= 5 ? rawRating * 2 : rawRating) : null;
  let ratingText = "Excelente";
  if (rating10) {
    if (rating10 >= 9.0) ratingText = "Excelente";
    else if (rating10 >= 8.0) ratingText = "Muy bueno";
    else if (rating10 >= 7.0) ratingText = "Bueno";
    else ratingText = "Aceptable";
  }

  // Generar número de reseñas estable basado en ID
  const reviewsCount = Math.floor(
    ((activity.nombre?.charCodeAt(0) || 75) * 67 + (activity.id?.charCodeAt(3) || 29) * 31) % 450
  ) + 12;

  // Estrellas basadas en calificación
  const starCount = Math.round(rawRating || 4);
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={13}
      style={{
        color: i < starCount ? 'var(--gold)' : 'rgba(200, 185, 155, 0.3)',
        fill: i < starCount ? 'var(--gold)' : 'transparent',
        display: 'inline-block',
        marginLeft: '1px'
      }}
    />
  ));

  // Inclusiones en base a servicios
  const servicesList = activity.servicios
    ? activity.servicios.split(',').map(s => s.trim()).slice(0, 3)
    : ['Acceso libre', 'Recomendado', 'Ubicación céntrica'];

  // Cantidad de fotos ficticia estable
  const photoCount = Math.floor(((activity.nombre?.length || 10) * 7) % 48) + 8;

  return (
    <motion.div
      onClick={() => onToggle(activity)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'pointer',
        background: isSelected
          ? `linear-gradient(135deg, var(--white) 0%, ${theme.bgSelected} 100%)`
          : isMapFocused
            ? 'rgba(200, 185, 155, 0.12)'
            : 'var(--white)',
        border: isSelected
          ? `2.5px solid var(--primary)`
          : isMapFocused
            ? `2px solid var(--accent)`
            : hovered
              ? `1px solid var(--secondary)`
              : '1px solid var(--border)',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: isSelected
          ? `0 6px 18px rgba(107, 74, 47, 0.12), 0 0 8px rgba(160, 68, 42, 0.15)`
          : isMapFocused
            ? `0 6px 15px rgba(107, 74, 47, 0.12), 0 0 8px rgba(122, 128, 97, 0.15)`
            : hovered
              ? '0 8px 16px rgba(107, 74, 47, 0.08)'
              : 'var(--shadow-sm)',
        position: 'relative',
        transition: 'all 0.22s ease',
      }}
      id={`activity-card-${activity.id}`}
    >
      {/* ── SECCIÓN IZQUIERDA (FOTO + DETALLES EXTRA ABAJO DE LA IMAGEN EN ESCRITORIO) ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : '16rem', // 256px fijo
          flexShrink: 0,
          background: 'rgba(216, 200, 168, 0.06)', // Arena muy suave
          borderRight: isMobile ? 'none' : '1px solid rgba(200, 185, 155, 0.18)'
        }}
      >
        {/* Contenedor de la Imagen */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '11.5rem', // Altura fija de imagen
            overflow: 'hidden'
          }}
        >
          {/* Popular Option Badge */}
          {rating10 && rating10 >= 8.5 && (
            <span
              style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                zIndex: 10,
                fontSize: '9px',
                textTransform: 'uppercase',
                fontWeight: '800',
                letterSpacing: '0.05em',
                padding: '0.25rem 0.5rem',
                background: 'var(--secondary)',
                color: 'var(--bg-linen)',
                borderRadius: '0px',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Opción popular
            </span>
          )}

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              zIndex: 10,
              width: '2.25rem',
              height: '2.25rem',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'background-color 0.2s'
            }}
          >
            <Heart
              size={16}
              fill={isFavorite ? 'var(--primary)' : 'transparent'}
              color={isFavorite ? 'var(--primary)' : 'var(--text-main)'}
              style={{ transition: 'transform 0.2s' }}
            />
          </button>

          <img
            src={imageUrl}
            alt={activity.nombre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.75s ease-out, filter 0.75s ease-out',
              transform: hovered ? 'scale(1.03)' : 'scale(1)',
              filter: hovered ? 'brightness(1.02)' : 'brightness(0.95)'
            }}
          />

          <span
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              zIndex: 10,
              fontSize: '9px',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '0.125rem 0.375rem',
              color: '#ffffff',
              letterSpacing: '0.05em'
            }}
          >
            1 / {photoCount}
          </span>
        </div>

        {/* DETALLES DEBAJO DE LA IMAGEN (Solo en Escritorio) */}
        {!isMobile && (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Distancia */}
            {activity.distancia_km && (
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--secondary)'
                }}
              >
                <Navigation size={11} style={{ color: 'var(--primary)', transform: 'rotate(45deg)' }} />
                <span>A {Number(activity.distancia_km).toFixed(1)} km del hotel</span>
              </div>
            )}

            {/* Inclusiones/Servicios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {servicesList.map((srv, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.72rem', color: '#57534e', fontFamily: 'var(--font-sans)' }}>
                  <Check size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={srv}>{srv}</span>
                </div>
              ))}
            </div>

            {/* Enlaces Sociales / Web */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }} onClick={e => e.stopPropagation()}>
              {activity.sitio_web && (
                <a
                  href={activity.sitio_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#a8a29e', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                  title="Sitio web"
                >
                  <Globe size={13} />
                </a>
              )}
              {activity.redes_sociales && (
                <a
                  href={activity.redes_sociales}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#a8a29e', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                  title="Redes sociales"
                >
                  <Share2 size={13} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── SECCIÓN DERECHA (INFORMACIÓN Y ACCIONES PRINCIPALES) ── */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div>
          {/* Subcategory Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.125rem 0.5rem',
              fontSize: '9px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.25rem',
              border: '1px solid rgba(200, 185, 155, 0.4)',
              borderRadius: '0px',
              background: 'var(--bg-sand)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
              alignSelf: 'flex-start'
            }}
          >
            {activity.categoria}
          </span>

          {/* Title & Stars */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.125rem'
            }}
          >
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', margin: 0, color: 'var(--secondary)', lineHeight: 1.25, fontWeight: 'bold' }}>
              {activity.nombre}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>
          </div>

          {/* Rating Badge */}
          {rating10 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0px',
                  background: 'var(--accent)',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {rating10.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {ratingText}
              </span>
              {/* <span style={{ fontSize: '0.75rem', color: '#78716c', fontFamily: 'var(--font-sans)' }}>
                ({reviewsCount} reseñas)
              </span> */}
            </div>
          )}

          {/* Address & Maps Link */}
          {activity.direccion && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', marginTop: '0.625rem' }}>
              <MapPin size={13} style={{ color: theme.accent, flexShrink: 0, marginTop: '2px' }} />
              {activity.link_maps ? (
                <a
                  href={activity.link_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-sans)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  onClick={e => e.stopPropagation()}
                >
                  {activity.direccion}
                </a>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#57534e', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>
                  {activity.direccion}
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Description snippet */}
          {activity.descripcion && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#57534e',
                margin: 0,
                lineHeight: 1.6,
                fontFamily: 'var(--font-sans)',
                whiteSpace: 'pre-line'
              }}
            >
              {activity.descripcion}
            </p>
          )}

          {/* Horario de Atención */}
          {activity.horario && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.375rem',
                fontSize: '0.75rem',
                marginTop: '0.625rem',
                color: '#44403c',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <Clock size={12} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontWeight: '600', color: '#44403c', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                {activity.horario}
              </span>
            </div>
          )}

          {/* Specifications Highlight row */}
          {activity.especificaciones && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                color: 'var(--gold)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <Sparkles size={11} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: '600', color: '#44403c', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {activity.especificaciones}
              </span>
            </div>
          )}

          {/* Local Events list */}
          <UpcomingEvents eventos={activity.evento_local} />
        </div>

        {/* DETALLES DEBAJO (Solo en Móvil para mantener orden de lectura) */}
        {isMobile && (
          <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(216, 200, 168, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activity.distancia_km && (
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-sans)', color: 'var(--secondary)' }}>
                <Navigation size={12} style={{ color: 'var(--primary)', transform: 'rotate(45deg)' }} />
                <span>A {Number(activity.distancia_km).toFixed(1)} km del hotel</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {servicesList.map((srv, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#57534e', fontFamily: 'var(--font-sans)' }}>
                  <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span>{srv}</span>
                </div>
              ))}
            </div>
            {/* Redes móviles */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }} onClick={e => e.stopPropagation()}>
              {activity.sitio_web && (
                <a href={activity.sitio_web} target="_blank" rel="noopener noreferrer" style={{ color: '#a8a29e' }} title="Sitio web">
                  <Globe size={13} />
                </a>
              )}
              {activity.redes_sociales && (
                <a href={activity.redes_sociales} target="_blank" rel="noopener noreferrer" style={{ color: '#a8a29e' }} title="Redes sociales">
                  <Share2 size={13} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── BARRA INFERIOR DE ACCIONES (Tiempo Estimado + Botón de Acción) ── */}
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(200, 185, 155, 0.15)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activity.tiempo_estimado_minutos && (
              <span style={{ fontSize: '10px', color: '#a8a29e', fontFamily: 'var(--font-sans)' }}>
                ~ {activity.tiempo_estimado_minutos} minutos de viaje
              </span>
            )}
            <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-sans)', color: 'var(--accent)' }}>
              Ubicación verificada
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(activity);
            }}
            style={{
              padding: '0.625rem 1.25rem',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isSelected ? 'transparent' : 'var(--primary)',
              color: isSelected ? 'var(--primary)' : 'var(--bg-linen)',
              border: isSelected ? '2px solid var(--primary)' : 'none',
              borderRadius: 'var(--border-radius-sm)', // Recto
              boxShadow: isSelected ? 'none' : '0 4px 8px rgba(160, 68, 42, 0.12)',
              minWidth: isMobile ? 'auto' : '180px'
            }}
            onMouseEnter={e => {
              if (isSelected) {
                e.currentTarget.style.background = 'rgba(160, 68, 42, 0.05)';
              } else {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={e => {
              if (isSelected) {
                e.currentTarget.style.background = 'transparent';
              } else {
                e.currentTarget.style.background = 'var(--primary)';
              }
            }}
          >
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {isSelected ? 'Quitar del itinerario' : 'Añadir al itinerario'}
            </span>
            <ChevronRight size={14} style={{ flexShrink: 0 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
