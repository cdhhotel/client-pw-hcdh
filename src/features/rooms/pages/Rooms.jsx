import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, AlertCircle, LayoutGrid, BedDouble } from 'lucide-react';
import { api } from '../../../services/api';

import bgtalavera from '../../../assets/bgtalavera.png'
import bgsecondary from '../../../assets/sala.png';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80';

/** Primera imagen de atributos_extra o fallback */
function getRoomImage(room) {
  const imagenes = room?.atributos_extra?.imagenes;
  if (Array.isArray(imagenes) && imagenes.length > 0) return imagenes[0];
  return FALLBACK_IMAGE;
}

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

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        if (disponibles.length > 0) setSelectedRoom(disponibles[0]);
      } catch (err) {
        console.error('Error al cargar habitaciones:', err);
        setError(err.message || 'No se pudieron cargar las habitaciones.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // ── Filtrado y ordenamiento ───────────────────────────────────────────────
  const filteredRooms = rooms
    .filter((room) => {
      if (filterCapacity === 'all') return true;
      const cap = Number(room.capacidad_maxima) || 0;
      if (filterCapacity === '2') return cap <= 2;
      if (filterCapacity === '4') return cap <= 4;
      return true;
    })
    .sort((a, b) => {
      const pa = Number(a.precio_base_noche) || 0;
      const pb = Number(b.precio_base_noche) || 0;
      if (sortOrder === 'low-high') return pa - pb;
      if (sortOrder === 'high-low') return pb - pa;
      return 0;
    });

  // La habitación activa: la seleccionada si sigue en el filtro, si no la primera
  const activeRoom =
    filteredRooms.find((r) => r.id === selectedRoom?.id) ||
    filteredRooms[0] ||
    null;

  const handleBooking = (roomId) => navigate(`/booking?room=${roomId}`);

  // ── Estado: cargando ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="animate-fade-in container py-section"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1.25rem' }}
      >
        <Loader2 size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Cargando habitaciones…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Estado: error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="animate-fade-in container py-section"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem', textAlign: 'center' }}
      >
        <AlertCircle size={48} style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '1.4rem' }}>Error al cargar habitaciones</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          Reintentar
        </button>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">

      {/* ── Cabecera con imagen de fondo ── */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(20, 12, 6, 0.50), rgba(20, 12, 6, 0.50)), url(${bgsecondary})`,
        padding: '5rem 0 4rem 0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="container">
          <div className="text-center">
            <h1 className="section-title" style={{ marginTop: '0.5rem', fontSize: '3rem', color: '#FFF' }}>
              Habitaciones
            </h1>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Cada habitación es una pieza de arte y confort único. Espacios que combinan calidez y modernidad.
            </p>
          </div>
        </div>
      </div>

      {/* ── Panel de Filtros ── */}
      <div
        style={{
          position: 'sticky',
          top: '80px',
          zIndex: 500,
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(82, 56, 35, 0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 24px 0 rgba(40, 20, 5, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', color: '#FFF' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Capacidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--white)' }}>Capacidad:</span>
              <select value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)} className="form-control">
                <option value="all">Todas las capacidades</option>
                <option value="2">Hasta 2 Huéspedes</option>
                <option value="4">Hasta 4 Huéspedes</option>
              </select>
            </div>
            {/* Ordenar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--white)' }}>Ordenar:</span>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-control">
                <option value="none">Por defecto</option>
                <option value="low-high">Precio: Menor a Mayor</option>
                <option value="high-low">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,230,0.8)' }}>
            Mostrado{' '}
            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{filteredRooms.length}</span>
            {' '}{filteredRooms.length === 1 ? 'Habitación' : 'Habitaciones'}
          </div>
        </div>
      </div>

      {/* ── Sección de Habitaciones ── */}
      <div style={{ backgroundImage: `linear-gradient(var(--white), var(--white)), url(${bgtalavera})`, padding: '3rem 0 5rem' }}>
        <div className="container">

          {filteredRooms.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', textAlign: 'center' }}>
              <LayoutGrid size={48} style={{ opacity: 0.4, color: 'var(--secondary)' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                No hay habitaciones disponibles con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <>
              {/* ── Habitación activa ── */}
              {activeRoom && (() => {
                const imageSrc = getRoomImage(activeRoom);
                const precio = Number(activeRoom.precio_base_noche) || 0;
                const descripcionCorta = activeRoom.descripcion_corta || '';
                const descripcionLarga = activeRoom.descripcion_larga || '';
                const tipoCamas = activeRoom.tipo_camas || null;
                const amenidades = getAmenidades(activeRoom);
                const capacidad = activeRoom.capacidad_maxima || '—';

                return (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      // border: '1px solid var(--primary)',
                      borderRadius: 'var(--border-radius-lg)',
                      overflow: 'hidden',
                      marginBottom: '2rem',
                      backgroundColor: 'var(--white)',
                      boxShadow: 'var(--shadow-lg)',
                      minHeight: '500px',
                      maxHeight: '500px',
                    }}
                  >
                    {/* Imagen */}
                    <div style={{ width: '45%', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      <img
                        key={activeRoom.id}
                        src={imageSrc}
                        alt={activeRoom.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'fadeIn 0.4s ease' }}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      />
                      {/* Badge precio */}
                      <div style={{
                        position: 'absolute', bottom: '1rem', left: '1rem',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-linen)',
                        padding: '0.4rem 1rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem', fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        ${precio.toLocaleString('es-MX')} MXN / noche
                      </div>
                    </div>

                    {/* Panel de info */}
                    <div style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '1.5rem 2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      overflowY: 'auto',
                    }}>
                      <div>
                        {/* Título */}
                        <h2 style={{
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--secondary)',
                          fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                          fontWeight: 750,
                          marginBottom: '0.5rem',
                          borderBottom: '2px solid var(--primary)',
                          paddingBottom: '0.5rem',
                        }}>
                          {activeRoom.nombre}
                        </h2>

                        {/* Capacidad + Tipo de cama */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                              Capacidad: <strong style={{ color: 'var(--gold)' }}>{capacidad} Huéspedes</strong>
                            </span>
                          </div>
                          {tipoCamas && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <BedDouble size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                Cama: <strong style={{ color: 'var(--gold)' }}>{tipoCamas}</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Descripción */}
                        <div style={{
                          // border: '1px solid var(--border)',
                          // borderRadius: 'var(--border-radius-md)',
                          padding: '0.9rem 1rem',
                          backgroundColor: '',
                        }}>
                          {/* Descripción corta */}
                          {descripcionCorta && (
                            <p style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '1rem',
                              color: 'var(--text-main)',
                              lineHeight: '1.7',
                              margin: 0,
                              marginBottom: '0.5rem',
                            }}>
                              {descripcionCorta}
                            </p>
                          )}
                          {/* Descripción larga */}
                          {descripcionLarga && (
                            <p style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '1rem',
                              color: 'var(--text-muted)',
                              lineHeight: '1.65',
                              margin: 0,
                              marginBottom: amenidades.length > 0 ? '0.75rem' : 0,
                              borderTop: descripcionCorta ? '1px dashed var(--border)' : 'none',
                              paddingTop: descripcionCorta ? '0.5rem' : 0,
                            }}>
                              {descripcionLarga}
                            </p>
                          )}
                          {/* Fallback si ninguna descripción existe */}
                          {!descripcionCorta && !descripcionLarga && (
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                              Sin descripción disponible.
                            </p>
                          )}
                          {amenidades.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                              {amenidades.map((a, i) => (
                                <span key={i} style={{
                                  fontSize: '0.72rem', fontWeight: 600,
                                  textTransform: 'uppercase', letterSpacing: '0.5px',
                                  padding: '0.2rem 0.55rem',
                                  border: '1px solid var(--border)',
                                  color: 'var(--secondary)',
                                  backgroundColor: 'var(--bg-sand)',
                                }}>
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botón Reservar */}
                      <button
                        onClick={() => handleBooking(activeRoom.id)}
                        className="btn btn-gold"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}
                      >
                        Reservar Ahora
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Miniaturas de selección */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '0.75rem',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--primary) transparent',
                }}
              >
                {filteredRooms.map((room) => {
                  const thumbSrc = getRoomImage(room);
                  const isActive = activeRoom?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        flex: '0 0 160px',
                        height: '180px',
                        maxWidth: '160px',
                        borderRadius: 'var(--border-radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isActive ? '2.5px solid var(--primary)' : '2px solid var(--border)',
                        boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        transform: isActive ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--primary-hover)'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <img
                        src={thumbSrc}
                        alt={room.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                      />
                      {/* Overlay con nombre */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: isActive
                          ? 'linear-gradient(to top, rgba(160,68,42,0.80) 0%, transparent 55%)'
                          : 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 55%)',
                        display: 'flex', alignItems: 'flex-end',
                        padding: '0.4rem 0.5rem',
                        transition: 'background 0.25s ease',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.65rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          color: '#fff', lineHeight: 1.2,
                        }}>
                          {room.nombre}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
};