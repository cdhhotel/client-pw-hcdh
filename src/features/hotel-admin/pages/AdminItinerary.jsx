import { useState, useEffect } from 'react';
import { MapPin, Plus, RefreshCw, Search, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { itineraryService } from '../services/itineraryService';
import { ItineraryRow } from '../components/ItineraryRow';
import { ItineraryFormModal } from '../components/ItineraryFormModal';

// Separar líneas de días y horas de servicio del campo horario (Legacy string parser)
const parseHorarioToEntries = (horarioStr) => {
  if (!horarioStr) return [{ dias: '', hora_apertura: '', hora_cierre: '' }];
  
  const lines = horarioStr.split('\n');
  return lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return null;
    
    let dias = '';
    let horasStr = trimmedLine;
    
    const colonIdx = trimmedLine.indexOf(':');
    if (colonIdx !== -1) {
      dias = trimmedLine.substring(0, colonIdx).trim();
      horasStr = trimmedLine.substring(colonIdx + 1).trim();
    }
    
    // Intentar extraer hora_apertura y hora_cierre (ej. "09:00 a 18:00" o "9:00 am - 10:00 pm")
    const times = horasStr.match(/\b(\d{1,2})[:.](\d{2})\b/g);
    let hora_apertura = '';
    let hora_cierre = '';
    if (times && times.length >= 2) {
      const formatTime = (t) => {
        const parts = t.split(/[:.]/);
        return `${parts[0].padStart(2, '0')}:${parts[1]}`;
      };
      hora_apertura = formatTime(times[0]);
      hora_cierre = formatTime(times[1]);
    } else {
      const ampmRegex = /\b(\d{1,2})\s*(am|pm)\b/gi;
      const ampmMatches = [...horasStr.matchAll(ampmRegex)];
      if (ampmMatches.length >= 2) {
        const get24H = (hStr, ap) => {
          let h = parseInt(hStr, 10);
          if (ap.toLowerCase() === 'pm' && h < 12) h += 12;
          if (ap.toLowerCase() === 'am' && h === 12) h = 0;
          return `${h.toString().padStart(2, '0')}:00`;
        };
        hora_apertura = get24H(ampmMatches[0][1], ampmMatches[0][2]);
        hora_cierre = get24H(ampmMatches[1][1], ampmMatches[1][2]);
      }
    }
    
    return { dias, hora_apertura, hora_cierre };
  }).filter(Boolean);
};

const initialForm = {
  // Tipo de registro
  tipoRegistro: 'sitio', // 'sitio' o 'evento'

  // Campos para sitio_cercano
  nombre: '',
  categoria: 'Restaurante',
  direccion: '',
  horario: '',
  horarios_json: null,
  horario_entries: [{ dias: '', hora_apertura: '', hora_cierre: '' }],
  descripcion: '',
  telefono: '',
  sitio_web: '',
  latitud: 0,
  longitud: 0,
  distancia_km: '',
  tiempo_estimado_minutos: '',
  calificacion: '',
  servicios: '',
  redes_sociales: '',
  link_maps: '',
  especificaciones: '',
  correo_contacto: '',
  imagen_url: '',
  imagenFile: null,
  evento_local: [],

  // Campos para evento_local
  fecha_inicio: '',
  fecha_fin: '',
  mes_referencia: '',
  sitio_cercano_id: '',
};

