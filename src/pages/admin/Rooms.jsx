import { useState, useEffect } from 'react';
import {
  Bed, Plus, Pencil, Trash2, X, Upload, RefreshCw,
  Search, AlertCircle, CheckCircle2, Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';

export const Rooms = () => {
  // Estados de carga e inventario
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Estados de filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estados del Formulario (Creación / Edición)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    hotelId: '',
    numero: '',
    nombre: '',
    tipoHabitacion: 'individual',
    descripcionCorta: '',
    descripcionLarga: '',
    precioBaseNoche: '',
    capacidadMaxima: '2',
    numeroCamas: '1',
    tipoCamas: 'Matrimonial',
    metrosCuadrados: '',
    estatus: 'disponible',
    atributosExtra: {
      jacuzzi: false,
      chimenea: false,
      vistaJardin: false,
      permiteMascotas: false,
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  // Manejo de archivos de imágenes
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [keepImages, setKeepImages] = useState([]);

  // Cargar lista de habitaciones y hoteles
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        api.get('/room/rooms'),
        api.get('/hotel/hotels')
      ]);
      // GET /room/rooms devuelve { success: true, data: [...] }
      setRooms(roomsRes.data || []);
      // GET /hotel/hotels puede devolver el array directamente o envuelto
      const hotelList = Array.isArray(hotelsRes) ? hotelsRes : (hotelsRes.data || []);
      setHotels(hotelList);

      if (hotelList.length > 0) {
        setFormData(prev => ({ ...prev, hotelId: hotelList[0].id }));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      atributosExtra: { ...prev.atributosExtra, [name]: checked }
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveLocalImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (urlToRemove) => {
    setKeepImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedRoomId(null);
    setFormData({
      ...initialFormState,
      hotelId: hotels.length > 0 ? hotels[0].id : ''
    });
    setNewImages([]);
    setNewImagePreviews([]);
    setKeepImages([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room) => {
    setIsEditMode(true);
    setSelectedRoomId(room.id);
    const extra = room.atributos_extra || {};

    setFormData({
      hotelId: room.hotel_id,
      numero: room.numero,
      nombre: room.nombre || '',
      tipoHabitacion: room.tipo_habitacion,
      descripcionCorta: room.descripcion_corta || '',
      descripcionLarga: room.descripcion_larga || '',
      precioBaseNoche: String(room.precio_base_noche),
      capacidadMaxima: String(room.capacidad_maxima),
      numeroCamas: String(room.numero_camas),
      tipoCamas: room.tipo_camas || '',
      metrosCuadrados: room.metros_cuadrados ? String(room.metros_cuadrados) : '',
      estatus: room.estatus || 'disponible',
      atributosExtra: {
        jacuzzi: !!extra.jacuzzi,
        chimenea: !!extra.chimenea,
        vistaJardin: !!extra.vistaJardin,
        permiteMascotas: !!extra.permiteMascotas,
      }
    });

    setNewImages([]);
    setNewImagePreviews([]);
    setKeepImages(extra.imagenes || []);
    setIsFormOpen(true);
  };

  const handleDeleteRoom = async (id, numero) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la habitación ${numero}?`)) {
      try {
        await api.delete(`/room/rooms/${id}`);
        setRooms(prev => prev.filter(room => room.id !== id));
        showSuccess(`Habitación ${numero} eliminada exitosamente.`);
      } catch (err) {
        setError(err.message || 'Error al eliminar la habitación.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();

      // Campos opcionales — se omiten si están vacíos para evitar que Zod falle
      const optionalFields = ['nombre', 'descripcionCorta', 'descripcionLarga', 'tipoCamas', 'metrosCuadrados'];

      Object.keys(formData).forEach(key => {
        if (key === 'atributosExtra') {
          submitData.append('atributosExtra', JSON.stringify(formData.atributosExtra));
        } else if (optionalFields.includes(key) && !formData[key]) {
          // Omitir campo opcional vacío
        } else {
          submitData.append(key, formData[key]);
        }
      });

      newImages.forEach(imageFile => {
        submitData.append('imagenes', imageFile);
      });

      if (isEditMode) {
        submitData.append('imagenes_actuales', JSON.stringify(keepImages));
        await api.put(`/room/rooms/${selectedRoomId}`, submitData);
        showSuccess(`Habitación ${formData.numero} actualizada correctamente.`);
      } else {
        await api.post('/room/room-register', submitData);
        showSuccess(`Habitación ${formData.numero} registrada correctamente.`);
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al procesar la habitación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.nombre && room.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || room.estatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.nombre : 'Hotel Desconocido';
  };

  const getStatusBadge = (estatus) => {
    switch (estatus) {
      case 'disponible': return <span className="badge badge-success">Disponible</span>;
      case 'mantenimiento': return <span className="badge badge-warning">Mantenimiento</span>;
      case 'ocupada': return <span className="badge badge-danger">Ocupada</span>;
      default: return <span className="badge">{estatus}</span>;
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-8 w-full">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--primary)] mb-1">
            Inventario de Habitaciones
          </h1>
        </div>
        <button className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2" onClick={handleOpenCreate}>
          <Plus size={18} /> Nueva Habitación
        </button>
      </div>

      {/* Alertas globales */}
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

      {/* Barra de Filtros */}
      <div className="glass-panel flex flex-col md:flex-row justify-between gap-4 p-5 rounded-[var(--border-radius-md)] w-full">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow w-full md:max-w-2xl">
          <div className="relative flex-grow w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar por número o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control w-full pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control w-full sm:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="ocupada">Ocupadas</option>
          </select>
        </div>
        <button
          className="btn btn-outline p-3 w-full md:w-auto flex justify-center items-center"
          onClick={fetchData}
          disabled={loading}
          title="Recargar datos"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabla / Listado */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw size={36} className="animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="font-serif text-[var(--text-muted)]">Cargando inventario de habitaciones...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-panel text-center py-16 px-4 rounded-[var(--border-radius-md)]">
          <Bed size={48} className="text-[var(--border)] mx-auto mb-4" />
          <h3 className="text-xl font-serif text-[var(--primary)]">No se encontraron habitaciones</h3>
          <p className="text-[var(--text-muted)] mt-2 text-sm">
            Prueba a cambiar tus filtros o registra una nueva habitación.
          </p>
        </div>
      ) : (
        <div className="admin-table-container w-full overflow-x-auto">
          <table className="admin-table min-w-[800px] w-full">
            <thead>
              <tr>
                <th className="w-24">Foto</th>
                <th>Número</th>
                <th>Nombre / Tipo</th>
                <th>Hotel</th>
                <th>Capacidad / Camas</th>
                <th>Precio / Noche</th>
                <th>Estatus</th>
                <th className="text-right w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const imgList = room.atributos_extra?.imagenes || [];
                const firstImg = imgList.length > 0 ? imgList[0] : null;
                return (
                  <tr key={room.id}>
                    <td>
                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt={`Habitación ${room.numero}`}
                          className="w-[70px] h-[50px] object-cover border border-[var(--border)]"
                        />
                      ) : (
                        <div className="w-[70px] h-[50px] bg-[var(--bg-linen)] flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)]">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td className="font-bold text-base text-[var(--secondary)]">{room.numero}</td>
                    <td>
                      <div className="font-semibold">{room.nombre || 'Sin nombre'}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">{room.tipo_habitacion}</div>
                    </td>
                    <td className="text-sm text-[var(--text-muted)]">{getHotelName(room.hotel_id)}</td>
                    <td className="text-sm">
                      <div>Max: {room.capacidad_maxima} pers.</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {room.numero_camas} camas ({room.tipo_camas || 'N/A'})
                      </div>
                    </td>
                    <td className="font-semibold text-[var(--primary)]">
                      ${Number(room.precio_base_noche).toLocaleString()} MXN
                    </td>
                    <td>{getStatusBadge(room.estatus)}</td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="btn btn-outline p-2 border-none"
                          onClick={() => handleOpenEdit(room)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-outline p-2 border-none text-[#c15c3d]"
                          onClick={() => handleDeleteRoom(room.id, room.numero)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}


      {/* Modal Crear / Editar */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] p-4 sm:p-6 md:p-10">
          {/* Fondo del modal con transiciones y un alineado limpio */}
          <div className="glass-panel animate-fade-in w-full max-w-3xl rounded-[var(--border-radius-md)] flex flex-col max-h-[85vh] shadow-2xl">

            {/* Cabecera fija para que no se mueva al hacer scroll */}
            <div className="flex justify-between items-center border-b border-[var(--border)] p-6 md:px-8">
              <h2 className="text-xl md:text-2xl font-serif text-[var(--secondary)] font-semibold">
                {isEditMode ? `Editar Habitación ${formData.numero}` : 'Registrar Nueva Habitación'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-none border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Zona con scroll INDEPENDIENTE y paddings internos garantizados */}
            <div className="overflow-y-auto p-6 md:p-8 flex-grow">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                {/* Grid de campos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full">

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Hotel</label>
                    <select
                      name="hotelId"
                      value={formData.hotelId}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      required
                    >
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Número de Habitación</label>
                    <input
                      type="text"
                      name="numero"
                      placeholder="Ej. 102-A"
                      value={formData.numero}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      required
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Nombre Comercial / Suite</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ej. Suite Presidencial"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="form-control w-full"
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Tipo de Habitación</label>
                    <select
                      name="tipoHabitacion"
                      value={formData.tipoHabitacion}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      required
                    >
                      <option value="individual">Individual</option>
                      <option value="doble">Doble</option>
                      <option value="suite">Suite</option>
                      <option value="familiar">Familiar</option>
                    </select>
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Precio Base por Noche (MXN)</label>
                    <input
                      type="number"
                      name="precioBaseNoche"
                      placeholder="Ej. 1500"
                      value={formData.precioBaseNoche}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Estatus Inicial</label>
                    <select
                      name="estatus"
                      value={formData.estatus}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      required
                    >
                      <option value="disponible">Disponible</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="ocupada">Ocupada</option>
                    </select>
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Capacidad Máxima</label>
                    <input
                      type="number"
                      name="capacidadMaxima"
                      value={formData.capacidadMaxima}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Número de Camas (Máx 4)</label>
                    <input
                      type="number"
                      name="numeroCamas"
                      value={formData.numeroCamas}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      min="0"
                      max="4"
                      required
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Tipo de Camas</label>
                    <input
                      type="text"
                      name="tipoCamas"
                      placeholder="Ej. 1 King Size"
                      value={formData.tipoCamas}
                      onChange={handleInputChange}
                      className="form-control w-full"
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5 w-full">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Metros Cuadrados (m²)</label>
                    <input
                      type="number"
                      name="metrosCuadrados"
                      placeholder="Ej. 35"
                      value={formData.metrosCuadrados}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group flex flex-col gap-1.5 w-full">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Descripción Corta</label>
                  <input
                    type="text"
                    name="descripcionCorta"
                    placeholder="Pequeño resumen..."
                    value={formData.descripcionCorta}
                    onChange={handleInputChange}
                    className="form-control w-full"
                  />
                </div>

                <div className="form-group flex flex-col gap-1.5 w-full">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Descripción Detallada</label>
                  <textarea
                    name="descripcionLarga"
                    placeholder="Detalle completo de la habitación..."
                    value={formData.descripcionLarga}
                    onChange={handleInputChange}
                    className="form-control w-full"
                    rows="3"
                  />
                </div>

                {/* Amenidades */}
                <div className="w-full">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-3">
                    Amenidades / Atributos Extra
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'jacuzzi', label: 'Jacuzzi' },
                      { key: 'chimenea', label: 'Chimenea' },
                      { key: 'vistaJardin', label: 'Vista al Jardín' },
                      { key: 'permiteMascotas', label: 'Permite Mascotas' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          name={key}
                          checked={formData.atributosExtra[key] || false}
                          onChange={handleCheckboxChange}
                          className="accent-[var(--primary)] h-4 w-4"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Imágenes */}
                <div className="border-t border-[var(--border)] pt-5 w-full">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-3">
                    Galería de Imágenes
                  </label>

                  {isEditMode && keepImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Imágenes actuales en el servidor:</p>
                      <div className="flex flex-wrap gap-3">
                        {keepImages.map((url, idx) => (
                          <div key={idx} className="relative w-20 h-16 border border-[var(--border)]">
                            <img src={url} alt="Cargada" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(url)}
                              className="absolute -top-1.5 -right-1.5 bg-[var(--primary)] text-white border-none rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {newImagePreviews.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Nuevas imágenes por subir:</p>
                      <div className="flex flex-wrap gap-3">
                        {newImagePreviews.map((previewUrl, idx) => (
                          <div key={idx} className="relative w-20 h-16 border border-[var(--accent)]">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveLocalImage(idx)}
                              className="absolute -top-1.5 -right-1.5 bg-[#c15c3d] text-white border-none rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-[var(--border-radius-sm)] p-6 text-center cursor-pointer relative bg-[var(--white)] transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={24} className="text-[var(--primary)] mx-auto mb-2" />
                    <p className="text-sm font-medium">Selecciona archivos de imagen</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, JPEG o WEBP de hasta 5MB</p>
                  </div>
                </div>

                {/* Botones de acción fijados abajo del scroll */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-[var(--border)] pt-5 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn btn-outline w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto flex justify-center items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    {isEditMode ? 'Guardar Cambios' : 'Registrar Habitación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
