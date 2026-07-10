import { useState, useEffect, useMemo } from 'react';
import { MapPin, RefreshCw, Trash2, Home, Landmark, Utensils, HeartPulse, Compass, Star, ChevronRight, Check } from 'lucide-react';
import { api } from '../../../services/api';
import { DayPlanner } from '../components/DayPlanner';
import { CategorySelector } from '../components/CategorySelector';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_IMAGES, MAIN_CATEGORY_THEMES } from '../components/ActivityCard';
import { getCategoryBySubcategory } from '../constants/categories';
import portadaInicio from '../../../assets/background-home.jpeg';

// Helper para obtener minutos transcurridos desde medianoche para ordenar cronológicamente
const obtenerMinutosInicio = (lugar) => {
  if (!lugar) return 9999;

  // 1. Si posee horarios_json estructurado, obtener la primera hora de apertura
  if (lugar.horarios_json && Array.isArray(lugar.horarios_json) && lugar.horarios_json.length > 0) {
    const primerHorario = lugar.horarios_json[0];
    if (primerHorario.hora_apertura) {
      const parts = primerHorario.hora_apertura.split(/[:.]/);
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(h) && !isNaN(m)) {
          return h * 60 + m;
        }
      }
    }
  }

  // 2. Fallback: Parsear la hora desde el campo texto "horario"
  const horarioStr = lugar.horario;
  if (!horarioStr) return 9999;

  const formatoHoraMinuto = horarioStr.match(/\b(\d{1,2})[:.](\d{2})\b/);
  if (formatoHoraMinuto) {
    const horas = parseInt(formatoHoraMinuto[1], 10);
    const minutos = parseInt(formatoHoraMinuto[2], 10);
    return horas * 60 + minutos;
  }

  const formatoAmPm = horarioStr.match(/\b(\d{1,2})\s*(am|pm|AM|PM)\b/i);
  if (formatoAmPm) {
    let horas = parseInt(formatoAmPm[1], 10);
    const esPm = formatoAmPm[2].toLowerCase() === 'pm';
    if (esPm && horas < 12) horas += 12;
    if (!esPm && horas === 12) horas = 0;
    return horas * 60;
  }

  return 9999;
};