export const AdminItinerary = () => {
  const [sitios, setSitios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [activeTab, setActiveTab] = useState('sitios'); // 'sitios' o 'eventos'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sitiosData, eventosData] = await Promise.all([
        itineraryService.getAll(),
        itineraryService.getEventos(),
      ]);
      setSitios(sitiosData);
      setEventos(eventosData);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            imagenFile: file,
            imagen_url: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, imagenFile: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({ 
      ...initialForm, 
      tipoRegistro: activeTab === 'eventos' ? 'evento' : 'sitio'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item, type = 'sitio') => {
    setIsEditMode(true);
    setSelectedId(item.id);

    if (type === 'evento') {
      setFormData({
        ...initialForm,
        tipoRegistro: 'evento',
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        fecha_inicio: item.fecha_inicio ? item.fecha_inicio.substring(0, 10) : '',
        fecha_fin: item.fecha_fin ? item.fecha_fin.substring(0, 10) : '',
        mes_referencia: item.mes_referencia || '',
        sitio_cercano_id: item.sitio_cercano_id || '',
        imagen_url: item.imagen_url || '',
        imagenFile: null,
        link_maps: item.link_maps || '',
        latitud: item.latitud || '',
        longitud: item.longitud || '',
      });
    } else {
      let parsedHorarioEntries = [{ dias: '', hora_apertura: '', hora_cierre: '' }];
      if (item.horarios_json && Array.isArray(item.horarios_json) && item.horarios_json.length > 0) {
        parsedHorarioEntries = item.horarios_json;
      } else if (item.horario) {
        parsedHorarioEntries = parseHorarioToEntries(item.horario);
      }

      setFormData({
        ...initialForm,
        tipoRegistro: 'sitio',
        nombre: item.nombre || '',
        categoria: item.categoria || 'Restaurante',
        direccion: item.direccion || '',
        horario: item.horario || '',
        horarios_json: item.horarios_json || null,
        horario_entries: parsedHorarioEntries,
        descripcion: item.descripcion || '',
        telefono: item.telefono || '',
        sitio_web: item.sitio_web || '',
        latitud: item.latitud || 0,
        longitud: item.longitud || 0,
        distancia_km: item.distancia_km || '',
        tiempo_estimado_minutos: item.tiempo_estimado_minutos || '',
        calificacion: item.calificacion || '',
        servicios: item.servicios || '',
        redes_sociales: item.redes_sociales || '',
        link_maps: item.link_maps || '',
        especificaciones: item.especificaciones || '',
        correo_contacto: item.correo_contacto || '',
        imagen_url: item.imagen_url || '',
        imagenFile: null,
        evento_local: item.evento_local || [],
      });
    }

    setIsFormOpen(true);
  };

  const handleDelete = async (id, nombre, type = 'sitio') => {
    const term = type === 'evento' ? 'evento de temporada' : 'sitio cercano';
    if (window.confirm(`¿Está seguro de que desea eliminar el ${term} "${nombre}"?`)) {
      try {
        if (type === 'evento') {
          await itineraryService.deleteEvento(id);
          setEventos(prev => prev.filter(i => i.id !== id));
        } else {
          await itineraryService.delete(id);
          setSitios(prev => prev.filter(i => i.id !== id));
        }
        showSuccess(`Eliminado correctamente.`);
      } catch (err) {
        setError(err.message || 'Error al eliminar.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (formData.tipoRegistro === 'evento') {
        const payload = {
          nombre: formData.nombre,
          fecha_inicio: formData.fecha_inicio || null,
          fecha_fin: formData.fecha_fin || null,
          mes_referencia: formData.mes_referencia || null,
          descripcion: formData.descripcion || null,
          sitio_cercano_id: formData.sitio_cercano_id || null,
          imagen_url: formData.imagen_url || null,
          link_maps: formData.link_maps || null,
          latitud: formData.latitud ? parseFloat(formData.latitud) : null,
          longitud: formData.longitud ? parseFloat(formData.longitud) : null,
          imagenFile: formData.imagenFile || null,
        };
        await itineraryService.saveEvento(payload, isEditMode, selectedId);
      } else {
        const validEntries = (formData.horario_entries || [])
          .filter(entry => (entry.dias || '').trim() || (entry.hora_apertura || '').trim() || (entry.hora_cierre || '').trim())
          .map(entry => ({
            dias: (entry.dias || '').trim(),
            hora_apertura: (entry.hora_apertura || '').trim(),
            hora_cierre: (entry.hora_cierre || '').trim()
          }));

        const payload = {
          ...formData,
          horarios_json: validEntries.length > 0 ? validEntries : null
        };
        delete payload.horario_entries;
        await itineraryService.save(payload, isEditMode, selectedId);
      }
      showSuccess(`"${formData.nombre}" ${isEditMode ? 'actualizado' : 'registrado'} correctamente.`);
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtros locales
  const filteredSitios = sitios.filter(item => {
    const matchesSearch = item.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === 'all' || item.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const filteredEventos = eventos.filter(item => {
    const matchesSearch = item.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categorias = [...new Set(sitios.map(i => i.categoria).filter(Boolean))];

  return (
    <div className="animate-fade-in flex flex-col gap-6 w-full">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--primary)] mb-1">
            Catálogo de Itinerario
          </h1>
          <p className="text-sm text-[var(--text-muted)] m-0">Administra los sitios turísticos de interés y eventos locales de temporada del hotel.</p>
        </div>
        <button
          className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          onClick={handleOpenCreate}
        >
          <Plus size={18} /> {activeTab === 'eventos' ? 'Nuevo Evento' : 'Nuevo Sitio'}
        </button>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => { setActiveTab('sitios'); setSearchTerm(''); }}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sitios' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'sitios' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <MapPin size={16} /> Sitios Cercanos ({sitios.length})
        </button>
        <button
          onClick={() => { setActiveTab('eventos'); setSearchTerm(''); }}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'eventos' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'eventos' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <Calendar size={16} /> Eventos de Temporada ({eventos.length})
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-4 bg-[rgba(122,128,97,0.15)] border-l-4 border-[var(--accent)] flex items-center gap-3 rounded-[var(--border-radius-sm)]">
          <CheckCircle2 size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-[rgba(160,68,42,0.1)] border-l-4 border-[var(--primary)] flex items-center gap-3 rounded-[var(--border-radius-sm)]">
          <AlertCircle size={18} className="text-[var(--primary)]" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="glass-panel flex flex-col md:flex-row justify-between gap-4 p-5 rounded-[var(--border-radius-md)] w-full">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow w-full md:max-w-2xl">
          <div className="relative flex-grow w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'eventos' ? 'evento' : 'sitio'} por nombre...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control w-full pl-9"
            />
          </div>
          {activeTab === 'sitios' && (
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="form-control w-full sm:w-52"
            >
              <option value="all">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
        <button
          className="btn btn-actua p-3 w-full md:w-auto flex justify-center items-center"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabla principal */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw size={36} className="animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="font-serif text-[var(--text-muted)]">Cargando...</p>
        </div>
      ) : activeTab === 'sitios' ? (
        filteredSitios.length === 0 ? (
          <div className="glass-panel text-center py-16 px-4 rounded-[var(--border-radius-md)]">
            <MapPin size={48} className="text-[var(--border)] mx-auto mb-4" />
            <h3 className="text-xl font-serif text-[var(--primary)]">No se encontraron sitios</h3>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Registra el primer sitio cercano con el botón "Nuevo Sitio"
            </p>
          </div>
        ) : (
          <div className="admin-table-container overflow-x-auto w-full">
            <table className="admin-table w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Dirección</th>
                  <th>Horario</th>
                  <th>Info Extra</th>
                  <th className="text-right w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSitios.map(item => (
                  <ItineraryRow
                    key={item.id}
                    item={item}
                    type="sitio"
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Eventos Tab
        filteredEventos.length === 0 ? (
          <div className="glass-panel text-center py-16 px-4 rounded-[var(--border-radius-md)]">
            <Calendar size={48} className="text-[var(--border)] mx-auto mb-4" />
            <h3 className="text-xl font-serif text-[var(--primary)]">No se encontraron eventos</h3>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Registra el primer evento de temporada con el botón "Nuevo Evento"
            </p>
          </div>
        ) : (
          <div className="admin-table-container overflow-x-auto w-full">
            <table className="admin-table w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Sede (Lugar)</th>
                  <th>Fechas / Temporada</th>
                  <th>Descripción</th>
                  <th className="text-right w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEventos.map(item => (
                  <ItineraryRow
                    key={item.id}
                    item={item}
                    type="evento"
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal Formulario */}
      <ItineraryFormModal
        isOpen={isFormOpen}
        isEditMode={isEditMode}
        formData={formData}
        sitios={sitios}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminItinerary;
