import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Coffee, Waves, MapPin, Compass, Bed, Wifi, Bath, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';

import portadaInicio from '../../../assets/background-home.jpeg';
import bgsecondary from '../../../assets/bg-secondary.png';
import videoEjemplo from '../../../assets/videoejemplo.mp4';


const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80';

function getRoomImage(room) {
  const imagenes = room?.atributos_extra?.imagenes;
  if (Array.isArray(imagenes) && imagenes.length > 0) {
    return imagenes[0];
  }
  return FALLBACK_IMAGE;
}

export const Home = () => {
  const navigate = useNavigate();

  const [hoveredId, setHoveredId] = useState(null);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await api.get('/room/rooms');
        const data = response?.data ?? response;
        const disponibles = Array.isArray(data)
          ? data.filter((r) => r.estatus === 'disponible')
          : [];
        setFeaturedRooms(disponibles);
        if (disponibles.length > 0 && !hoveredId) {
          setHoveredId(disponibles[0].id);
        }
      } catch (err) {
        console.error('Error al cargar habitaciones:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate('/booking');
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          height: '80vh',
          backgroundImage: `linear-gradient(rgba(43, 37, 34, 0.4), rgba(43, 37, 34, 0.6)), url(${portadaInicio})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '0 1.5rem',
          paddingTop: 'var(--navbar-height)',
          marginTop: 'calc(-1 * var(--navbar-height))',
          backdropFilter: 'blur(15px)',
        }}
      >
        <h1 style={{ color: '#fff', fontSize: '3.5rem', marginBottom: '1.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Un Refugio de Serenidad e Historia
        </h1>
        <p style={{ fontSize: '1.3rem', maxWidth: '700px', marginBottom: '3rem', fontFamily: 'var(--font-sans)', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          Descubre el encanto colonial y el lujo artesanal en el corazón de Dolores Hidalgo, Cuna de la Independencia Nacional.
        </p>

        <form
          onSubmit={handleQuickSearch}
          className="glass-panel"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem 2rem',
            borderRadius: 'var(--border-radius-md)',
            width: '100%',
            maxWidth: '900px',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            position: 'absolute',
            bottom: '-40px',
            color: 'var(--text-main)',
            backgroundColor: 'rgba(82, 56, 35, 0.92)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(82, 56, 35, 0.37)',
          }}
        >
          <>
            {/* Llegada */}
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--white)'
              }}>
                <Calendar size={14} />
                <span>Llegada</span>
              </label>
              <input type="date" className="form-control" style={{ width: '100%' }} required />
            </div>

            {/* Salida */}
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--white)'
              }}>
                <Calendar size={14} />
                <span>Salida</span>
              </label>
              <input type="date" className="form-control" style={{ width: '100%' }} required />
            </div>

            {/* Huéspedes */}
            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--white)'
              }}>
                <Users size={14} />
                <span>Huéspedes</span>
              </label>
              <select className="form-control" style={{ width: '100%' }}>
                <option value="1">1 Huésped</option>
                <option value="2">2 Huéspedes</option>
                <option value="3">3 Huéspedes</option>
                <option value="4">4+ Huéspedes</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', height: '46px' }}>
              Buscar Tarifa
            </button>
          </>

        </form>
      </section>

      <div style={{ height: '80px' }}></div>
      {/* Bienvenida */}
      <section
        style={{
          backgroundImage: `linear-gradient(rgba(20, 12, 6, 0), rgba(20, 12, 6, 0)), url(${bgsecondary})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '5rem 0',
        }}
      >
        <div className="container text-center">
          <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            Bienvenido a Casa Dolores Hidalgo
          </span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.5rem', color: '#F5F0E6' }}>
            Donde la tradición se encuentra con el confort
          </h2>
          <p style={{ maxWidth: '800px', margin: '0 auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.05rem', lineHeight: '1.8' }}>
            Ubicado en una casona señorial del siglo XVIII restaurada meticulosamente, el Hotel Casa Dolores preserva el esplendor de la época colonial combinándolo con amenidades modernas de la más alta calidad. Nuestras habitaciones lucen bóvedas de ladrillo hechas a mano, muros de cantera local, y decoraciones de Talavera pintadas por artesanos de Dolores Hidalgo.
          </p>
        </div>
      </section>

      {/* Habitaciones */}
      <section style={{ padding: '5rem 0', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '100%', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              Descansa con estilo
            </span>
            <h2 className="section-title">
              Habitaciones
            </h2>
            <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>
              Espacios únicos que combinan la calidez colonial con el confort moderno.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.5rem',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            overflowX: 'auto',
            paddingBottom: '1.5rem'
          }}>
            {loadingRooms ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '3rem 0' }}>
                <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <span style={{ color: 'var(--text-muted)' }}>Cargando habitaciones...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : featuredRooms.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '3rem 0', color: 'var(--text-muted)' }}>
                No hay habitaciones disponibles en este momento.
              </div>
            ) : featuredRooms.map((room) => {
              const activeId = hoveredId || (featuredRooms[0] ? featuredRooms[0].id : null);
              const isFrameEmpty = activeId !== room.id;
              const imageSrc = getRoomImage(room);
              const descripcion = room.descripcion_corta || room.descripcion_larga || 'Sin descripción disponible.';

              return (
                <div
                  key={room.id}
                  onMouseEnter={() => setHoveredId(room.id)}
                  className={`flex-shrink-0 relative flex flex-col justify-between transition-all duration-700 ease-in-out cursor-pointer overflow-hidden ${isFrameEmpty
                    ? 'w-[100px] md:w-[140px] bg-transparent border border-black/15'
                    : 'w-[280px] md:w-[680px] bg-[var(--white)] border-transparent'
                    }`}
                  style={{ height: '400px' }}
                >
                  {/* IMAGEN DE FONDO */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={room.nombre}
                      className={`w-full h-full object-cover transition-all duration-700 ${isFrameEmpty ? 'scale-100 blur-[1px]' : 'scale-105 md:group-hover:scale-110'
                        }`}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                  </div>

                  {/* VISTA DE FRAME VACÍO */}
                  {isFrameEmpty && (
                    <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center border border-[var(--primary)] bg-[var(--bg-sand)]/70 backdrop-blur-[2px] transition-all duration-500">
                      <h3 className="text-sm md:text-lg font-sans font-bold uppercase tracking-widest text-[var(--secondary-hover)] leading-relaxed transform md:-rotate-90 md:whitespace-nowrap transition-transform duration-500">
                        {room.nombre}
                      </h3>
                    </div>
                  )}
                  {/* VISTA DE FRAME ACTIVO */}
                  {!isFrameEmpty && (
                    <div className="absolute inset-0 h-full w-full border-2 border-[var(--primary)] group dynamic-fade-in">
                      <div className="absolute inset-0 bg-black/40 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center">
                        <h3
                          className="text-xl md:text-3xl font-sans font-extrabold uppercase tracking-[0.2em] drop-shadow-lg mb-8"
                          style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                        >
                          {room.nombre}
                        </h3>
                        <button
                          onClick={() => navigate(`/rooms?room=${room.id}`)}
                          className="btn btn-primary" style={{ padding: '0.8rem 2rem', height: '46px' }}>
                          Ver Más
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              );
            })}
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section style={{
        backgroundColor: 'var(--secondary)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '5rem 0',
      }}>
        <div className="container" >
          <h2 className="section-title" style={{ color: '#FDF6EC' }}>¿En dónde nos ubicamos?</h2>
          <p className="section-subtitle" style={{ color: 'var(--bg-sand)' }}>Visítanos en el corazón de Dolores Hidalgo</p>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'stretch', flexWrap: 'wrap', marginTop: '2.5rem' }}>
            <div className="glass-panel" style={{ flex: '1 1 260px', padding: '2.5rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(193,92,61,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Dirección</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Av. San Luis Potosí 22, Centro<br />
                    Dolores Hidalgo, C.I.N, Gto. C.P. 37800
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(193,92,61,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                  <Coffee size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>Check-in / Check-out</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Entrada: 3:00 PM<br />
                    Salida: 12:00 PM
                  </p>
                </div>
              </div>
              <a href="https://maps.app.goo.gl/jcFMND3Y3yh6sVS48" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textAlign: 'center', marginTop: 'auto' }}>
                Cómo llegar
              </a>
            </div>
            <div style={{ flex: '2 1 400px', overflow: 'hidden', minHeight: '380px' }}>
              <iframe
                title="Ubicación Hotel Casa Dolores"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d465.1020714536951!2d-100.93419207720613!3d21.159696861784205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842b3f0039d1a813%3A0x1f0b300e0b0eb125!2sHotel%20Casa%20Dolores%20Hidalgo!5e0!3m2!1ses!2smx!4v1781106275961!5m2!1ses!2smx"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: '380px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Experiencias */}
      <section style={{ backgroundColor: 'var(--bg-sand)', overflow: 'hidden', padding: '5rem 0' }}>
        <div className="container">

          {/* Encabezado */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.8rem', display: 'block', marginBottom: '0.75rem' }}>
              Más allá de tu habitación
            </span>
            <h2 className="section-title" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, margin: 0
            }}>
              Vive Dolores Hidalgo
            </h2>
            <div style={{ width: '50px', height: '2px', background: 'var(--gold)', margin: '1rem auto 0' }} />
          </div>

          {/* Layout dos columnas */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'stretch',
          }}>

            {/* Columna izquierda — Video */}
            <div style={{
              flex: '1 1 420px',
              position: 'relative',
              borderRadius: '2px',
              overflow: 'hidden',
              minHeight: '480px',
              border: '1px solid rgba(179,138,58,0.2)',
              // sombras
              boxShadow: '0 16px 40px rgba(107, 74, 47, 0.18)',
            }}>
              <video
                src={videoEjemplo}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Overlay sutil */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(30,18,10,0.6) 0%, transparent 60%)',
                pointerEvents: 'none'
              }} />
              {/* Badge sobre el video */}
              <div style={{
                position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 2,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-block', width: '8px', height: '8px',
                  borderRadius: '50%', backgroundColor: '#ef4444',
                  animation: 'pulse-dot 1.5s ease-in-out infinite'
                }} />
              </div>
            </div>
            <div style={{
              flex: '1 1 360px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              justifyContent: 'space-between',
            }}>
              {[
                {
                  icon: '',
                  titulo: 'Talleres de Talavera',
                  desc: 'Aprende de manos de artesanos locales el arte milenario de la cerámica de Talavera, Patrimonio Cultural Inmaterial de la Humanidad.',
                  tag: 'Artesanía'
                },
                {
                  icon: '',
                  titulo: 'Gastronomía Tradicional',
                  desc: 'Recorre los mercados y prueba los sabores auténticos de Guanajuato: enchiladas mineras, carnitas y dulces típicos de Dolores Hidalgo.',
                  tag: 'Cultura'
                },
                {
                  icon: '',
                  titulo: 'Ruta de Independencia',
                  desc: 'Sigue los pasos del Padre Hidalgo por sitios históricos únicos: la parroquia, la cárcel y el museo donde nació el grito de libertad.',
                  tag: 'Historia'
                }
              ].map((exp, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--primary)',
                    borderRadius: '2px',
                    padding: '1.5rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
                    cursor: 'default',
                    flex: 1,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.background = 'rgba(179,138,58,0.1)';
                    e.currentTarget.style.borderColor = 'var(--gold)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(179,138,58,0.2)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{exp.icon}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px',
                      textTransform: 'uppercase', color: 'var(--primary)',
                      border: '1px solid var(--primary)',
                      padding: '0.15rem 0.5rem', borderRadius: '1px'
                    }}>{exp.tag}</span>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)', color: '#6b3f02ff',
                    fontSize: '1.15rem', fontWeight: 600, margin: 0
                  }}>{exp.titulo}</h3>
                  <p style={{ color: 'rgba(41, 21, 9, 1)', fontSize: '0.875rem', lineHeight: '1.7', margin: 0 }}>
                    {exp.desc}
                  </p>
                </div>
              ))}

              {/* CTA */}
              <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => navigate('/itinerary')}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1.5px solid var(--gold)',
                    color: 'var(--gold)',
                    padding: '0.85rem 2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '1px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gold)';
                    e.currentTarget.style.color = 'var(--secondary-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--gold)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Hablemos de tu estancia ideal
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Animación del punto rojo */}
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.4); }
          }
        `}</style>
      </section>
    </div>
  );
};