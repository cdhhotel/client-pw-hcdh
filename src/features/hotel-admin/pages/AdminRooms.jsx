import { useState, useEffect } from 'react';
import { Bed, Plus, RefreshCw, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { roomService } from '../services/roomService';
import { RoomRow } from '../components/RoomRow';
import { RoomFormModal } from '../components/RoomFormModal';

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
        extras: false,
        terraza: false,
        bano: false,
        tv: false,
        wifi: false
    }
};

export const AdminRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState(initialFormState);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [keepImages, setKeepImages] = useState([]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { rooms, hotels } = await roomService.getInitialData();
            setRooms(rooms);
            setHotels(hotels);

            if (hotels.length > 0 && !isEditMode) {
                setFormData(prev => ({ ...prev, hotelId: hotels[0].id }));
            }
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

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setSelectedRoomId(null);
        setFormData({ ...initialFormState, hotelId: hotels.length > 0 ? hotels[0].id : '' });
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
                extras: !!extra.extras,
                terraza: !!extra.terraza,
                bano: !!extra.bano,
                tv: !!extra.tv,
                wifi: !!extra.wifi,
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
                await roomService.deleteRoom(id);
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
            await roomService.saveRoom(formData, isEditMode, selectedRoomId, keepImages, newImages);
            showSuccess(`Habitación ${formData.numero} ${isEditMode ? 'actualizada' : 'registrada'} correctamente.`);
            setIsFormOpen(false);
            loadData();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al procesar la habitación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.nombre && room.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || room.estatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="animate-fade-in flex flex-col gap-8 w-full">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
                <h1 className="text-3xl md:text-4xl font-semibold text-[var(--primary)] mb-1">
                    Gestión de Habitaciones
                </h1>
                <button className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2" onClick={handleOpenCreate}>
                    <Plus size={18} /> Nueva Habitación
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
                        <input type="text" placeholder="Buscar por número o nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-control w-full pl-9" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control w-full sm:w-48">
                        <option value="all">Todos los estados</option>
                        <option value="disponible">Disponibles</option>
                        <option value="mantenimiento">En mantenimiento</option>
                        <option value="ocupada">Ocupadas</option>
                    </select>
                </div>
                <button className="btn btn-outline p-3 w-full md:w-auto flex justify-center items-center" onClick={loadData} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="text-center py-16">
                    <RefreshCw size={36} className="animate-spin text-[var(--primary)] mx-auto mb-4" />
                    <p className="font-serif text-[var(--text-muted)]">Cargando inventario...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="glass-panel text-center py-16 px-4 rounded-[var(--border-radius-md)]">
                    <Bed size={48} className="text-[var(--border)] mx-auto mb-4" />
                    <h3 className="text-xl font-serif text-[var(--primary)]">No se encontraron habitaciones</h3>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table w-full">
                        <thead>
                            <tr>
                                <th className="w-24">Foto</th>
                                <th>Número</th>
                                <th>Nombre / Tipo</th>
                                <th>Hotel</th>
                                <th>Capacidad</th>
                                <th>Precio</th>
                                <th>Estatus</th>
                                <th className="text-right w-28">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map(room => (
                                <RoomRow
                                    key={room.id}
                                    room={room}
                                    hotelName={hotels.find(h => h.id === room.hotel_id)?.nombre || 'Hotel Desconocido'}
                                    onEdit={handleOpenEdit}
                                    onDelete={handleDeleteRoom}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <RoomFormModal
                isOpen={isFormOpen}
                isEditMode={isEditMode}
                formData={formData}
                hotels={hotels}
                isSubmitting={isSubmitting}
                keepImages={keepImages}
                newImagePreviews={newImagePreviews}
                onClose={() => setIsFormOpen(false)}
                onInputChange={handleInputChange}
                onCheckboxChange={handleCheckboxChange}
                onImageSelect={handleImageSelect}
                onRemoveLocalImage={handleRemoveLocalImage}
                onRemoveExistingImage={(url) => setKeepImages(prev => prev.filter(u => u !== url))}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default AdminRooms;