import { useState, useEffect } from 'react';
import { MapPin, Plus, RefreshCw, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { itineraryService } from '../services/itineraryService';
import { ItineraryRow } from '../components/ItineraryRow';
import { ItineraryFormModal } from '../components/ItineraryFormModal';

const HOTEL_ID_DEFAULT = ''; // Se obtiene del primer hotel disponible

const initialForm = {
  nombre: '',
  horario_inicio: '08:00',
  horario_fin: '10:00',
  disponibilidad: '10',
  usuario_id: '',
  reservacion_id: '',
  sitio_cercano_id: '',
  descripcion: '',
  categoria: '',
  imagenFile: null,
  remove_image: 'false',
};

export const AdminItinerary = () => {
  const [items, setItems] = useState([]);
  const [sitiosCercanos, setSitiosCercanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  // Obtener usuario admin del localStorage para el campo usuario_id
  const getAdminUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('casa_dolores_user') || '{}');
      return user.id || '';
    } catch {
      return '';
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itinerarios, sitios] = await Promise.all([
        itineraryService.getAll(),
        itineraryService.getSitiosCercanos(),
      ]);
      setItems(itinerarios);
      setSitiosCercanos(sitios);
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    setFormData(prev => ({ ...prev, imagenFile: file, remove_image: 'false' }));
  };

  const handleRemoveNewImage = () => {
    setFormData(prev => ({ ...prev, imagenFile: null }));
  };

  const handleRemoveExistingImage = () => {
    setExistingImageUrl(null);
    setFormData(prev => ({ ...prev, remove_image: 'true' }));
  };

  const handleOpenCreate = () => {
    const adminId = getAdminUserId();
    setIsEditMode(false);
    setSelectedId(null);
    setExistingImageUrl(null);
    setFormData({ ...initialForm, usuario_id: adminId });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    const extra = item.atributos_extra ?? {};
    setIsEditMode(true);
    setSelectedId(item.id);
    setExistingImageUrl(extra.imagen_url || null);

    // Extraer hora de "1970-01-01T07:00:00.000Z" → "07:00"
    const extractTime = (iso) => {
      if (!iso) return '';
      const str = String(iso);
      const match = str.match(/T(\d{2}:\d{2})/);
      return match ? match[1] : str.substring(0, 5);
    };

    setFormData({
      nombre: item.nombre || '',
      horario_inicio: extractTime(item.horario_inicio),
      horario_fin: extractTime(item.horario_fin),
      disponibilidad: String(item.disponibilidad ?? 10),
      usuario_id: item.usuario_id || getAdminUserId(),
      reservacion_id: item.reservacion_id || '',
      sitio_cercano_id: item.sitio_cercano_id || '',
      descripcion: extra.descripcion || '',
      categoria: extra.categoria || '',
      imagenFile: null,
      remove_image: 'false',
    });

    setIsFormOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la actividad "${nombre}"?`)) {
      try {
        await itineraryService.delete(id);
        setItems(prev => prev.filter(i => i.id !== id));
        showSuccess(`Actividad "${nombre}" eliminada exitosamente.`);
      } catch (err) {
        setError(err.message || 'Error al eliminar la actividad.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await itineraryService.save(formData, isEditMode, selectedId);
      showSuccess(`Actividad "${formData.nombre}" ${isEditMode ? 'actualizada' : 'registrada'} correctamente.`);
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la actividad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtros locales
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sitio_cercano?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const extra = item.atributos_extra ?? {};
    const matchesCategoria =
      categoriaFilter === 'all' || extra.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const categorias = [...new Set(items.map(i => (i.atributos_extra?.categoria) || '').filter(Boolean))];

  return (
    <div className="animate-fade-in flex flex-col gap-8 w-full">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--primary)] mb-1">
          Gestión de Itinerario
        </h1>
        <button
          className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          onClick={handleOpenCreate}
        >
          <Plus size={18} /> Nueva Actividad
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
              placeholder="Buscar por nombre o lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control w-full pl-9"
            />
          </div>
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
        </div>
        <button
          className="btn btn-actua p-3 w-full md:w-auto flex justify-center items-center"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw size={36} className="animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="font-serif text-[var(--text-muted)]">Cargando itinerario...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel text-center py-16 px-4 rounded-[var(--border-radius-md)]">
          <MapPin size={48} className="text-[var(--border)] mx-auto mb-4" />
          <h3 className="text-xl font-serif text-[var(--primary)]">No se encontraron actividades</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Crea la primera actividad con el botón "Nueva Actividad"
          </p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-20">Imagen</th>
                <th>Nombre</th>
                <th>Lugar</th>
                <th>Horario</th>
                <th>Descripción</th>
                <th>Disponibilidad</th>
                <th className="text-right w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <ItineraryRow
                  key={item.id}
                  item={item}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <ItineraryFormModal
        isOpen={isFormOpen}
        isEditMode={isEditMode}
        formData={formData}
        sitiosCercanos={sitiosCercanos}
        isSubmitting={isSubmitting}
        existingImageUrl={existingImageUrl}
        onClose={() => setIsFormOpen(false)}
        onInputChange={handleInputChange}
        onImageSelect={handleImageSelect}
        onRemoveImage={handleRemoveNewImage}
        onRemoveExistingImage={handleRemoveExistingImage}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminItinerary;
