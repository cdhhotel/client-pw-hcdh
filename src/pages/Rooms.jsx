import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BedDouble, ShieldCheck, Tag } from 'lucide-react';

export const Rooms = () => {
  const navigate = useNavigate();
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');

  const roomsData = [
    {
      id: 'estandar-sencilla',
      name: 'Estándar Colonial Sencilla',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80',
      description: 'Acogedora habitación decorada con acabados rústicos, cama King size y vistas al callejón histórico.',
      price: 1500,
      capacity: 2,
      beds: '1 Cama King Size',
      amenities: ['Wifi Gratis', 'Smart TV', 'Cafetera Orgánica', 'Caja Fuerte'],
    },
    {
      id: 'doble-deluxe',
      name: 'Doble Colonial Deluxe',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
      description: 'Ideal para familias. Cuenta con dos amplias camas Queen size y hermosos baños revestidos en azulejo Talavera.',
      price: 2200,
      capacity: 4,
      beds: '2 Camas Queen Size',
      amenities: ['Wifi Gratis', 'Smart TV', 'Cafetera Orgánica', 'Minibar', 'Aire Acondicionado'],
    },
    {
      id: 'junior-suite',
      name: 'Junior Suite Dolores',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
      description: 'Hermosa habitación con balcón de herrería colonial al jardín central y tina de baño artesanal de cobre.',
      price: 2400,
      capacity: 2,
      beds: '1 Cama King Size',
      amenities: ['Wifi Gratis', 'Pantalla 55"', 'Tina de Cobre', 'Cafetera Espresso', 'Batas de Lujo'],
    },
    {
      id: 'master-suite',
      name: 'Master Suite Presidencial',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
      description: 'Nuestra suite insignia. Dispone de chimenea de cantera tallada, sala de estar privada y la mayor comodidad del hotel.',
      price: 3800,
      capacity: 4,
      beds: '2 Camas King Size',
      amenities: ['Wifi Premium', '2 Smart TVs', 'Chimenea', 'Minibar Premium', 'Tina Hidromasaje', 'Desayuno en Habitación'],
    },
  ];

  // Filtrado de Habitaciones
  const filteredRooms = roomsData
    .filter((room) => {
      if (filterCapacity === 'all') return true;
      if (filterCapacity === '2') return room.capacity === 2;
      if (filterCapacity === '4') return room.capacity === 4;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'low-high') return a.price - b.price;
      if (sortOrder === 'high-low') return b.price - a.price;
      return 0;
    });

  const handleBooking = (roomId) => {
    navigate(`/booking?room=${roomId}`);
  };

  return (
    <div className="animate-fade-in container py-section">
      <h1 className="section-title">Habitaciones & Suites</h1>
      <p className="section-subtitle">Cada habitación es una pieza de arte y confort único</p>

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
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Filtro de Capacidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Capacidad:</span>
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="form-control"
              style={{ padding: '0.4rem 1.5rem 0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="all">Todas las capacidades</option>
              <option value="2">Hasta 2 Huéspedes</option>
              <option value="4">Hasta 4 Huéspedes</option>
            </select>
          </div>

          {/* Ordenar por Precio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ordenar:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-control"
              style={{ padding: '0.4rem 1.5rem 0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="none">Por defecto</option>
              <option value="low-high">Precio: Menor a Mayor</option>
              <option value="high-low">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Mostrando <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{filteredRooms.length}</span> suites
        </div>
      </div>

      {/* Grid de Habitaciones */}
      <div className="grid grid-2" style={{ gap: '2.5rem' }}>
        {filteredRooms.map((room) => (
          <div key={room.id} className="room-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="room-card-image" style={{ height: '280px' }}>
              <img src={room.image} alt={room.name} />
              <div className="room-card-price">${room.price} MXN / Noche</div>
            </div>
            
            <div className="room-card-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
              <div>
                <h2 className="room-card-title" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{room.name}</h2>
                <p className="room-card-desc" style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{room.description}</p>
                
                {/* Detalles rápidos */}
                <div className="room-card-features" style={{ marginBottom: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={16} /> Max {room.capacity} personas</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BedDouble size={16} /> {room.beds}</span>
                </div>

                {/* Amenidades */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                  {room.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-linen)',
                        border: '1px solid var(--border)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <ShieldCheck size={12} style={{ color: 'var(--secondary)' }} /> {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleBooking(room.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem', padding: '0.9rem' }}
                >
                  <Tag size={18} /> Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
