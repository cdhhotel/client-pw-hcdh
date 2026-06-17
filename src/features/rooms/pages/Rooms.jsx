import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BedDouble, ShieldCheck, Tag, Loader2, AlertCircle, LayoutGrid } from 'lucide-react';
import { api } from '../../../services/api';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80';

/** Primera imagen de atributos_extra o fallback */
function getRoomImage(room) {
  const imagenes = room?.atributos_extra?.imagenes;
  if (Array.isArray(imagenes) && imagenes.length > 0) {
    const src = imagenes[0];
    return src;
  }
  return FALLBACK_IMAGE;
}

/** Amenidades guardadas en atributos_extra */
function getAmenidades(room) {
  const extra = room?.atributos_extra;
  if (!extra) return [];
  if (Array.isArray(extra.amenidades)) return extra.amenidades;
  if (Array.isArray(extra.amenities)) return extra.amenities;

  // Si los atributos booleanos están presentes, los mostramos como chips
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
  const [hoveredId, setHoveredId] = useState(null);

  // ── Carga desde el backend ────────────────────────────────────────────────
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/room/rooms');
        const data = response?.data ?? response;
        // Solo mostrar habitaciones disponibles al público
        const disponibles = Array.isArray(data)
          ? data.filter((r) => r.estatus === 'disponible')
          : [];
        setRooms(disponibles);
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

  const handleBooking = (roomId) => {
    navigate(`/booking?room=${roomId}`);
  };

  // ── Estado: cargando ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="animate-fade-in container py-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1.25rem',
        }}
      >
        <Loader2
          size={48}
          style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }}
        />
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        <AlertCircle size={48} style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '1.4rem' }}>Error al cargar habitaciones</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ marginTop: '0.5rem' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in container py-section" style={{ backgroundColor: '#1C1510', padding: '5rem 2rem', borderRadius: 'var(--border-radius-lg)' }}>
      {/* Encabezado de la Sección */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ color: 'var(--gold, #D4AF37)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Descansa con estilo
        </span>
        <h1 className="section-title" style={{ color: '#F5F0E6', marginTop: '0.5rem', fontSize: '2.5rem' }}>Habitaciones &amp; Suites</h1>
        <p className="section-subtitle" style={{ color: 'var(--text-muted, #A0A0A0)', marginTop: '0.5rem' }}>
          Cada habitación es una pieza de arte y confort único. Espacios que combinan calidez y modernidad.
        </p>
      </div>

      {/* Panel de Filtros */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          padding: '1.25rem 2rem',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: '3rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Filtro de Capacidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(245, 240, 230, 0.8)' }}>
              Capacidad:
            </span>
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="form-control"
              style={{ padding: '0.4rem 1.5rem 0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#2C221E', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <option value="all">Todas las capacidades</option>
              <option value="2">Hasta 2 Huéspedes</option>
              <option value="4">Hasta 4 Huéspedes</option>
            </select>
          </div>

          {/* Ordenar por Precio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(245, 240, 230, 0.8)' }}>
              Ordenar:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-control"
              style={{ padding: '0.4rem 1.5rem 0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#2C221E', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <option value="none">Por defecto</option>
              <option value="low-high">Precio: Menor a Mayor</option>
              <option value="high-low">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'rgba(245, 240, 230, 0.8)', fontWeight: 500 }}>
          Mostrando{' '}
          <span style={{ color: 'var(--gold, #D4AF37)', fontWeight: 'bold' }}>
            {filteredRooms.length}
          </span>{' '}
          {filteredRooms.length === 1 ? 'habitación' : 'habitaciones'}
        </div>
      </div>

      {/* Estado vacío */}
      {filteredRooms.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'rgba(245, 240, 230, 0.6)',
          }}
        >
          <LayoutGrid size={48} style={{ opacity: 0.35 }} />
          <p style={{ fontSize: '1.1rem' }}>
            No hay habitaciones disponibles con los filtros seleccionados.
          </p>
        </div>
      ) : (
        /* Carrusel / Acordeón Desplegable*/
        <div
          className="container-accordion"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.5rem',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            overflowX: 'auto',
            paddingBottom: '1.5rem',
          }}
        >
          {filteredRooms.map((room) => {
            const imageSrc = getRoomImage(room);
            const precio = Number(room.precio_base_noche) || 0;
            const descripcion = room.descripcion_corta || room.descripcion_larga || 'Sin descripción disponible.';


            const activeId = hoveredId || (filteredRooms[0] ? filteredRooms[0].id : null);
            const isFrameEmpty = activeId !== room.id;

            return (
              <div
                key={room.id}
                onMouseEnter={() => setHoveredId(room.id)}
                style={{
                  flex: isFrameEmpty ? '0 0 240px' : '0 0 380px',
                  height: '500px',
                  backgroundColor: isFrameEmpty ? 'transparent' : 'var(--white, #FFF)',
                  border: isFrameEmpty ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  cursor: 'pointer',
                }}
              >
                {/* VISTA TARJETA CONTRAÍDA  */}
                {isFrameEmpty && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '2.5rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: 'rgba(245, 240, 230, 0.8)',
                      lineHeight: '1.4',
                      marginTop: '1.5rem'
                    }}>
                      {room.nombre}
                    </h3>
                  </div>
                )}

                {/* VISTA TARJETA EXPANDIDA */}
                {!isFrameEmpty && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                    {/* Título */}
                    <div style={{ padding: '1.5rem 1rem 0.75rem 1rem', textAlign: 'center' }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: 'var(--secondary, #1C1510)'
                      }}>
                        {room.nombre}
                      </h3>
                    </div>

                    {/* Imagen y Precio */}
                    <div style={{ position: 'relative', height: '200px', margin: '0 1.25rem', overflow: 'hidden' }}>
                      <img
                        src={imageSrc}
                        alt={room.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        color: '#FFF',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        ${precio.toLocaleString('es-MX')} MXN / Noche
                      </div>
                    </div>

                    {/* Cuerpo de texto*/}
                    <div style={{
                      padding: '1.25rem 1.5rem 1.5rem 1.5rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexGrow: 1
                    }}>
                      <p style={{
                        color: 'var(--text-muted, #555)',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {descripcion}
                      </p>

                      <button
                        onClick={() => handleBooking(room.id)}
                        className="btn"
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(0, 0, 0, 1)',
                          color: '#FFF',
                          border: 'none',
                          padding: '0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          borderRadius: '0px',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary, #D4AF37)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 1)'}
                      >
                        Reservar Ahora
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
