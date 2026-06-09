import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Coffee, Waves, MapPin, Compass } from 'lucide-react';
import portadaInicio from '../assets/portada-inicio.jpg';

export const Home = () => {
  const navigate = useNavigate();

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate('/booking');
  };

  const featuredRooms = [
    {
      id: 'junior-suite',
      name: 'Junior Suite Dolores',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
      description: 'Hermosa habitación con balcón de herrería colonial al jardín central y tina de baño artesanal.',
      price: 2400,
      capacity: '2 Adultos',
      beds: '1 Cama King Size',
    },
    {
      id: 'master-suite',
      name: 'Master Suite Presidencial',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
      description: 'Nuestra suite más lujosa, equipada con chimenea de cantera, sala de estar independiente y acabados de Talavera.',
      price: 3800,
      capacity: '4 Adultos',
      beds: '2 Camas King Size',
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

        {/* Floating Quick Search Bar */}
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

      {/* Espacio para compensar la barra flotante */}
      <div style={{ height: '80px' }}></div>

      {/* Welcome & Story */}
      <section className="py-section container text-center">
        <span style={{ color: 'var(--primary)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          Bienvenido a Casa Dolores
        </span>
        <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Donde la tradición se encuentra con el confort</h2>
        <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8' }}>
          Ubicado en una casona señorial del siglo XVIII restaurada meticulosamente, el Hotel Casa Dolores preserva el esplendor de la época colonial combinándolo con amenidades modernas de la más alta calidad. Nuestras habitaciones lucen bóvedas de ladrillo hechas a mano, muros de cantera local, y decoraciones de Talavera pintadas por artesanos de Dolores Hidalgo.
        </p>
      </section>

      {/* Services Section */}
      <section style={{ backgroundColor: 'var(--bg-sand)', padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title">Nuestras Experiencias</h2>
          <p className="section-subtitle">Detalles diseñados para deleitar tus sentidos</p>

          <div className="grid grid-4">


            <div className="glass-panel text-center animate-fade-in" style={{ padding: '2.5rem 1.5rem', borderRadius: 'var(--border-radius-md)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(193,92,61,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <MapPin size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Ubicación Única</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                A tan solo unos pasos de la histórica Parroquia de Nuestra Señora de los Dolores y los museos de la Independencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-section container">
        <h2 className="section-title">Suites Exclusivas</h2>
        <p className="section-subtitle">Tu santuario de descanso te espera</p>

        <div className="grid grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {featuredRooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-card-image">
                <img src={room.image} alt={room.name} />
                <div className="room-card-price">${room.price} MXN / Noche</div>
              </div>
              <div className="room-card-content">
                <h3 className="room-card-title">{room.name}</h3>
                <p className="room-card-desc">{room.description}</p>
                <div className="room-card-features">
                  <span>👥 {room.capacity}</span>
                  <span>🛏️ {room.beds}</span>
                </div>
                <button onClick={() => navigate('/booking')} className="btn btn-outline" style={{ width: '100%' }}>
                  Reservar Habitación
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <button onClick={() => navigate('/rooms')} className="btn btn-secondary">
            Ver Todas las Habitaciones
          </button>
        </div>
      </section>
    </div>
  );
};
