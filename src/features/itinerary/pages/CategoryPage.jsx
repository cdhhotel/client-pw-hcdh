import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, X, MapPin, Map } from 'lucide-react';
import { api } from '../../../services/api';
import { getCategoryBySubcategory, ITINERARY_CATEGORIES } from '../constants/categories';
import { verificarDisponibilidad } from '../utils/availability';
import { ActivityCard } from '../components/ActivityCard';
import { ActivityMap } from '../components/ActivityMap';
import portadaInicio from '../../../assets/background-home.jpeg';

export const CategoryPage = () => {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const catKey = (categoryKey || 'COMIDA').toUpperCase();

  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del planificador local
  const [plan, setPlan] = useState({});
  const [selectedDay, setSelectedDay] = useState(1);
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('itinerary_start_date') || new Date().toISOString().substring(0, 10);
  });

  const selectedDayDate = useMemo(() => {
    if (!startDate) return null;
    const baseDate = new Date(startDate + 'T00:00:00');
    baseDate.setDate(baseDate.getDate() + (selectedDay - 1));
    return baseDate;
  }, [startDate, selectedDay]);

  // Estados para el mapa y responsividad sin Tailwind
  const [selectedMapActivity, setSelectedMapActivity] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Escuchar tamaño de ventana para ajustar layouts responsivos
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Cargar datos ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (categoryKey === 'EVENTOS') {
          const res = await api.get('/hotel/eventos-locales');
          const allEvents = res.data?.data || res.data || [];
          
          // Mapear eventos locales para que emulen el formato de un sitio_cercano y funcionen en el listado/mapa sin alterar otros componentes
          const mappedEvents = allEvents.map(ev => ({
            id: ev.id,
            nombre: ev.nombre,
            descripcion: ev.descripcion,
            categoria: 'Eventos',
            direccion: ev.sitio_cercano?.nombre 
              ? `${ev.sitio_cercano.nombre} - ${ev.sitio_cercano.direccion || ''}` 
              : 'Dolores Hidalgo, Gto.',
            horario: ev.fecha_inicio 
              ? `${new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { timeZone: 'UTC' })}${ev.fecha_fin ? ` al ${new Date(ev.fecha_fin).toLocaleDateString('es-MX', { timeZone: 'UTC' })}` : ''}`
              : ev.mes_referencia || 'Temporada',
            latitud: ev.sitio_cercano?.latitud ? Number(ev.sitio_cercano.latitud) : 21.1578,
            longitud: ev.sitio_cercano?.longitud ? Number(ev.sitio_cercano.longitud) : -100.9312,
            imagen_url: ev.sitio_cercano?.imagen_url || null,
            distancia_km: ev.sitio_cercano?.distancia_km || null,
            tiempo_estimado_minutos: ev.sitio_cercano?.tiempo_estimado_minutos || null,
            sitio_web: ev.sitio_cercano?.sitio_web || null,
            link_maps: ev.sitio_cercano?.link_maps || null,
            telefono: ev.sitio_cercano?.telefono || null,
            correo_contacto: ev.sitio_cercano?.correo_contacto || null,
            redes_sociales: ev.sitio_cercano?.redes_sociales || null,
            servicios: ev.sitio_cercano?.servicios || null,
            especificaciones: ev.sitio_cercano?.especificaciones || null,
            isEventoLocal: true,
            fecha_inicio: ev.fecha_inicio,
            fecha_fin: ev.fecha_fin
          }));
          setLugares(mappedEvents);
        } else {
          const res = await api.get('/hotel/sitios-cercanos');
          const allPlaces = res.data?.data || res.data || [];
          
          // Filtrar por la categoría actual
          const subcategories = ITINERARY_CATEGORIES[categoryKey] || [];
          const filtered = allPlaces.filter(place => 
            subcategories.includes(place.categoria)
          );
          setLugares(filtered);
        }
      } catch (err) {
        console.error(err);
        setError('Ocurrió un error al cargar las actividades.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryKey]);

  // ── Cargar plan y día activo desde localStorage ──
  useEffect(() => {
    const savedPlan = localStorage.getItem('itinerary_plan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error(e);
      }
    }
    const savedDay = localStorage.getItem('itinerary_selected_day');
    if (savedDay) {
      setSelectedDay(Number(savedDay));
    }
  }, []);

  // ── Filtrar por categoría principal ──
  const filteredLugares = useMemo(() => {
    return lugares.filter(
      l => getCategoryBySubcategory(l.categoria) === catKey
    );
  }, [lugares, catKey]);

  // ── Agrupar por subcategoría ──
  const grouped = useMemo(() => {
    const group = {};
    // Pre-inicializar con las subcategorías oficiales de esta categoría principal
    const officialSubs = ITINERARY_CATEGORIES[catKey] || [];
    officialSubs.forEach(sub => {
      group[sub] = [];
    });

    filteredLugares.forEach(lugar => {
      const sub = lugar.categoria || 'General';
      if (!group[sub]) {
        group[sub] = [];
      }
      group[sub].push(lugar);
    });
    return group;
  }, [filteredLugares, catKey]);

  // ── Seleccionado local ──
  const isSelected = (id) => (plan[selectedDay] || []).includes(id);

  // ── Toggle local ──
  const handleToggle = (lugar) => {
    setPlan(prev => {
      const dayIds = prev[selectedDay] || [];
      const isIn = dayIds.includes(lugar.id);
      const updated = {
        ...prev,
        [selectedDay]: isIn
          ? dayIds.filter(id => id !== lugar.id)
          : [...dayIds, lugar.id]
      };
      // Guardar en localStorage
      localStorage.setItem('itinerary_plan', JSON.stringify(updated));
      return updated;
    });
  };

  // ── Guardar y volver ──
  const handleSave = () => {
    localStorage.setItem('itinerary_plan', JSON.stringify(plan));
    navigate('/itinerary');
  };

  // ── Cancelar y volver ──
  const handleCancel = () => {
    navigate('/itinerary');
  };

  return (
    <div 
      style={{ 
        background: 'var(--bg-linen)', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-main)',
        marginTop: 'calc(-1 * var(--navbar-height))'
      }}
    >
      {/* Banner oscuro para dar contraste al Navbar transparente superior */}
      <div 
        style={{
          height: 'var(--navbar-height)',
          width: '100%',
          backgroundImage: `linear-gradient(rgba(43, 37, 34, 0.55), rgba(43, 37, 34, 0.55)), url(${portadaInicio})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0
        }}
      />
      {/* Header Sticky (Estandarizado en tonos claros crema, sin Tailwind) */}
      <div
        style={{
          background: 'rgba(253, 251, 247, 0.9)', // var(--white) translúcido
          borderBottom: '1px solid var(--border)',
          height: '80px',
          zIndex: 50,
          flexShrink: 0,
          width: '100%'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: isMobile ? '0 1rem' : '0 2rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              color: 'var(--primary)',
              fontFamily: 'var(--font-sans)',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <ArrowLeft size={18} /> Volver
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: isMobile ? '1.25rem' : '1.75rem',
                fontFamily: 'var(--font-serif)',
                margin: 0,
                textTransform: 'capitalize',
                color: 'var(--primary)',
                fontWeight: 'bold'
              }}
            >
              {categoryKey?.toLowerCase()}
            </h1>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0, fontFamily: 'var(--font-sans)', letterSpacing: '0.02em', color: 'var(--text-muted)' }}>
              Agregando actividades para el <strong>Día {selectedDay}</strong>
            </p>
          </div>

          <button
            onClick={handleSave}
            style={{
              padding: '0.625rem 1.25rem',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              background: 'var(--primary)',
              color: 'var(--bg-linen)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              borderRadius: 'var(--border-radius-sm)', // Esquinas rectas hacienda
              boxShadow: '0 4px 8px rgba(160, 68, 42, 0.12)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Main Content Area (Layout Dividido: Lista | Mapa, sin Tailwind) */}
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          position: 'relative',
          zIndex: 10,
          height: 'calc(100vh - var(--navbar-height) - 80px)'
        }}
      >

        {/* Columna Izquierda: Listado de Actividades (Espacio extra a la derecha) */}
        <div
          className="scrollbar-thin"
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingLeft: isMobile ? '1rem' : '2rem',
            paddingRight: isMobile ? '1rem' : '3rem', // Separación del scrollbar
            paddingTop: '2rem',
            paddingBottom: '6rem',
            maxWidth: isMobile ? '100%' : '58%',
            borderRight: isMobile ? 'none' : '1px solid rgba(200, 185, 155, 0.25)',
            display: (isMobile && mobileView !== 'list') ? 'none' : 'block',
            height: '100%',
            scrollBehavior: 'smooth'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '16rem', textAlign: 'center' }}>
              <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '1.5rem' }} />
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', color: 'var(--text-main)' }}>Cargando actividades disponibles...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '5rem 0', textAlign: 'center' }}>
              <p style={{ color: 'red', fontWeight: 'bold', fontFamily: 'var(--font-sans)' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#e5e7eb',
                  borderRadius: '0px',
                  color: '#374151',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              >
                Reintentar
              </button>
            </div>
          ) : filteredLugares.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)', opacity: 0.7 }}>
              <p style={{ fontSize: '1.25rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Aún no hay sitios registrados en esta sección.</p>
              <button
                onClick={handleCancel}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#e5e7eb',
                  borderRadius: '0px',
                  color: '#374151',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              >
                Regresar al planificador
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '6rem' }}>
              {Object.entries(grouped).map(([subCategory, items]) => (
                <div key={subCategory}>
                  {/* Título de Subcategoría */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '24px',
                        background: 'var(--primary)',
                        boxShadow: '0 2px 6px rgba(160, 68, 42, 0.2)',
                        borderRadius: '0px'
                      }}
                    />
                    <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontFamily: 'var(--font-serif)', margin: 0, color: 'var(--primary)', fontWeight: 'bold' }}>
                      {subCategory}
                    </h3>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--border), transparent)', opacity: 0.7 }} />
                  </div>

                  {/* Listado de Tarjetas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {items.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border)', background: 'rgba(253, 251, 247, 0.4)', borderRadius: 'var(--border-radius-md)' }}>
                        <p style={{ fontSize: '0.875rem', fontStyle: 'italic', margin: 0, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', opacity: 0.6 }}>
                          No hay sitios registrados en esta sección
                        </p>
                      </div>
                    ) : (
                      items.map(lugar => (
                        <ActivityCard
                          key={lugar.id}
                          activity={lugar}
                          isSelected={isSelected(lugar.id)}
                          onToggle={(act) => {
                            handleToggle(act);
                            setSelectedMapActivity(act);
                          }}
                          isMapFocused={selectedMapActivity?.id === lugar.id}
                          selectedDayDate={selectedDayDate}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Mapa Interactivo (Enmarcado rectangular, sin Tailwind) */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? '0' : '1.5rem', // Separación del borde en escritorio
            display: (isMobile && mobileView !== 'map') ? 'none' : 'block',
            height: '100%',
            position: 'relative'
          }}
        >
          {!loading && !error && filteredLugares.length > 0 && (
            <>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  border: isMobile ? 'none' : '1px solid var(--border)',
                  boxShadow: isMobile ? 'none' : 'var(--shadow-md)',
                  borderRadius: isMobile ? '0px' : 'var(--border-radius-md)', // Recto
                  background: 'var(--white)'
                }}
              >
                <ActivityMap
                  activities={filteredLugares}
                  selectedActivityId={selectedMapActivity?.id}
                  onSelectActivity={(activity) => {
                    setSelectedMapActivity(activity);
                    // En escritorio, desplazar la lista para centrar la tarjeta
                    const cardElement = document.getElementById(`activity-card-${activity.id}`);
                    if (cardElement) {
                      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                />
              </div>

              {/* Mobile Overlay: Tarjeta Flotante cuando se selecciona un pin en mapa móvil */}
              {selectedMapActivity && mobileView === 'map' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '5.5rem',
                    left: '0.75rem',
                    right: '0.75rem',
                    zIndex: 1000, // Alto para quedar sobre el mapa Leaflet
                    background: 'var(--white)',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 8px 30px rgba(107, 74, 47, 0.2)',
                    padding: '0.5rem',
                    borderRadius: 'var(--border-radius-sm)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.25rem', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.05em', color: '#6b7280', fontFamily: 'var(--font-sans)', textTransform: 'uppercase' }}>Lugar seleccionado</span>
                    <button
                      onClick={() => setSelectedMapActivity(null)}
                      style={{
                        padding: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Tarjeta de actividad horizontal compacta dentro del overlay móvil */}
                  <ActivityCard
                    activity={selectedMapActivity}
                    isSelected={isSelected(selectedMapActivity.id)}
                    onToggle={handleToggle}
                    isMapFocused={true}
                    isCompact={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Botón Flotante de Alternancia de Vistas (Solo Móvil - Rectangular sin Tailwind) */}
      {!loading && !error && filteredLugares.length > 0 && (
        <div
          style={{
            display: isMobile ? 'block' : 'none',
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50
          }}
        >
          <button
            onClick={() => setMobileView(prev => prev === 'list' ? 'map' : 'list')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--primary)',
              borderColor: 'var(--primary-hover)',
              color: 'var(--bg-linen)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: '1px solid var(--primary-hover)',
              borderRadius: 'var(--border-radius-sm)', // Rectangular
              boxShadow: '0 8px 24px rgba(160, 68, 42, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {mobileView === 'list' ? (
              <>
                <Map size={14} style={{ color: 'var(--bg-linen)' }} />
                <span>Ver Mapa</span>
              </>
            ) : (
              <>
                <X size={14} style={{ color: 'var(--bg-linen)' }} />
                <span>Ver Lista</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Estilos CSS Embebidos */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Custom scrollbar para el listado de actividades */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(200, 185, 155, 0.05);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--secondary);
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;
