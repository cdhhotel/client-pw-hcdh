import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Coffee, Waves, MapPin, Compass, Bed, Wifi, Bath } from 'lucide-react';

import portadaInicio from '../assets/portada-inicio.jpg';

export const Home = () => {
  const navigate = useNavigate();

  const [hoveredId, setHoveredId] = useState('junior-suite');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate('/booking');
  };

  {/*Habitaciones principales */ }
  const featuredRooms = [
    {
      id: 'terraza',
      name: 'Terraza',
      image: 'https://a0.muscache.com/im/pictures/miso/Hosting-1245172177357055990/original/faaab88c-425a-4c3d-b289-00fe40ae3f59.jpeg?im_w=1200',
      description: 'Terraza con vista al jardín central.',
      price: 2400,
      capacity: '',
      beds: '',
    },
    {
      id: 'estelar',
      name: 'Habitación Estelar',
      image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1245172177357055990/original/5f6db88d-8905-485c-9b71-d7219b000f56.jpeg?im_w=1200',
      description: 'Ideal para quienes buscan amplitud, confort y una vista única de la ciudad.',
      price: 2400,
      capacity: '2 Adultos',
      beds: '1 Cama Matrimonial',
    },
  ];

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
            padding: '1.5rem 2rem',
            borderRadius: 'var(--border-radius-md)',
            width: '100%',
            maxWidth: '900px',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            position: 'absolute',
            bottom: '-40px',
            color: 'var(--text-main)',
          }}
        >
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Llegada
            </label>
            <input type="date" className="form-control" style={{ width: '100%' }} required />
          </div>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Salida
            </label>
            <input type="date" className="form-control" style={{ width: '100%' }} required />
          </div>
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Huéspedes
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
        </form>
      </section>

      <div style={{ height: '80px' }}></div>

      {/* Bienvenida */}
      <section className="py-section container text-center">
        <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          Bienvenido a Casa Dolores Hidalgo
        </span>
        <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Donde la tradición se encuentra con el confort</h2>
        <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8' }}>
          Ubicado en una casona señorial del siglo XVIII restaurada meticulosamente, el Hotel Casa Dolores preserva el esplendor de la época colonial combinándolo con amenidades modernas de la más alta calidad. Nuestras habitaciones lucen bóvedas de ladrillo hechas a mano, muros de cantera local, y decoraciones de Talavera pintadas por artesanos de Dolores Hidalgo.
        </p>
      </section>

      {/* Habitaciones Destacadas*/}
      <section style={{ backgroundColor: '#1C1510', padding: '5rem 0', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '100%', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              Descansa con estilo
            </span>
            <h2 className="section-title" style={{ color: '#F5F0E6', marginTop: '0.5rem' }}>Habitaciones Destacadas</h2>
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
            {featuredRooms.map((room, index) => {
              const activeId = hoveredId || 'junior-suite';
              const isFrameEmpty = activeId !== room.id;

              return (
                <div
                  key={room.id}
                  onMouseEnter={() => setHoveredId(room.id)}
                  style={{
                    flex: isFrameEmpty ? '0 0 280px' : '0 0 400px',
                    height: '500px',
                    backgroundColor: isFrameEmpty ? 'transparent' : 'var(--white)',
                    border: isFrameEmpty ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Vista de frame vacio */}
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
                        fontSize: '1rem',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: 'rgba(245, 240, 230, 0.8)',
                        lineHeight: '1.4',
                        marginTop: '1.5rem'
                      }}>
                        {room.name}
                      </h3>
                    </div>
                  )}

                  {/* Vista de frame activo*/}
                  {!isFrameEmpty && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                      {/* Título */}
                      <div style={{ padding: '2rem 1rem 1rem 1rem', textAlign: 'center' }}>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          color: 'var(--secondary)'
                        }}>
                          {room.name}
                        </h3>
                      </div>

                      {/* Imagen */}
                      <div style={{ position: 'relative', height: '220px', margin: '0 1.25rem', overflow: 'hidden' }}>
                        <img
                          src={room.image}
                          alt={room.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Texto y Botón*/}
                      <div style={{
                        padding: '1.5rem 2rem 2rem 2rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexGrow: 1
                      }}>
                        <p style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                          lineHeight: '1.5',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {room.description}
                        </p>

                        <button
                          onClick={() => navigate(`/habitacion/${room.id}`)}
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
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 1)'}
                        >
                          Ver más
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
      <section style={{ backgroundColor: 'var(--bg-sand)', padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title">¿En dónde nos ubicamos?</h2>
          <p className="section-subtitle">Visítanos en el corazón de Dolores Hidalgo</p>
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
            <div style={{ flex: '2 1 400px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', minHeight: '380px' }}>
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
      <section className="py-section" style={{ backgroundColor: 'var(--bg-linen)', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem', display: 'block' }}>
              Más allá de tu habitación
            </span>
            <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Vive Dolores Hidalgo</h2>
            <p className="section-subtitle">
              Cada rincón de este pueblo guarda una historia. Nosotros te abrimos las puertas para vivirla.
            </p>
          </div>

          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '1rem 0 4rem 0'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                maxWidth: '920px',
                width: '100%',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--border-radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ flex: '1 1 400px', height: '300px', overflow: 'hidden' }}>
                <img
                  src="https://ntcd.mx/uploads/2017/01/24/db85f730ffcfe46681fa2db9ac4d8c5e.jpg"
                  alt="Experiencias en Dolores Hidalgo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{
                flex: '1 1 400px',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>
                  Prepara un viaje inolvidable
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Antes de reservar, te sugerimos explorar nuestra lista completa de experiencias locales guiadas, talleres artesanales de Talavera y catas tradicionales en la Cuna de la Independencia.
                </p>
                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ¿Quieres una experiencia personalizada para tu grupo?
                  </p>
                  <button onClick={() => navigate('/contacto')} className="btn btn-primary" style={{ padding: '0.9rem 2.5rem' }}>
                    Hablemos de tu estancia ideal
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>
    </div>
  );
};