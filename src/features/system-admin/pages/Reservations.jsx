import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    Calendar, Users, Search, RefreshCw, XCircle,
    CheckCircle, Loader2, Eye, AlertTriangle, ShieldAlert, Check, Trash2, LogOut, Sparkles, Download, FileText
} from 'lucide-react';
import { reservationsService } from '../services/reservations.service';
import { updateRoomStatus, getStayDays } from '../../../services/cleaningService';
import { exportReservationsToExcel } from '../../../utils/exportExcel';
import { generatePdfAnalyticsReport } from '../../../utils/exportPdfReport';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [checkoutId, setCheckoutId] = useState(null);
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

    // Handler para cancelar reservación con SweetAlert2
    const handleCancelReservation = async (id, folio) => {
        const result = await Swal.fire({
            title: '¿Cancelar reservación?',
            text: folio ? `¿Estás seguro de que deseas cancelar la reservación ${folio}?` : '¿Estás seguro de que deseas cancelar esta reservación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d97706',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, regresar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setCancellingId(id);
        try {
            const res = await reservationsService.cancel(id);
            if (res.success || res) {
                Swal.fire({
                    title: '¡Cancelada!',
                    text: res.message || 'La reservación fue cancelada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#3d2b1f'
                });
                fetchReservations();
                if (selectedRes && selectedRes.id === id) {
                    setSelectedRes(null);
                }
            }
        } catch (err) {
            console.error('Error al cancelar:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'No se pudo cancelar la reservación.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setCancellingId(null);
        }
    };

    // Handler para confirmar reservación con SweetAlert2
    const handleConfirmReservation = async (id, folio) => {
        const result = await Swal.fire({
            title: '¿Confirmar reservación?',
            text: folio ? `¿Deseas confirmar la reservación ${folio}?` : '¿Deseas confirmar la reservación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059e00',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setConfirmingId(id);
        try {
            const res = await reservationsService.confirm(id);
            if (res.success || res) {
                Swal.fire({
                    title: '¡Confirmada!',
                    text: res.message || 'La reservación fue confirmada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#3d2b1f'
                });
                fetchReservations();
                if (selectedRes && selectedRes.id === id) {
                    setSelectedRes(null);
                }
            }
        } catch (err) {
            console.error('Error al confirmar:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'No se pudo confirmar la reservación.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setConfirmingId(null);
        }
    };

    // Handler para realizar Check-Out (finaliza reservación, cambia habitación a estatus 'limpieza' y notifica WhatsApp)
    const handleCheckoutReservation = async (resObj) => {
        const roomNum = resObj.habitacion?.numero || 'N/A';
        const roomName = resObj.habitacion?.nombre || '';
        const guestName = resObj.huesped_reservacion?.find(hr => hr.es_principal)?.huesped?.nombre || '';

        const result = await Swal.fire({
            title: '¿Realizar Check-Out?',
            text: `Se finalizará la reservación ${resObj.folio || ''} y la Habitación #${roomNum} cambiará automáticamente a estatus EN LIMPIEZA.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, hacer Check-Out',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setCheckoutId(resObj.id);
        try {
            const res = await reservationsService.checkout(resObj.id);
            if (res.habitacion_id || res.success) {
                const roomId = resObj.habitacion_id || resObj.habitacion?.id;
                if (roomId) {
                    await updateRoomStatus(roomId, 'limpieza');
                }

                Swal.fire({
                    title: '¡Check-Out Completado!',
                    text: `La Habitación #${roomNum} fue registrada en estatus EN LIMPIEZA.`,
                    icon: 'success',
                    confirmButtonColor: '#3b82f6'
                });

                fetchReservations();
                if (selectedRes && selectedRes.id === resObj.id) {
                    setSelectedRes(null);
                }
            }
        } catch (err) {
            console.error('Error al hacer check-out:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'No se pudo realizar el check-out.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setCheckoutId(null);
        }
    };

    // Handler para solicitar limpieza en estancias de más de 3 días
    const handleRequestCleaning = async (resObj) => {
        const roomNum = resObj.habitacion?.numero || 'N/A';
        const roomName = resObj.habitacion?.nombre || '';
        const guestName = resObj.huesped_reservacion?.find(hr => hr.es_principal)?.huesped?.nombre || '';
        const stayDays = getStayDays(resObj.fecha_entrada, resObj.fecha_salida);

        const result = await Swal.fire({
            title: '🧹 Solicitar Limpieza de Habitación',
            text: `Esta reservación tiene una estancia de ${stayDays} días. ¿Deseas cambiar la Habitación #${roomNum} a estatus EN LIMPIEZA y notificar por WhatsApp?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#0284c7',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cambiar a Limpieza',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            const roomId = resObj.habitacion_id || resObj.habitacion?.id;
            if (roomId) {
                await updateRoomStatus(roomId, 'limpieza');
            }
            sendCleaningWhatsAppNotification(roomNum, roomName, guestName, `Limpieza intermedia (Estancia de ${stayDays} días)`);
            Swal.fire({
                title: '¡Habitación en Limpieza!',
                text: `La Habitación #${roomNum} fue actualizada a estatus EN LIMPIEZA y se abrió WhatsApp.`,
                icon: 'success',
                confirmButtonColor: '#3d2b1f'
            });
            fetchReservations();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.message || 'No se pudo actualizar el estatus de la habitación.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    // Handler para eliminar reservación con SweetAlert2
    const handleDeleteReservation = async (id, folio) => {
        const result = await Swal.fire({
            title: '¿ELIMINAR reservación?',
            text: folio ? `¿Estás seguro de ELIMINAR permanentemente la reservación ${folio}? Esta acción no se puede deshacer.` : '¿Estás seguro de que deseas ELIMINAR esta reservación? Esta acción no se puede deshacer.',
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setDeletingId(id);
        try {
            const res = await reservationsService.delete(id);
            if (res.success || res) {
                Swal.fire({
                    title: '¡Eliminada!',
                    text: res.message || 'La reservación fue eliminada correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#3d2b1f'
                });
                fetchReservations();
                if (selectedRes && selectedRes.id === id) {
                    setSelectedRes(null);
                }
            }
        } catch (err) {
            console.error('Error al eliminar:', err);
            Swal.fire({
                title: 'Error',
                text: err.message || 'No se pudo eliminar la reservación.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setDeletingId(null);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => generatePdfAnalyticsReport(filteredReservations)}
                            className="btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontWeight: 600, padding: '0.55rem 1.1rem', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer' }}
                            title="Generar e imprimir Reporte Ejecutivo en PDF"
                        >
                            <FileText size={15} />
                            Reporte PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => exportReservationsToExcel(filteredReservations)}
                            className="btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', fontWeight: 600, padding: '0.55rem 1.1rem', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer' }}
                            title="Descargar reporte completo en formato Excel (.csv)"
                        >
                            <Download size={15} />
                            Exportar a Excel
                        </button>
                        <button
                            type="button"
                            onClick={fetchReservations}
                            className="btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}
                            disabled={loading}
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Recargar
                        </button>
                    </div>
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

                </div>

                {/* Pestañas de Filtro por Estado (Scrollable) */}
                <div style={{ width: '100%', overflowX: 'auto', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 'max-content', paddingBottom: 0, scrollbarWidth: 'thin' }}>
                        {[
                            { id: 'todos', label: 'Todas', count: reservations.length },
                            { id: 'confirmada', label: 'Confirmadas', count: reservations.filter(r => (r.estado || '').toLowerCase() === 'confirmada' || (r.estado || '').toLowerCase() === 'confirmed').length },
                            { id: 'pendiente', label: 'Pendientes', count: reservations.filter(r => (r.estado || '').toLowerCase() === 'pendiente' || (r.estado || '').toLowerCase() === 'pending').length },
                            { id: 'activa', label: 'Activas', count: reservations.filter(r => (r.estado || '').toLowerCase() === 'activa' || (r.estado || '').toLowerCase() === 'active').length },
                            { id: 'finalizada', label: 'Finalizadas', count: reservations.filter(r => (r.estado || '').toLowerCase() === 'finalizada' || (r.estado || '').toLowerCase() === 'completed').length },
                            { id: 'cancelada', label: 'Canceladas', count: reservations.filter(r => (r.estado || '').toLowerCase() === 'cancelada' || (r.estado || '').toLowerCase() === 'canceled').length },
                        ].map(tab => {
                            const isActive = statusFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.id)}
                                    style={{
                                        padding: '0.65rem 1.25rem',
                                        fontSize: '0.88rem',
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                        backgroundColor: isActive ? 'rgba(160, 68, 42, 0.08)' : 'transparent',
                                        border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                                        borderBottom: isActive ? '3px solid var(--primary)' : '1px solid transparent',
                                        borderRadius: '8px 8px 0 0',
                                        marginBottom: '-1px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        style={{
                                            fontSize: '0.72rem',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '12px',
                                            backgroundColor: isActive ? 'var(--primary)' : 'rgba(0,0,0,0.07)',
                                            color: isActive ? '#FFF' : 'var(--text-muted)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
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
                                                    <td data-label="Folio" style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                                {res.folio}
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                Creada: {formatDate(res.created_at)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Huésped" style={{ padding: '1.25rem 1.5rem' }}>
                                                        {principal ? (
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ fontWeight: 600 }}>{principal.nombre} {principal.apellidos}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{principal.email}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{principal.telefono}</div>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Sin huésped principal</span>
                                                        )}
                                                    </td>
                                                    <td data-label="Habitación" style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 500 }}>{res.habitacion?.nombre || '—'}</div>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                Hab. #{res.habitacion?.numero || '—'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Estancia" style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                                            <div><strong>In:</strong> {formatDate(res.fecha_entrada)}</div>
                                                            <div style={{ marginTop: '2px' }}><strong>Out:</strong> {formatDate(res.fecha_salida)}</div>
                                                        </div>
                                                    </td>
                                                    <td data-label="Total" style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            ${Number(res.total_pagar).toLocaleString('es-MX')} MXN
                                                        </div>
                                                    </td>
                                                    <td data-label="Estado" style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span className={`badge ${getStatusBadgeClass(res.estado)}`} style={{ textTransform: 'capitalize' }}>
                                                                {res.estado}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Acciones" style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                                                            <button
                                                                onClick={() => setSelectedRes(res)}
                                                                className="btn btn-outline"
                                                                style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                                                title="Ver detalles completos"
                                                            >
                                                                <Eye size={14} /> Detalles
                                                            </button>
                                                            {res.estado !== 'confirmada' && res.estado !== 'activa' && res.estado !== 'finalizada' && res.estado !== 'cancelada' && (
                                                                <button
                                                                    onClick={() => handleConfirmReservation(res.id, res.folio)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.4rem 0.65rem',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: 'rgba(47, 220, 38, 0.08)',
                                                                        color: '#06AB00',
                                                                        border: '1px solid rgba(5, 158, 0, 0.2)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap'
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

                                                            {/* Check-Out (pasa habitación a En Limpieza) */}
                                                            {res.estado !== 'finalizada' && res.estado !== 'cancelada' && (
                                                                <button
                                                                    onClick={() => handleCheckoutReservation(res)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.4rem 0.65rem',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                                                        color: '#2563eb',
                                                                        border: '1px solid rgba(59, 130, 246, 0.25)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    disabled={checkoutId === res.id}
                                                                    title="Realizar Check-Out y poner habitación en Limpieza"
                                                                >
                                                                    {checkoutId === res.id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <LogOut size={14} />
                                                                    )}
                                                                    Check-Out
                                                                </button>
                                                            )}

                                                            {/* Solicitud de Limpieza para estancias de >3 días */}
                                                            {getStayDays(res.fecha_entrada, res.fecha_salida) >= 3 && res.estado !== 'cancelada' && res.estado !== 'finalizada' && (
                                                                <button
                                                                    onClick={() => handleRequestCleaning(res)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.4rem 0.65rem',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                                                                        color: '#0284c7',
                                                                        border: '1px solid rgba(14, 165, 233, 0.25)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={`Estancia de ${getStayDays(res.fecha_entrada, res.fecha_salida)} días: Solicitar servicio de limpieza`}
                                                                >
                                                                    <Sparkles size={14} /> Limpieza (+3d)
                                                                </button>
                                                            )}

                                                            {res.estado !== 'cancelada' && res.estado !== 'finalizada' && (
                                                                <button
                                                                    onClick={() => handleCancelReservation(res.id, res.folio)}
                                                                    className="btn"
                                                                    style={{
                                                                        padding: '0.4rem 0.65rem',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: 'rgba(220,38,38,0.08)',
                                                                        color: '#dc2626',
                                                                        border: '1px solid rgba(220,38,38,0.2)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        whiteSpace: 'nowrap'
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
                                                            <button
                                                                onClick={() => handleDeleteReservation(res.id, res.folio)}
                                                                className="btn"
                                                                style={{
                                                                    padding: '0.4rem 0.65rem',
                                                                    fontSize: '0.8rem',
                                                                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                                                                    color: '#991b1b',
                                                                    border: '1px solid rgba(220, 38, 38, 0.3)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                                disabled={deletingId === res.id}
                                                                title="Eliminar reservación"
                                                            >
                                                                {deletingId === res.id ? (
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={14} />
                                                                )}
                                                                Eliminar
                                                            </button>
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
                {selectedRes && createPortal(
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                    }}
                        onClick={() => setSelectedRes(null)}
                    >
                        <div className="glass-panel animate-fade-in" style={{
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '1.75rem 1.25rem',
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                            position: 'relative'
                        }}
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                                    Detalle de Reservación: {selectedRes.folio}
                                </h3>
                                <span className={`badge ${getStatusBadgeClass(selectedRes.estado)}`} style={{ textTransform: 'capitalize' }}>
                                    {selectedRes.estado}
                                </span>
                            </div>

                            {/* Información */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Fechas y Habitación */}
                                <div className="grid grid-2" style={{ gap: '1rem', backgroundColor: 'var(--bg-linen)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Entrada</span>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatDate(selectedRes.fecha_entrada)}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Salida</span>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatDate(selectedRes.fecha_salida)}</div>
                                    </div>
                                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
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
                                    {selectedRes.huesped_reservacion?.map((hr) => {
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
                                        selectedRes.pago.map((p) => (
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

                            {/* Botones de Acción / Cerrar */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                                {selectedRes.estado !== 'cancelada' && selectedRes.estado !== 'finalizada' && (
                                    <button
                                        onClick={() => handleCancelReservation(selectedRes.id, selectedRes.folio)}
                                        className="btn"
                                        style={{
                                            backgroundColor: 'rgba(220,38,38,0.08)',
                                            color: '#dc2626',
                                            border: '1px solid rgba(220,38,38,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.82rem'
                                        }}
                                        disabled={cancellingId === selectedRes.id}
                                    >
                                        <XCircle size={14} /> Cancelar Reservación
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteReservation(selectedRes.id, selectedRes.folio)}
                                    className="btn"
                                    style={{
                                        backgroundColor: 'rgba(220, 38, 38, 0.15)',
                                        color: '#991b1b',
                                        border: '1px solid rgba(220, 38, 38, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.82rem'
                                    }}
                                    disabled={deletingId === selectedRes.id}
                                >
                                    {deletingId === selectedRes.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Eliminar Reservación
                                </button>
                                <button
                                    onClick={() => setSelectedRes(null)}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    Cerrar
                                </button>
                            </div>

                        </div>
                    </div>,
                    document.body
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