export const Itinerary = () => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estado del planificador
  const [days, setDays] = useState(3);
  const [selectedDay, setSelectedDay] = useState(1);
  const [plan, setPlan] = useState({});
  const [activeCategoryKey, setActiveCategoryKey] = useState('COMIDA');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sortByTime, setSortByTime] = useState(false);

  const handleToggleSortByTime = () => {
    const nextVal = !sortByTime;
    setSortByTime(nextVal);
    localStorage.setItem('itinerary_sort_by_time', nextVal.toString());
  };

  // Escuchar tamaño de la ventana para responsividad en JS sin Tailwind
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Cargar sitios y eventos locales en paralelo ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [resSitios, resEventos] = await Promise.all([
          api.get('/hotel/sitios-cercanos'),
          api.get('/hotel/eventos-locales')
        ]);
        const sitiosData = resSitios.data?.data || resSitios.data || [];
        const eventosData = resEventos.data?.data || resEventos.data || [];

        // Mapear eventos locales al formato compatible de sitio
        const mappedEvents = eventosData.map(ev => ({
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
          isEventoLocal: true
        }));

        setLugares([...sitiosData, ...mappedEvents]);
      } catch {
        setError('No se pudieron cargar las actividades. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Desasociar / Quitar elemento del itinerario del día ──
  const handleToggle = (lugar) => {
    setPlan(prev => {
      const current = prev[selectedDay] || [];
      const updated = current.filter(id => id !== lugar.id);
      const newPlan = { ...prev, [selectedDay]: updated };
      localStorage.setItem('itinerary_plan', JSON.stringify(newPlan));
      return newPlan;
    });
  };

  // ── Cargar plan, días y día seleccionado desde localStorage ──
  useEffect(() => {
    const savedPlan = localStorage.getItem('itinerary_plan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error('Error al cargar plan de localStorage:', e);
      }
    }
    const savedDay = localStorage.getItem('itinerary_selected_day');
    if (savedDay) {
      setSelectedDay(Number(savedDay));
    }
    const savedDays = localStorage.getItem('itinerary_days');
    if (savedDays) {
      setDays(Number(savedDays));
    }
    const savedSort = localStorage.getItem('itinerary_sort_by_time');
    if (savedSort) {
      setSortByTime(savedSort === 'true');
    }
  }, []);

  // ── Seleccionar un día y guardar en localStorage ──
  const handleSelectDay = (day) => {
    setSelectedDay(day);
    localStorage.setItem('itinerary_selected_day', day.toString());
  };

  // ── Limpiar días al reducir el contador y guardar en localStorage ──
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    localStorage.setItem('itinerary_days', newDays.toString());

    let cleanDay = selectedDay;
    if (selectedDay > newDays) {
      cleanDay = newDays;
      setSelectedDay(newDays);
      localStorage.setItem('itinerary_selected_day', newDays.toString());
    }

    setPlan(prev => {
      const updatedPlan = { ...prev };
      Object.keys(updatedPlan).forEach(d => {
        if (Number(d) > newDays) {
          delete updatedPlan[d];
        }
      });
      localStorage.setItem('itinerary_plan', JSON.stringify(updatedPlan));
      return updatedPlan;
    });
  };

  // ── Filtrar actividades seleccionadas para el día actual ──
  const dayPlan = useMemo(() => {
    const ids = plan[selectedDay] || [];
    const actList = ids.map(id => lugares.find(l => l.id === id)).filter(Boolean);
    if (sortByTime) {
      return [...actList].sort((a, b) => obtenerMinutosInicio(a) - obtenerMinutosInicio(b));
    }
    return actList;
  }, [plan, selectedDay, lugares, sortByTime]);

  // ── Limpiar todas las actividades de un día ──
  const clearDay = () => {
    setPlan(prev => {
      const updatedPlan = { ...prev, [selectedDay]: [] };
      localStorage.setItem('itinerary_plan', JSON.stringify(updatedPlan));
      return updatedPlan;
    });
  };

  // ── Exportar como PDF de alta fidelidad con iconos de Heroicons ──
  const handleExport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes (popups) para poder descargar el PDF de tu itinerario.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
            
            :root {
              --primary: #a0442a;
              --secondary: #1c3d5a;
              --gold: #c8b99b;
              --text: #292524;
              --bg-linen: #fcfbf7;
            }

            body {
              font-family: 'Outfit', sans-serif;
              color: var(--text);
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }

            .header {
              text-align: center;
              padding-bottom: 25px;
              border-bottom: 2px solid var(--gold);
              margin-bottom: 30px;
              position: relative;
            }

            /* Moldura Talavera */
            .talavera-border {
              height: 12px;
              background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="12" viewBox="0 0 60 12"><path d="M0 0h60v12H0z" fill="%231c3d5a"/><circle cx="10" cy="6" r="3" fill="%23c8b99b"/><circle cx="30" cy="6" r="3" fill="%23c8b99b"/><circle cx="50" cy="6" r="3" fill="%23c8b99b"/><path d="M0 6c5 3 5-3 10 0s5 3 10 0 5-3 10 0 5 3 10 0 5-3 10 0 5 3 10 0" stroke="%23a0442a" stroke-width="1.5" fill="none"/></svg>');
              background-repeat: repeat-x;
              margin-bottom: 20px;
            }

            .header h1 {
              font-family: 'Playfair Display', serif;
              color: var(--primary);
              margin: 0 0 8px 0;
              font-size: 2.2rem;
              letter-spacing: 0.02em;
            }

            .header p {
              margin: 0;
              color: var(--secondary);
              font-size: 0.95rem;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              font-weight: 600;
            }

            .day-section {
              margin-bottom: 35px;
              page-break-inside: avoid;
            }

            .day-title {
              font-family: 'Playfair Display', serif;
              font-size: 1.4rem;
              color: var(--secondary);
              border-bottom: 1px solid rgba(200, 185, 155, 0.4);
              padding-bottom: 6px;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .day-number {
              background: var(--primary);
              color: #fff;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.9rem;
              font-weight: 700;
              font-family: 'Outfit', sans-serif;
            }

            .empty-plan {
              font-style: italic;
              color: #78716c;
              font-size: 0.85rem;
              padding-left: 15px;
            }

            .activity-card {
              display: flex;
              gap: 15px;
              padding: 15px;
              border: 1px solid rgba(200, 185, 155, 0.3);
              margin-bottom: 15px;
              background: #faf9f6;
            }

            .activity-details {
              flex: 1;
            }

            .activity-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 6px;
            }

            .activity-title {
              font-size: 1.05rem;
              font-weight: 700;
              color: var(--secondary);
              margin: 0;
            }

            .activity-category {
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--primary);
              background: rgba(160, 68, 42, 0.08);
              padding: 2px 8px;
              font-weight: 700;
            }

            .info-row {
              display: flex;
              align-items: flex-start;
              font-size: 0.8rem;
              color: #57534e;
              margin-top: 5px;
              line-height: 1.4;
            }

            .icon {
              width: 14px;
              height: 14px;
              stroke: var(--primary);
              stroke-width: 2;
              fill: none;
              margin-right: 8px;
              flex-shrink: 0;
              margin-top: 2px;
            }

            .footer {
              text-align: center;
              margin-top: 50px;
              font-size: 0.75rem;
              color: #78716c;
              border-top: 1px solid rgba(200, 185, 155, 0.3);
              padding-top: 15px;
            }

            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="talavera-border"></div>
          
          <div class="header">
            <h1>Hotel Casa Dolores Hidalgo</h1>
            <p>Mi Itinerario</p>
          </div>

          ${Array.from({ length: days }, (_, i) => i + 1).map(d => {
      const ids = plan[d] || [];
      let dayActivities = ids.map(id => lugares.find(x => x.id === id)).filter(Boolean);
      if (sortByTime) {
        dayActivities = [...dayActivities].sort((a, b) => obtenerMinutosInicio(a) - obtenerMinutosInicio(b));
      }

      return `
              <div class="day-section">
                <div class="day-title">
                  <div class="day-number">${d}</div>
                  <span>Día ${d}</span>
                </div>
                
                ${dayActivities.length === 0 ? `
                  <div class="empty-plan">Sin actividades planificadas para este día.</div>
                ` : `
                  <div>
                    ${dayActivities.map(l => {
        const formattedHorario = l.horario ? l.horario.replace(/\n/g, '<br/>') : '';
        return `
                        <div class="activity-card">
                          <div class="activity-details">
                            <div class="activity-header">
                              <h3 class="activity-title">${l.nombre}</h3>
                              <span class="activity-category">${l.categoria}</span>
                            </div>
                            
                            ${l.direccion ? `
                              <div class="info-row">
                                <svg class="icon" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke-linecap="round" stroke-linejoin="round" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" stroke-linecap="round" stroke-linejoin="round" /></svg>
                                <span>${l.direccion}</span>
                              </div>
                            ` : ''}
                            
                            ${l.horario ? `
                              <div class="info-row">
                                <svg class="icon" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke-linecap="round" stroke-linejoin="round" /></svg>
                                <span>${formattedHorario}</span>
                              </div>
                            ` : ''}
                            
                            ${l.distancia_km ? `
                              <div class="info-row">
                                <svg class="icon" viewBox="0 0 24 24"><path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                                <span>A ${Number(l.distancia_km).toFixed(1)} km del hotel</span>
                              </div>
                            ` : ''}
                          </div>
                        </div>
                      `;
      }).join('')}
                  </div>
                `}
              </div>
            `;
    }).join('')}

          <div class="footer">
            <p>¡Esperamos que disfrutes tu estancia en Dolores Hidalgo!</p>
            <p>Hotel Casa Dolores &copy; ${new Date().getFullYear()}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div
      style={{
        background: 'var(--bg-linen)',
        minHeight: '100vh',
        position: 'relative',
        overflowY: 'auto',
        marginTop: 'calc(-1 * var(--navbar-height))'
      }}
    >
      {/* Banner*/}
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

      {/* ── Zona principal superior (Categorías con slider en Banner Oscuro) ── */}
      <div
        style={{
          // backgroundImage: `linear-gradient(rgba(43, 37, 34, 0.52), rgba(43, 37, 34, 0.52)), url(${portadaInicio})`,
          backgroundColor: 'var(--primary)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--bg-linen)', fontFamily: 'var(--font-serif)' }}>Cargando categorías...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', zIndex: 10 }}>
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        ) : (
          <CategorySelector onOpenCategory={(key) => navigate(`/itinerary/${key}`)} onSlideChange={setActiveCategoryKey} />
        )}
      </div>

      {/* Separador Talavera con diseño artesanal de la marca */}
      <div
        style={{
          width: '100%',
          height: '10px',
          background: 'var(--primary)',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(253, 251, 247, 0.15) 10px, rgba(253, 251, 247, 0.15) 20px)',
          borderBottom: '2px solid var(--border)'
        }}
      />

      {/* ── Zona inferior (Planificador de Ruta - Dos Columnas sin Tailwind) ── */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '2.5rem 1rem' : '4rem 2rem',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '2.5rem'
        }}
      >
        {/* COLUMNA IZQUIERDA: CONFIGURADOR DE DÍAS (Ancho Fijo) */}
        <div style={{ width: isMobile ? '100%' : '30%', flexShrink: 0 }}>

          {/* Card: Cuántos días te hospedas */}
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--secondary)', fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={16} style={{ color: 'var(--primary)' }} /> ¿Cuántos días te hospedas?
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
              <button
                onClick={() => days > 1 && handleDaysChange(days - 1)}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'var(--primary)',
                  color: 'var(--bg-linen)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                -
              </button>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'block', color: 'var(--secondary)', lineHeight: 1 }}>{days}</span>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Días</span>
              </div>
              <button
                onClick={() => days < 7 && handleDaysChange(days + 1)}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'var(--primary)',
                  color: 'var(--bg-linen)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                +
              </button>
            </div>
          </div>

          {/* Card: Selecciona el día */}
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem'
            }}
          >
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Selecciona el día
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                const isActive = selectedDay === d;
                const count = (plan[d] || []).length;
                return (
                  <button
                    key={d}
                    onClick={() => handleSelectDay(d)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'var(--bg-linen)' : 'var(--text-main)',
                      border: isActive ? 'none' : '1px solid var(--border)',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-sans)',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(216, 200, 168, 0.15)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>Día {d}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {count > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '0.125rem 0.375rem',
                            background: isActive ? 'var(--bg-linen)' : 'var(--primary)',
                            color: isActive ? 'var(--primary)' : 'var(--bg-linen)',
                            borderRadius: '0px',
                            fontWeight: 'bold'
                          }}
                        >
                          {count}
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: isActive ? 'var(--bg-linen)' : 'var(--border)' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón: Exportar itinerario */}
          <button
            onClick={handleExport}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'var(--secondary)', // Nogal de la marca
              color: 'var(--bg-linen)',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 10px rgba(107, 74, 47, 0.15)',
              transition: 'filter 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            Descargar Itinerario (.pdf)
          </button>
        </div>

        {/* COLUMNA DERECHA: BITÁCORA / LÍNEA DE TIEMPO (Ancho Flexible) */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--border-radius-md)',
              padding: isMobile ? '1.5rem' : '2.5rem',
              boxShadow: 'var(--shadow-sm)',
              minHeight: '400px'
            }}
          >
            {/* Header de la Bitácora */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(200, 185, 155, 0.25)', paddingBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.625rem', color: 'var(--secondary)', margin: 0, fontWeight: 'bold' }}>
                  Mi Bitácora — Día {selectedDay}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0, fontFamily: 'var(--font-sans)' }}>
                  {dayPlan.length === 0
                    ? 'No hay actividades planificadas para hoy'
                    : `${dayPlan.length} ${dayPlan.length === 1 ? 'actividad planificada' : 'actividades planificadas'}`
                  }
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                {dayPlan.length > 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    <input
                      type="checkbox"
                      checked={sortByTime}
                      onChange={handleToggleSortByTime}
                      style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span>Ordenar por horario sugerido</span>
                  </label>
                )}

                {dayPlan.length > 0 && (
                  <button
                    onClick={clearDay}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0px',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}
                  >
                    <Trash2 size={13} /> Limpiar día
                  </button>
                )}
              </div>
            </div>

            {/* Listado / Línea de Tiempo */}
            {dayPlan.length === 0 ? (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', border: '1px dashed var(--border)', background: 'rgba(216, 200, 168, 0.03)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Compass size={40} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, maxWidth: '350px', lineHeight: 1.5 }}>
                  Comienza a planificar tu día seleccionando una categoría arriba y añadiendo lugares a tu itinerario.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Salida desde Casa Dolores */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '2.5rem', flexShrink: 0 }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--white)', border: '2.5px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold', zIndex: 2 }}>
                      o
                    </div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--border)', opacity: 0.6, minHeight: '1.5rem', marginTop: '0.25rem' }} />
                  </div>
                  <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: 'bold' }}>
                      Salida desde Hotel Casa Dolores Hidalgo
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#78716c', fontStyle: 'italic' }}>Comienza tu día</span>
                  </div>
                </div>

                {/* Mapear actividades */}
                {dayPlan.map((lugar, index) => {
                  const subCat = lugar.categoria || 'General';
                  const mainCat = getCategoryBySubcategory(subCat);
                  const theme = MAIN_CATEGORY_THEMES[mainCat] || MAIN_CATEGORY_THEMES.OTRAS;
                  const imageUrl = lugar.imagen_url || CATEGORY_IMAGES[mainCat] || '/images/otras.png';
                  const isLast = index === dayPlan.length - 1;

                  return (
                    <div key={lugar.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', marginBottom: isLast ? '0' : '1.5rem' }}>

                      {/* Nodo e hilo vertical */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '2.5rem', flexShrink: 0 }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--white)', border: '2.5px solid var(--secondary)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold', zIndex: 2 }}>
                          {index + 1}
                        </div>
                        {!isLast && (
                          <div style={{ width: '2px', flex: 1, background: 'var(--border)', opacity: 0.6, minHeight: '3.5rem', marginTop: '0.25rem', marginBottom: '0.25rem' }} />
                        )}
                      </div>

                      {/* Tarjeta de actividad de la Bitácora (Estructura Premium sin Tailwind) */}
                      <div
                        style={{
                          flex: 1,
                          background: 'rgba(216, 200, 168, 0.05)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: '1rem',
                          alignItems: 'center',
                          position: 'relative'
                        }}
                      >
                        {/* Imagen miniatura */}
                        <div style={{ width: isMobile ? '100%' : '5.5rem', height: '5.5rem', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={imageUrl} alt={lugar.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Detalles */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', margin: 0, color: 'var(--secondary)', fontWeight: 'bold' }}>
                              {lugar.nombre}
                            </h4>
                            <span
                              style={{
                                fontSize: '8px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '0.125rem 0.375rem',
                                border: '1px solid rgba(200, 185, 155, 0.4)',
                                background: 'var(--bg-sand)',
                                color: 'var(--text-muted)',
                                borderRadius: '0px'
                              }}
                            >
                              {lugar.categoria}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: '#57534e', margin: 0, fontFamily: 'var(--font-sans)' }}>
                            {lugar.direccion || 'Dolores Hidalgo, Gto.'}
                          </p>
                          {lugar.horarios_json && Array.isArray(lugar.horarios_json) && lugar.horarios_json.length > 0 ? (
                            <div style={{ fontSize: '0.72rem', color: '#78716c', margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                              {lugar.horarios_json.map((h, i) => (
                                <span key={i}>
                                  {h.dias ? `${h.dias}: ` : ''}{h.hora_apertura && h.hora_cierre ? `${h.hora_apertura} a ${h.hora_cierre}` : h.hora_apertura || h.hora_cierre}
                                </span>
                              ))}
                            </div>
                          ) : lugar.horario ? (
                            <p style={{ fontSize: '0.7rem', color: '#78716c', margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>
                              Horario sugerido: {lugar.horario}
                            </p>
                          ) : null}
                        </div>

                        {/* Botón borrar */}
                        <button
                          onClick={() => handleToggle(lugar)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#a8a29e',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s',
                            alignSelf: isMobile ? 'flex-end' : 'center'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                          onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}
                          title="Quitar del itinerario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}

              </div>
            )}
          </div>
        </div>

      </div>

      {/* Estilos CSS embebidos */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Itinerary;
