import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Loader2, AlertCircle, LayoutGrid, BedDouble,
  ChevronLeft, ChevronRight,
  CalendarCheck, ArrowRight, Sparkles,
} from 'lucide-react';
import {
  WifiIcon,
  TvIcon,
  HomeModernIcon,
  SunIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { api } from '../../../services/api';

import bgtalavera from '../../../assets/bgtalavera.png';
import bgsecondary from '../../../assets/sala.png';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80';

/** Todas las imágenes de la habitación o [fallback] */
function getRoomImages(room) {
  const imagenes = room?.atributos_extra?.imagenes;
  if (Array.isArray(imagenes) && imagenes.length > 0) return imagenes;
  return [FALLBACK_IMAGE];
}

/** Primera imagen de la habitación */
function getRoomImage(room) {
  return getRoomImages(room)[0];
}

/** Mapa de amenidades → ícono + etiqueta + color (paleta del hotel) */
const AMENITY_MAP = {
  'Wi-Fi': { icon: WifiIcon, label: 'Wi-Fi', bg: 'rgba(160,68,42,0.10)', color: '#A0442A' },
  'TV': { icon: TvIcon, label: 'Televisión', bg: 'rgba(107,74,47,0.10)', color: '#6B4A2F' },
  'Baño completo': { icon: HomeModernIcon, label: 'Baño completo', bg: 'rgba(122,128,97,0.12)', color: '#7A8061' },
  'Terraza': { icon: SunIcon, label: 'Terraza', bg: 'rgba(179,138,58,0.12)', color: '#B38A3A' },
  'Productos de Baño': { icon: SparklesIcon, label: 'Productos de Baño', bg: 'rgba(160,68,42,0.08)', color: '#B55239' },
};

/** Amenidades guardadas en atributos_extra */
function getAmenidades(room) {
  const extra = room?.atributos_extra;
  if (!extra) return [];
  if (Array.isArray(extra.amenidades)) return extra.amenidades;
  if (Array.isArray(extra.amenities)) return extra.amenities;
  const chips = [];
  if (extra.extras) chips.push('Productos de Baño');
  if (extra.terraza) chips.push('Terraza');
  if (extra.bano) chips.push('Baño completo');
  if (extra.tv) chips.push('TV');
  if (extra.wifi) chips.push('Wi-Fi');
  return chips;
}

export const Rooms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // ── Carga desde el backend ────────────────────────────────────────────────
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/room/rooms');
        const data = response?.data ?? response;
        const disponibles = Array.isArray(data)
          ? data.filter((r) => r.estatus === 'disponible')
          : [];
        setRooms(disponibles);

        // Pre-seleccionar habitación si viene desde el Home (?room=ID)
        const roomIdParam = searchParams.get('room');
        if (roomIdParam && disponibles.length > 0) {
          const target = disponibles.find((r) => String(r.id) === String(roomIdParam));
          if (target) {
            setSelectedRoom(target);
            // Pequeño delay para que el DOM esté listo
            setTimeout(() => {
              document.getElementById('room-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
          } else {
            setSelectedRoom(disponibles[0]);
          }
        } else if (disponibles.length > 0) {
          setSelectedRoom(disponibles[0]);
        }
      } catch (err) {
        console.error('Error al cargar habitaciones:', err);
        setError(err.message || 'No se pudieron cargar las habitaciones.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Reinicia el índice de galería al cambiar habitación
  useEffect(() => { setGalleryIndex(0); }, [selectedRoom]);

  const handleBooking = (roomId) => navigate(`/booking?room=${roomId}`);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    // Scroll suave hacia el detalle
    document.getElementById('room-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Estado: cargando ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
        <Loader2 size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Cargando habitaciones…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Estado: error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '1.4rem' }}>Error al cargar habitaciones</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          Reintentar
        </button>
      </div>
    );
  }

  // Datos de habitación activa
  const images = selectedRoom ? getRoomImages(selectedRoom) : [FALLBACK_IMAGE];
  const precio = Number(selectedRoom?.precio_base_noche) || 0;
  const descCorta = selectedRoom?.descripcion_corta || '';
  const descLarga = selectedRoom?.descripcion_larga || '';
  const tipoCamas = selectedRoom?.tipo_camas || null;
  const amenidades = selectedRoom ? getAmenidades(selectedRoom) : [];
  const capacidad = selectedRoom?.capacidad_maxima || '—';

  const prevImage = () => setGalleryIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setGalleryIndex((i) => (i + 1) % images.length);

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">

      {/* ── Cabecera Hero ── */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(20, 12, 6, 0.55), rgba(20, 12, 6, 0.55)), url(${bgsecondary})`,
        paddingTop: 'calc(var(--navbar-height) + 5rem)',
        paddingBottom: '4rem',
        marginTop: 'calc(-1 * var(--navbar-height))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="container text-center">
          <h1 className="section-title" style={{ marginTop: '0.5rem', fontSize: '3rem', color: '#FFF' }}>
            Habitaciones
          </h1>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Cada habitación es una pieza de arte y confort único. Espacios que combinan calidez y modernidad.
          </p>
        </div>
      </div>

      {/* ── Sección principal ── */}
      <div style={{ background: 'var(--bg-linen)', padding: '3rem 0 4rem' }}>
        <div className="container">

          {rooms.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 2rem', textAlign: 'center' }}>
              <LayoutGrid size={48} style={{ opacity: 0.35, color: 'var(--secondary)' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                No hay habitaciones disponibles en este momento.
              </p>
            </div>
          ) : (
            <>
              {/* ══════════════════════════════════════════════
                  GALERÍA DE FOTOS
              ══════════════════════════════════════════════ */}
              <div id="room-detail" style={{ marginBottom: '2.5rem' }}>

                {/* Imagen principal */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/7', overflow: 'hidden', borderRadius: '5px', boxShadow: '0 20px 60px rgba(20,12,6,0.35), 0 4px 16px rgba(20,12,6,0.18)' }}>
                  <img
                    key={`${selectedRoom?.id}-${galleryIndex}`}
                    src={images[galleryIndex]}
                    alt={selectedRoom?.nombre || 'Habitación'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'fadeIn 0.35s ease' }}
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />

                  {/* Overlay oscuro inferior */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,12,6,0.55) 0%, transparent 45%)' }} />

                  {/* Badge precio */}
                  {/* <div style={{
                    position: 'absolute', bottom: '1.25rem', left: '1.5rem',
                    backgroundColor: 'var(--primary)', color: 'var(--bg-linen)',
                    padding: '0.45rem 1.1rem', fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem', fontWeight: 700,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                    letterSpacing: '0.5px',
                  }}>
                    ${precio.toLocaleString('es-MX')}
                    
                    
                  </div> */}

                  {/* Contador de imágenes */}
                  {images.length > 1 && (
                    <div style={{
                      position: 'absolute', bottom: '1.25rem', right: '1.5rem',
                      backgroundColor: 'rgba(20,12,6,0.7)', color: '#fff',
                      padding: '0.3rem 0.8rem', fontSize: '0.78rem',
                      fontFamily: 'var(--font-sans)', fontWeight: 600,
                      borderRadius: '20px', backdropFilter: 'blur(4px)',
                    }}>
                      {galleryIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Flechas de navegación */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        style={{
                          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(20,12,6,0.55)', border: 'none', borderRadius: '50%',
                          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(160,68,42,0.85)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,12,6,0.55)'; }}
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        onClick={nextImage}
                        style={{
                          position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(20,12,6,0.55)', border: 'none', borderRadius: '50%',
                          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(160,68,42,0.85)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,12,6,0.55)'; }}
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>

                {/* Tiras de miniaturas de la galería */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
                    {images.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setGalleryIndex(idx)}
                        style={{
                          flex: '0 0 90px', height: '64px',
                          padding: 0, border: 'none', cursor: 'pointer',
                          borderRadius: '10px', overflow: 'hidden',
                          boxShadow: idx === galleryIndex
                            ? '0 4px 18px rgba(20,12,6,0.32)'
                            : '0 1px 4px rgba(20,12,6,0.1)',
                          opacity: idx === galleryIndex ? 1 : 0.55,
                          transform: idx === galleryIndex ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.28s cubic-bezier(0.34,1.3,0.64,1)',
                          outline: 'none',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          if (idx !== galleryIndex) e.currentTarget.style.transform = 'scale(1.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = idx === galleryIndex ? '1' : '0.55';
                          e.currentTarget.style.transform = idx === galleryIndex ? 'scale(1.06)' : 'scale(1)';
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img
                            src={src}
                            alt={`Imagen ${idx + 1}`}
                            style={{
                              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                              filter: idx === galleryIndex ? 'blur(1.5px) brightness(0.75)' : 'none',
                              transition: 'filter 0.28s ease',
                            }}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                          />
                          {idx === galleryIndex && (
                            <div style={{
                              position: 'absolute', inset: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(20,12,6,0.18)',
                            }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.92)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ══════════════════════════════════════════════
                  INFO DE HABITACIÓN: 3 COLUMNAS
              ══════════════════════════════════════════════ */}
              {selectedRoom && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 260px 280px',
                  gap: '2rem',
                  marginBottom: '4rem',
                  alignItems: 'start',
                }}>

                  {/* ── Columna izquierda: textos / descripciones ── */}
                  <div>
                    {/* Nombre */}
                    <h2 style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--secondary)',
                      fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '3px solid var(--primary)',
                    }}>
                      {selectedRoom.nombre}
                    </h2>

                    {/* Huéspedes + Tipo de cama */}
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                          Huéspedes: <strong style={{ color: 'var(--secondary)' }}>{capacidad}</strong>
                        </span>
                      </div>
                      {tipoCamas && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <BedDouble size={18} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            Tipo de cama: <strong style={{ color: 'var(--secondary)' }}>{tipoCamas}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Descripción corta */}
                    {descCorta && (
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.05rem',
                        color: 'var(--text-main)',
                        lineHeight: '1.75',
                        marginBottom: '1rem',
                        fontWeight: 500,
                      }}>
                        {descCorta}
                      </p>
                    )}

                    {/* Descripción larga */}
                    {descLarga && (
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.97rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.8',
                        marginBottom: 0,
                        paddingTop: descCorta ? '0.75rem' : 0,
                        borderTop: descCorta ? '1px dashed var(--border)' : 'none',
                      }}>
                        {descLarga}
                      </p>
                    )}

                    {!descCorta && !descLarga && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Sin descripción disponible.
                      </p>
                    )}
                  </div>

                  {/* ── Columna central: servicios ── */}
                  <div style={{
                    padding: '1.5rem 1rem',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                  }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                      Servicios
                    </p>

                    {amenidades.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                        Sin servicios especiales registrados.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
                        {amenidades.map((amenidad, i) => {
                          const config = AMENITY_MAP[amenidad];
                          const Icon = config?.icon ?? SparklesIcon;
                          const etiqueta = config?.label ?? amenidad;
                          const bg = config?.bg ?? 'rgba(160,68,42,0.08)';
                          const color = config?.color ?? 'var(--primary)';
                          return (
                            <div key={i} style={{
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', gap: '0.5rem',
                              minWidth: '80px', flex: '0 0 auto',
                            }}>
                              <div style={{
                                width: 54, height: 54, borderRadius: '12px', flexShrink: 0,
                                backgroundColor: bg,
                                border: `1px solid ${color}22`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Icon style={{ width: 26, height: 26, color }} />
                              </div>
                              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                                {etiqueta}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Columna derecha: precio + botón ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{
                      background: 'var(--secondary)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '1.5rem',
                      boxShadow: 'var(--shadow-md)',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' }}>
                        Precio por noche
                      </p>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '1.25rem', lineHeight: 1 }}>
                        ${precio.toLocaleString('es-MX')}<span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)', fontWeight: 400 }}> MXN</span>
                      </p>
                      <button
                        onClick={() => handleBooking(selectedRoom.id)}
                        className="btn btn-gold"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <CalendarCheck size={18} />
                        Reservar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════
                  LISTA DE HABITACIONES
              ══════════════════════════════════════════════ */}
              <div>
                {/* Encabezado de sección */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                      Nuestras habitaciones
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--secondary)', margin: 0 }}>
                      Explorar todas las habitaciones
                    </h3>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {rooms.length} disponibles
                  </span>
                </div>

                {/* Grid de tarjetas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {rooms.map((room) => {
                    const thumb = getRoomImage(room);
                    const isActive = selectedRoom?.id === room.id;
                    const roomPrecio = Number(room.precio_base_noche) || 0;
                    const roomAmen = getAmenidades(room);
                    return (
                      <div
                        key={room.id}
                        onClick={() => handleSelectRoom(room)}
                        style={{
                          background: 'var(--white)',
                          border: '1px solid transparent',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          boxShadow: isActive
                            ? '0 12px 40px rgba(20,12,6,0.15)'
                            : '0 2px 8px rgba(20,12,6,0.07)',
                          transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                          transform: isActive ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                        }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.transform = 'translateY(-3px) scale(1.005)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,12,6,0.1)'; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(104, 52, 12, 0.25)'; } }}
                      >
                        {/* Imagen */}
                        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                          <img
                            src={thumb}
                            alt={room.nombre}
                            style={{
                              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                              transition: 'transform 0.5s ease, filter 0.4s ease',
                              transform: isActive ? 'scale(1.06)' : 'scale(1)',
                              filter: isActive ? 'blur(2px) brightness(0.7)' : 'none',
                            }}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                          />
                          {/* Overlay de focus cuando está activa */}
                          {isActive && (
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'linear-gradient(135deg, rgba(20,12,6,0.25) 0%, rgba(160,68,42,0.15) 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <div style={{
                                background: 'rgba(255,255,255,0.92)',
                                borderRadius: '50px',
                                padding: '0.35rem 1rem',
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 4px 16px rgba(20,12,6,0.2)',
                              }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                                <span style={{
                                  fontFamily: 'var(--font-sans)', fontSize: '0.62rem',
                                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                                  color: 'var(--secondary)',
                                }}>Seleccionada</span>
                              </div>
                            </div>
                          )}
                          {/* Precio overlay */}
                          <div style={{
                            position: 'absolute', bottom: '0.65rem', right: '0.65rem',
                            backgroundColor: 'rgba(20,12,6,0.75)', color: 'var(--gold)',
                            padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700,
                            fontFamily: 'var(--font-sans)', backdropFilter: 'blur(4px)',
                            borderRadius: '2px',
                          }}>
                            ${roomPrecio.toLocaleString('es-MX')}
                          </div>
                        </div>

                        {/* Contenido */}
                        <div style={{ padding: '1rem 1.1rem' }}>
                          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                            {room.nombre}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Users size={13} style={{ color: 'var(--primary)' }} />
                              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {room.capacidad_maxima} huéspedes
                              </span>
                            </div>
                            {room.tipo_camas && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <BedDouble size={13} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {room.tipo_camas}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Mini amenidades */}
                          {roomAmen.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                              {roomAmen.slice(0, 3).map((a, i) => {
                                const cfg = AMENITY_MAP[a];
                                const AIcon = cfg?.icon ?? Sparkles;
                                return (
                                  <div key={i} title={a} style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    backgroundColor: 'rgba(160,68,42,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <AIcon size={13} style={{ color: 'var(--primary)' }} />
                                  </div>
                                );
                              })}
                              {roomAmen.length > 3 && (
                                <div style={{
                                  width: 28, height: 28, borderRadius: '50%',
                                  backgroundColor: 'var(--bg-sand)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--secondary)',
                                }}>
                                  +{roomAmen.length - 3}
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isActive ? 700 : 400 }}>
                              {isActive ? 'Viendo detalles' : 'Ver detalles'}
                            </span>
                            <ArrowRight size={14} style={{ color: isActive ? 'var(--primary)' : 'var(--border)', transition: 'color 0.2s' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          #room-detail + div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};