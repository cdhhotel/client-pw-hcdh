import { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Users, Search, RefreshCw, XCircle,
    CheckCircle, Loader2, Eye, AlertTriangle, ShieldAlert, Check
} from 'lucide-react';
import { reservationsService } from '../services/reservations.service';
import toast, { Toaster } from 'react-hot-toast';

export const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    // Modal de detalles
    const [selectedRes, setSelectedRes] = useState(null);

    // Carga de datos
    const fetchReservations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await reservationsService.getAll();
            const list = res?.data ?? res;
            setReservations(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Error al cargar reservaciones:', err);
            setError(err.message || 'No se pudo cargar la lista de reservaciones.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    // Filtrado de reservaciones
    useEffect(() => {
        let result = reservations;

        // Filtro por término de búsqueda (nombre, email, folio, habitación)
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter((res) => {
                const principalGuest = res.huesped_reservacion?.find(hr => hr.es_principal)?.huesped;
                const nombreCompleto = principalGuest
                    ? `${principalGuest.nombre} ${principalGuest.apellidos}`.toLowerCase()
                    : '';
                const email = principalGuest?.email?.toLowerCase() || '';
                const folio = res.folio?.toLowerCase() || '';
                const habitacion = res.habitacion?.nombre?.toLowerCase() || '';

                return nombreCompleto.includes(term) || email.includes(term) || folio.includes(term) || habitacion.includes(term);
            });
        }

        // Filtro por estado
        if (statusFilter !== 'todos') {
            result = result.filter(res => res.estado === statusFilter);
        }

        setFilteredReservations(result);
    }, [searchTerm, statusFilter, reservations]);

    // Handler para cancelar reservación
    const handleCancelReservation = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta reservación? Esta acción no se puede deshacer.')) {
            return;
        }

        setCancellingId(id);
        const toastId = toast.loading('Cancelando reservación...');
        try {
            const res = await reservationsService.cancel(id);
            if (res.success || res) {
                toast.success(res.message || 'Reservación cancelada correctamente.', { id: toastId });
                // Recargar la lista
                fetchReservations();
                if (selectedRes && selectedRes.id === id) {
                    setSelectedRes(null);
                }
            }
        } catch (err) {
            console.error('Error al cancelar:', err);
            toast.error(err.message || 'No se pudo cancelar la reservación.', { id: toastId });
        } finally {
            setCancellingId(null);
        }
    };

    // Handler para confirmar reservación
    const handleConfirmReservation = async (id) => {
        if (!window.confirm('¿Desea confirmar la reservación?')) {
            return;
        }

        setConfirmingId(id);
        const toastId = toast.loading('Confirmando reservación...');
        try {
            const res = await reservationsService.confirm(id);
            if (res.success || res) {
                toast.success(res.message || 'Reservación confirmada correctamente.', { id: toastId });
                // Recargar la lista
                fetchReservations();
                if (selectedRes && selectedRes.id === id) {
                    setSelectedRes(null);
                }
            }
        } catch (err) {
            console.error('Error al confirmar:', err);
            toast.error(err.message || 'No se pudo confirmar la reservación.', { id: toastId });
        } finally {
            setConfirmingId(null);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'confirmada':
                return 'badge-success';
            case 'cancelada':
                return 'badge-danger';
            case 'pendiente':
                return 'badge-warning';
            case 'activa':
                return 'badge-info';
            case 'finalizada':
                return 'badge-dark';
            default:
                return 'badge-warning';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        // Ajustar zona horaria local
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-full py-section animate-fade-in">
            <Toaster />
            <div className="container">

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Reservaciones</h1>
                        <p className="section-subtitle" style={{ textAlign: 'left', margin: '0.25rem 0 0 0' }}>
                            Historial y control de reservas del Hotel Casa Dolores
                        </p>
                    </div>
                    <button
                        onClick={fetchReservations}
                        className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Recargar
                    </button>
                </div>

                {/* Buscador y Filtros */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Búsqueda */}
                    <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por Folio, Huésped o Habitación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                            style={{ paddingLeft: '2.5rem', margin: 0 }}
                        />
                    </div>

                    {/* Filtro de Estado */}
                    <div style={{ minWidth: '200px' }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-control"
                            style={{ margin: 0 }}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="confirmada">Confirmadas</option>
                            <option value="activa">Activas (En estancia)</option>
                            <option value="finalizada">Finalizadas</option>
                            <option value="cancelada">Canceladas</option>
                        </select>
                    </div>
                </div>

                {/* Carga */}
                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1rem' }}>
                        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Cargando reservaciones...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="glass-panel text-center" style={{ padding: '3rem', borderRadius: 'var(--border-radius-md)' }}>
                        <AlertTriangle size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Error de Carga</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                        <button onClick={fetchReservations} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {/* Listado */}
                {!loading && !error && (
                    <div className="admin-table-container animate-fade-in" style={{ borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--glass-bg)', overflow: 'hidden' }}>
                        <div className="overflow-x-auto">
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Folio</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Huésped Principal</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habitación</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estancia</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReservations.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No se encontraron reservaciones que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReservations.map((res) => {
                                            const principalHR = res.huesped_reservacion?.find(hr => hr.es_principal);
                                            const principal = principalHR?.huesped;

                                            return (
                                                <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                            {res.folio}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            Creada: {formatDate(res.created_at)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        {principal ? (
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{principal.nombre} {principal.apellidos}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{principal.email}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{principal.telefono}</div>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin huésped principal</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontWeight: 500 }}>{res.habitacion?.nombre || '—'}</div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            Hab. #{res.habitacion?.numero || '—'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontSize: '0.85rem' }}>
                                                            <strong>In:</strong> {formatDate(res.fecha_entrada)}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                                                            <strong>Out:</strong> {formatDate(res.fecha_salida)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>
                                                        ${Number(res.total_pagar).toLocaleString('es-MX')} MXN
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <span className={`badge ${getStatusBadgeClass(res.estado)}`} style={{ textTransform: 'capitalize' }}>
                                                            {res.estado}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => setSelectedRes(res)}
                                                                className="btn btn-outline"
                                                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                title="Ver detalles completos"
                                                            >
                                                                <Eye size={14} /> Detalles
                                                            </button>
                                                            {res.estado !== 'confirmada' && res.estado !== 'activa' && (
                                                                <button
                                                                    onClick={() => handleConfirmReservation(res.id)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.4rem 0.6rem',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: 'rgba(47, 220, 38, 0.08)',
                                                                        color: '#06AB00',
                                                                        border: '1px solid rgba(5, 158, 0, 0.2)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}
                                                                    disabled={confirmingId === res.id}
                                                                >
                                                                    {confirmingId === res.id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <Check size={14} />
                                                                    )}
                                                                    Confirmar
                                                                </button>
                                                            )}
                                                            {res.estado !== 'cancelada' && res.estado !== 'finalizada' && (
                                                                <button
                                                                    onClick={() => handleCancelReservation(res.id)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.4rem 0.6rem',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: 'rgba(220,38,38,0.08)',
                                                                        color: '#dc2626',
                                                                        border: '1px solid rgba(220,38,38,0.2)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}
                                                                    disabled={cancellingId === res.id}
                                                                >
                                                                    {cancellingId === res.id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <XCircle size={14} />
                                                                    )}
                                                                    Cancelar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Mostrando {filteredReservations.length} de {reservations.length} reservaciones registradas
                            </span>
                        </div>
                    </div>
                )}

                {/* Modal de Detalles Completos */}
                {selectedRes && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1.5rem', backdropFilter: 'blur(4px)'
                    }}>
                        <div className="glass-panel animate-fade-in" style={{
                            width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
                            padding: '2.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)'
                        }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                                    Detalle de Reservación: {selectedRes.folio}
                                </h3>
                                <span className={`badge ${getStatusBadgeClass(selectedRes.estado)}`} style={{ textTransform: 'capitalize' }}>
                                    {selectedRes.estado}
                                </span>
                            </div>

                            {/* Información */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Fechas y Habitación */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: 'var(--bg-linen)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Entrada</span>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatDate(selectedRes.fecha_entrada)}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Salida</span>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatDate(selectedRes.fecha_salida)}</div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Habitación Seleccionada</span>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{selectedRes.habitacion?.nombre} (Hab. #{selectedRes.habitacion?.numero})</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Camas: {selectedRes.habitacion?.numero_camas} - Capacidad: {selectedRes.habitacion?.capacidad_maxima} personas</div>
                                    </div>
                                </div>

                                {/* Huésped */}
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '0.75rem' }}>
                                        Información del Huésped
                                    </h4>
                                    {selectedRes.huesped_reservacion?.map((hr, idx) => {
                                        const h = hr.huesped;
                                        return (
                                            <div key={hr.id} style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem', borderLeft: hr.es_principal ? '3px solid var(--secondary)' : '3px solid var(--border-color)' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    {h.nombre} {h.apellidos} {hr.es_principal && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Principal</span>}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correo: {h.email || 'No proporcionado'} | Teléfono: {h.telefono}</div>
                                                {h.numero_documento && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doc: {h.tipo_documento || 'ID'} - {h.numero_documento}</div>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Peticiones */}
                                {selectedRes.comentarios && (
                                    <div>
                                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '0.5rem' }}>
                                            Comentarios / Peticiones Especiales
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', backgroundColor: '#fcfbf9', padding: '0.75rem', borderRadius: '4px', border: '1px solid #f4f1eb' }}>
                                            "{selectedRes.comentarios}"
                                        </p>
                                    </div>
                                )}

                                {/* Finanzas */}
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '0.75rem' }}>
                                        Resumen Financiero
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Precio por noches</span>
                                            <span>${Number(selectedRes.precio_total_noches).toLocaleString('es-MX')} MXN</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Impuestos (16% IVA)</span>
                                            <span>${Number(selectedRes.impuestos).toLocaleString('es-MX')} MXN</span>
                                        </div>
                                        {Number(selectedRes.descuento_aplicado) > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
                                                <span>Descuento Aplicado</span>
                                                <span>-${Number(selectedRes.descuento_aplicado).toLocaleString('es-MX')} MXN</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            <span>Total Neto</span>
                                            <span>${Number(selectedRes.total_pagar).toLocaleString('es-MX')} MXN</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pagos Relacionados */}
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '0.75rem' }}>
                                        Historial de Pagos
                                    </h4>
                                    {selectedRes.pago && selectedRes.pago.length > 0 ? (
                                        selectedRes.pago.map(p => (
                                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <div>
                                                    <strong style={{ textTransform: 'uppercase' }}>{p.metodo_pago}</strong>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({formatDate(p.fecha_pago)})</span>
                                                </div>
                                                <span style={{ fontWeight: 600, color: p.estado === 'completado' ? 'green' : 'orange' }}>
                                                    ${Number(p.monto).toLocaleString('es-MX')} MXN ({p.estado})
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            No hay pagos registrados para esta reservación.
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Botón Cerrar */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                                {selectedRes.estado !== 'cancelada' && selectedRes.estado !== 'finalizada' && (
                                    <button
                                        onClick={() => handleCancelReservation(selectedRes.id)}
                                        className="btn"
                                        style={{
                                            backgroundColor: 'rgba(220,38,38,0.08)',
                                            color: '#dc2626',
                                            border: '1px solid rgba(220,38,38,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        disabled={cancellingId === selectedRes.id}
                                    >
                                        <XCircle size={14} /> Cancelar Reservación
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedRes(null)}
                                    className="btn btn-primary"
                                >
                                    Cerrar
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
            <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Reservations;
