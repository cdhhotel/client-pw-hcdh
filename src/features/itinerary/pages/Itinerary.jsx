import { useState, useEffect, useMemo } from 'react';
import { MapPin, RefreshCw, Download, Trash2, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../../services/api';
import { ActivityCard } from '../components/ActivityCard';
import { DayPlanner } from '../components/DayPlanner';
import { ScrollCategories } from '../components/ScrollCategories';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

// ─── Componente principal ─────────────────────────────────────────────────────

export const Itinerary = () => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del planificador
  const [days, setDays] = useState(3);
  const [selectedDay, setSelectedDay] = useState(1);
  // { dayNumber: [lugarId, ...] }
  const [plan, setPlan] = useState({});
  // Estado de la vista principal (animaciones)
  const [view, setView] = useState('categories'); // 'categories' | 'category-detail'

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('all');

  // ── Cargar sitios cercanos (con eventos incluidos) ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await api.get('/hotel/sitios-cercanos');
        setLugares(result.data || []);
      } catch {
        setError('No se pudieron cargar los lugares. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Limpiar días eliminados al reducir contador ──
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    if (selectedDay > newDays) setSelectedDay(newDays);
    setPlan(prev => {
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach(d => {
        if (Number(d) > newDays) delete cleaned[d];
      });
      return cleaned;
    });
  };

  // ── Toggle de lugar en el día actual ──
  const handleToggle = (lugar) => {
    setPlan(prev => {
      const dayIds = prev[selectedDay] || [];
      const isIn = dayIds.includes(lugar.id);
      return {
        ...prev,
        [selectedDay]: isIn
          ? dayIds.filter(id => id !== lugar.id)
          : [...dayIds, lugar.id],
      };
    });
  };

  // ── Filtrado ──
  const filteredLugares = useMemo(() => {
    return lugares.filter(l => {
      // Filtrar categorías utilitarias para que no salgan en el Itinerario
      const isUtilitario = ['Estacionamiento', 'Transporte', 'Hospital'].includes(l.categoria);
      if (isUtilitario) return false;

      const matchSearch =
        l.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoriaFilter === 'all' || l.categoria === categoriaFilter;
      return matchSearch && matchCat;
    });
  }, [lugares, searchTerm, categoriaFilter]);

  // ── Categorías únicas (solo las que no son utilitarias) ──
  const categorias = useMemo(
    () => [...new Set(
      lugares
        .filter(l => !['Estacionamiento', 'Transporte', 'Hospital'].includes(l.categoria))
        .map(l => l.categoria || '')
        .filter(Boolean)
    )].sort(),
    [lugares]
  );

  // ── Totales ──
  const totalSelected = Object.values(plan).flat().length;

  // ── Resumen del día actual ──
  const dayPlan = useMemo(() => {
    const ids = plan[selectedDay] || [];
    return ids.map(id => lugares.find(l => l.id === id)).filter(Boolean);
  }, [plan, selectedDay, lugares]);

  const isSelected = (id) => (plan[selectedDay] || []).includes(id);

  const clearDay = () => setPlan(prev => ({ ...prev, [selectedDay]: [] }));

  // ── Exportar como texto ──
  const handleExport = () => {
    const lines = ['=== MI ITINERARIO — Hotel Casa Dolores ===\n'];
    for (let d = 1; d <= days; d++) {
      lines.push(`\nDÍA ${d}:`);
      const ids = plan[d] || [];
      if (!ids.length) {
        lines.push('  (Sin actividades planificadas)');
      } else {
        ids.forEach(id => {
          const l = lugares.find(x => x.id === id);
          if (l) {
            lines.push(`  • ${l.nombre} (${l.categoria})`);
            if (l.direccion) lines.push(`    📍 ${l.direccion}`);
            if (l.horario) lines.push(`    🕐 ${l.horario}`);
            if (l.distancia_km) lines.push(`    🚗 ${Number(l.distancia_km).toFixed(1)} km del hotel`);
          }
        });
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mi-itinerario.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--bg-linen)', minHeight: '100vh' }}>

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--secondary) 100%)',
        padding: '3.5rem 0 2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(179,138,58,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(160,68,42,0.1)' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
              Planificador
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: 'var(--bg-linen)',
            margin: '0 0 0.75rem 0',
            fontWeight: 700,
          }}>
            Diseña tu Itinerario
          </h1>
          <p style={{ color: 'rgba(245,240,230,0.8)', fontSize: '1rem', margin: 0, maxWidth: '500px', lineHeight: 1.7 }}>
            Descubre los mejores lugares y experiencias alrededor del hotel.
            Selecciona actividades para cada día de tu estancia.
          </p>

          {/* Stats bar */}
          {totalSelected > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '1rem',
              marginTop: '1.5rem',
              background: 'rgba(245,240,230,0.12)',
              border: '1px solid rgba(245,240,230,0.2)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.6rem 1.2rem',
            }}>
              <Calendar size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ color: 'var(--bg-linen)', fontSize: '0.9rem' }}>
                <strong>{totalSelected}</strong> lugar{totalSelected !== 1 ? 'es' : ''} en <strong>{days}</strong> día{days !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'var(--gold)', color: 'var(--bg-linen)',
                  border: 'none', borderRadius: 'var(--border-radius-sm)',
                  padding: '0.35rem 0.75rem', fontSize: '0.8rem',
                  fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}
              >
                <Download size={13} /> Exportar
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'categories' ? (
          <motion.div
            key="categories-view"
            initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.000] }}
            style={{ width: '100%' }}
          >
            <ScrollCategories
              categorias={categorias}
              onSelectCategory={(cat) => {
                setCategoriaFilter(cat);
                setView('category-detail');
                // Scroll al top del hero
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.000] }}
            style={{ width: '100%', background: 'var(--bg-linen)' }}
          >
            {/* ─── Layout principal ────────────────────────────────────────── */}
            <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '1280px', margin: '0 auto' }}>

              <button
                onClick={() => setView('categories')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                  cursor: 'pointer', marginBottom: '1.5rem',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} /> Volver a categorías
              </button>
            </div>
            <div className="itinerary-layout" style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              gap: '2rem',
              alignItems: 'start',
            }}>

              {/* ── Sidebar ──────────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem' }}>

                <DayPlanner
                  days={days}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  onDaysChange={handleDaysChange}
                />

                {/* Resumen del día actual */}
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', margin: 0, color: 'var(--primary)' }}>
                      Día {selectedDay}
                    </h4>
                    {dayPlan.length > 0 && (
                      <button
                        onClick={clearDay}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.2rem 0.4rem',
                        }}
                      >
                        <Trash2 size={11} /> Limpiar
                      </button>
                    )}
                  </div>

                  {dayPlan.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                      Selecciona lugares de la grilla para agregar a este día.
                    </p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {dayPlan.map(l => (
                        <li
                          key={l.id}
                          onClick={() => handleToggle(l)}
                          title="Clic para quitar"
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.45rem',
                            padding: '0.45rem 0.6rem',
                            background: 'var(--bg-linen)',
                            borderRadius: 'var(--border-radius-sm)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                          }}
                        >
                          <MapPin size={11} style={{ color: 'var(--gold)', marginTop: '3px', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, color: 'var(--secondary)' }}>
                              {l.nombre}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                              {l.categoria}{l.distancia_km ? ` · ${Number(l.distancia_km).toFixed(1)} km` : ''}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* ── Zona principal ─────────────────────────────────────────── */}
              <div>
                {/* Filtros */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <span style={{
                      position: 'absolute', left: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.9rem',
                    }}>
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar lugar, categoría..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '2.2rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setCategoriaFilter('all')}
                      style={{
                        padding: '0.4rem 0.85rem', borderRadius: '50px',
                        border: '1px solid var(--border)',
                        background: categoriaFilter === 'all' ? 'var(--primary)' : 'var(--white)',
                        color: categoriaFilter === 'all' ? 'var(--bg-linen)' : 'var(--text-main)',
                        fontSize: '0.78rem', cursor: 'pointer',
                        fontWeight: categoriaFilter === 'all' ? 600 : 400,
                        transition: 'var(--transition)',
                      }}
                    >
                      Todos
                    </button>
                    {categorias.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoriaFilter(cat === categoriaFilter ? 'all' : cat)}
                        style={{
                          padding: '0.4rem 0.85rem', borderRadius: '50px',
                          border: '1px solid var(--border)',
                          background: categoriaFilter === cat ? 'var(--secondary)' : 'var(--white)',
                          color: categoriaFilter === cat ? 'var(--bg-linen)' : 'var(--text-main)',
                          fontSize: '0.78rem', cursor: 'pointer',
                          fontWeight: categoriaFilter === cat ? 600 : 400,
                          transition: 'var(--transition)',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cabecera del día */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1.25rem', paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{selectedDay}</span>
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: 0, color: 'var(--primary)' }}>
                      Día {selectedDay} de {days}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      {(plan[selectedDay] || []).length} lugar{(plan[selectedDay] || []).length !== 1 ? 'es' : ''} seleccionado{(plan[selectedDay] || []).length !== 1 ? 's' : ''}
                      {' • '}Haz clic en una tarjeta para agregar
                    </p>
                  </div>
                </div>

                {/* Grid de lugares */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>Cargando lugares...</p>
                  </div>
                ) : error ? (
                  <div style={{
                    padding: '2rem', textAlign: 'center',
                    background: 'rgba(160,68,42,0.08)',
                    border: '1px solid rgba(160,68,42,0.2)',
                    borderRadius: 'var(--border-radius-md)',
                  }}>
                    <p style={{ color: 'var(--primary)', margin: 0 }}>{error}</p>
                  </div>
                ) : filteredLugares.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '4rem 2rem',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--border-radius-md)',
                  }}>
                    <MapPin size={40} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      No se encontraron lugares
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Intenta con otro término de búsqueda
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '1.25rem',
                    animation: 'fadeIn 0.4s ease',
                  }}>
                    {filteredLugares.map(lugar => (
                      <ActivityCard
                        key={lugar.id}
                        activity={lugar}
                        isSelected={isSelected(lugar.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .itinerary-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Itinerary;
