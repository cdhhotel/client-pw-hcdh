import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Bed, TrendingUp, Users, CheckCircle, Clock, AlertTriangle,
  RefreshCw, Loader2, LogOut, DollarSign, Sparkles, MapPin, Compass,
  BarChart3, Wrench, ArrowRight
} from 'lucide-react';
import { reservationsService } from '../services/reservations.service';
import { itineraryService } from '../../hotel-admin/services/itineraryService';
import { api } from '../../../services/api';

export const Dashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resResult, roomsResult, eventosResult, sitiosResult] = await Promise.allSettled([
        reservationsService.getAll(),
        api.get('/room/rooms'),
        itineraryService.getEventos(),
        itineraryService.getSitiosCercanos(),
      ]);

      let resList = [];
      if (resResult.status === 'fulfilled') {
        const raw = resResult.value;
        resList = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      }

      let roomsList = [];
      if (roomsResult.status === 'fulfilled') {
        const rawRooms = roomsResult.value;
        roomsList = Array.isArray(rawRooms?.data) ? rawRooms.data : (Array.isArray(rawRooms) ? rawRooms : []);
      }

      let actList = [];
      if (eventosResult.status === 'fulfilled') {
        const rawEventos = eventosResult.value;
        const list = Array.isArray(rawEventos?.data) ? rawEventos.data : (Array.isArray(rawEventos) ? rawEventos : []);
        actList = [...actList, ...list.map(item => ({ ...item, tipo: 'Evento' }))];
      }
      if (sitiosResult.status === 'fulfilled') {
        const rawSitios = sitiosResult.value;
        const list = Array.isArray(rawSitios?.data) ? rawSitios.data : (Array.isArray(rawSitios) ? rawSitios : []);
        actList = [...actList, ...list.map(item => ({ ...item, tipo: 'Atracción' }))];
      }

      setReservations(resList);
      setRooms(roomsList);
      setActivities(actList);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError(err.message || 'No se pudieron cargar las estadísticas del hotel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Formato de fechas YYYY-MM-DD
  const getISOStringDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val.slice(0, 10);
    return new Date(val).toISOString().slice(0, 10);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Conteo total de habitaciones
  const totalRoomsCount = rooms.length > 0 ? rooms.length : 8;

  // 1. Habitaciones Ocupadas Hoy
  const occupiedRoomsCount = useMemo(() => {
    return reservations.filter((r) => {
      if (r.estado === 'cancelada') return false;
      const inDate = getISOStringDate(r.fecha_entrada);
      const outDate = getISOStringDate(r.fecha_salida);
      return inDate <= todayStr && outDate > todayStr;
    }).length;
  }, [reservations, todayStr]);

  const occupancyPercentage = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  // 2. Llegadas Hoy (Check-ins)
  const arrivalsTodayCount = useMemo(() => {
    return reservations.filter((r) => {
      return r.estado !== 'cancelada' && getISOStringDate(r.fecha_entrada) === todayStr;
    }).length;
  }, [reservations, todayStr]);

  // 3. Salidas Hoy (Check-outs)
  const departuresTodayCount = useMemo(() => {
    return reservations.filter((r) => {
      return r.estado !== 'cancelada' && getISOStringDate(r.fecha_salida) === todayStr;
    }).length;
  }, [reservations, todayStr]);

  // 4. Reservas Activas
  const activeReservations = useMemo(() => {
    return reservations.filter((r) => r.estado === 'confirmada' || r.estado === 'pendiente');
  }, [reservations]);
  const confirmedCount = reservations.filter((r) => r.estado === 'confirmada').length;
  const pendingCount = reservations.filter((r) => r.estado === 'pendiente').length;

  // 5. Ingresos del Mes
  const monthRevenue = useMemo(() => {
    return reservations.reduce((acc, r) => {
      if (r.estado === 'cancelada') return acc;
      const dateRef = new Date(r.fecha_entrada || r.created_at || Date.now());
      if (dateRef.getMonth() === currentMonth && dateRef.getFullYear() === currentYear) {
        const amount = Number(r.total_pagar || r.precio_total_noches || r.total || 0);
        return acc + amount;
      }
      return acc;
    }, 0);
  }, [reservations, currentMonth, currentYear]);

  // 6. Pagos Pendientes y Saldos por Cobrar
  const getReservationPaymentInfo = (r) => {
    const totalPagar = Number(r.total_pagar || r.precio_total_noches || r.total || 0);
    const pagosCompletados = Array.isArray(r.pago)
      ? r.pago.filter((p) => p.estado === 'completado').reduce((sum, p) => sum + Number(p.monto || 0), 0)
      : 0;

    let saldo = Math.max(0, totalPagar - pagosCompletados);
    // Si la reserva está en estado pendiente y sin pagos registrados, todo el total es saldo pendiente
    if (r.estado === 'pendiente' && pagosCompletados === 0) {
      saldo = totalPagar;
    }
    if (r.estado === 'cancelada') {
      saldo = 0;
    }

    return { totalPagar, pagosCompletados, saldo };
  };

  const pendingPaymentsStats = useMemo(() => {
    let totalPendingAmount = 0;
    let reservationsWithBalanceCount = 0;

    reservations.forEach((r) => {
      if (r.estado === 'cancelada' || r.estado === 'finalizada') return;
      const { saldo } = getReservationPaymentInfo(r);
      if (saldo > 0) {
        totalPendingAmount += saldo;
        reservationsWithBalanceCount += 1;
      }
    });

    return { totalPendingAmount, reservationsWithBalanceCount };
  }, [reservations]);

  // 7. Habitaciones por Limpiar / Mantenimiento
  const roomsMaintenanceCount = useMemo(() => {
    return rooms.filter(
      (room) => room.estatus === 'mantenimiento' || room.estatus === 'sucia' || room.estatus === 'limpieza'
    ).length;
  }, [rooms]);

  // Map de Clientes Frecuentes (Contador por correo / nombre)
  const guestReservationCountMap = useMemo(() => {
    const map = new Map();
    reservations.forEach((r) => {
      let key = null;
      if (r.huesped_reservacion && r.huesped_reservacion.length > 0) {
        const principal = r.huesped_reservacion.find((hr) => hr.es_principal) || r.huesped_reservacion[0];
        key = principal?.huesped?.email || `${principal?.huesped?.nombre}_${principal?.huesped?.apellidos}`;
      } else if (r.customer || r.email) {
        key = r.email || r.customer;
      }
      if (key) {
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [reservations]);

  const isFrequentGuest = (r) => {
    let key = null;
    if (r.huesped_reservacion && r.huesped_reservacion.length > 0) {
      const principal = r.huesped_reservacion.find((hr) => hr.es_principal) || r.huesped_reservacion[0];
      key = principal?.huesped?.email || `${principal?.huesped?.nombre}_${principal?.huesped?.apellidos}`;
    } else if (r.customer || r.email) {
      key = r.email || r.customer;
    }
    return key ? (guestReservationCountMap.get(key) || 0) > 1 : false;
  };

  // 8. Proyección de Ocupación a 7 Días
  const next7DaysProjection = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoStr = d.toISOString().slice(0, 10);

      const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

      const occupied = reservations.filter((r) => {
        if (r.estado === 'cancelada') return false;
        const inDate = getISOStringDate(r.fecha_entrada);
        const outDate = getISOStringDate(r.fecha_salida);
        return inDate <= isoStr && outDate > isoStr;
      }).length;

      const percentage = Math.min(100, Math.round((occupied / totalRoomsCount) * 100));

      days.push({
        isoStr,
        dayName,
        occupied,
        percentage,
      });
    }

    return days;
  }, [reservations, totalRoomsCount]);

  // Helpers de nombres
  const getGuestName = (r) => {
    if (r.huesped_reservacion && Array.isArray(r.huesped_reservacion) && r.huesped_reservacion.length > 0) {
      const principal = r.huesped_reservacion.find((hr) => hr.es_principal) || r.huesped_reservacion[0];
      if (principal?.huesped) {
        const full = `${principal.huesped.nombre || ''} ${principal.huesped.apellidos || ''}`.trim();
        if (full) return full;
      }
    }
    return r.customer || r.nombre_huesped || 'Huésped';
  };

  const getRoomName = (r) => r.habitacion?.nombre || r.room || 'Habitación Reservada';
  const getFolio = (r) => r.folio || r.id || 'N/A';

  const recentReservations = reservations.slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={36} style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>Cargando estadísticas generales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff0f0', border: '1px solid #fecaca', borderRadius: 'var(--border-radius-md)' }}>
        <AlertTriangle size={36} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Error al cargar el Dashboard</h3>
        <p style={{ color: '#7f1d1d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2.5rem' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Estadísticas Generales</h1>
          <p style={{ color: 'var(--text-muted)' }}>Resumen operativo, ocupación en tiempo real y flujo financiero del hotel.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          title="Actualizar datos"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* ── Fila 1: Indicadores Principales (Métricas Globales) ── */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
        
        {/* Ocupación Hoy */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ocupación</span>
            <Bed size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{occupancyPercentage}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 500 }}>
            {occupiedRoomsCount} de {totalRoomsCount} habitaciones ocupadas
          </div>
        </div>

        {/* Llegadas Hoy (Check-ins) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Llegadas Hoy</span>
            <Calendar size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{arrivalsTodayCount} Check-ins</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Programados para hoy</div>
        </div>

        {/* Reservas Activas */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reservas Activas</span>
            <Users size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{activeReservations.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 500 }}>
            {confirmedCount} confirmadas, {pendingCount} pendientes
          </div>
        </div>

        {/* Ingresos del Mes */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ingresos Mes</span>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            ${monthRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acumulado del mes (MXN)</div>
        </div>

      </div>

      {/* ── Fila 2: Indicadores Operativos (Nuevas Tarjetas) ── */}
      <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
        
        {/* Salidas Hoy (Check-outs) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salidas Hoy (Check-outs)</span>
            <LogOut size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{departuresTodayCount} Check-outs</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Habitaciones a desocupar hoy</div>
        </div>

        {/* Pagos / Saldo Pendiente */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pagos Pendientes</span>
            <DollarSign size={20} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#b45309', marginBottom: '0.25rem' }}>
            ${pendingPaymentsStats.totalPendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {pendingPaymentsStats.reservationsWithBalanceCount} reservaciones con saldo por cobrar
          </div>
        </div>

        {/* Habitaciones por Limpiar / Mantenimiento */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mantenimiento / Limpieza</span>
            <Wrench size={20} style={{ color: '#dc2626' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{roomsMaintenanceCount} Habitaciones</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>En mantenimiento o por reacondicionar</div>
        </div>

      </div>

      {/* ── Sección Intermedia: Gráfica de Tendencia a 7 Días + Widget de Actividades ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Visualización de Tendencias (Gráfica de Ocupación a 7 Días) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} style={{ color: 'var(--primary)' }} /> Proyección de Ocupación (7 Días)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Porcentaje de reservaciones estimadas para la semana</span>
              </div>
            </div>

            {/* Gráfica de Barras Interactiva */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', paddingTop: '1.5rem', paddingBottom: '0.5rem', gap: '0.5rem' }}>
              {next7DaysProjection.map((day) => (
                <div key={day.isoStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                    {day.percentage}%
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${Math.max(day.percentage, 8)}%`,
                      background: day.percentage > 70 ? 'linear-gradient(to top, var(--primary), var(--secondary))' : 'linear-gradient(to top, var(--secondary), #d97706)',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.4s ease, transform 0.2s ease',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    title={`${day.dayName}: ${day.occupied} de ${totalRoomsCount} habitaciones (${day.percentage}%)`}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {day.dayName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Capacidad total: <strong>{totalRoomsCount} habs</strong></span>
            <span>Promedio 7 días: <strong>{Math.round(next7DaysProjection.reduce((acc, d) => acc + d.percentage, 0) / 7)}%</strong></span>
          </div>
        </div>

        {/* Conexión con Módulo de Actividades (Actividades del Día) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={18} style={{ color: 'var(--secondary)' }} /> Actividades y Eventos Locales
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tours, eventos y recomendaciones disponibles hoy</span>
              </div>
              <Link to="/admin/itinerary" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                Gestionar <ArrowRight size={14} />
              </Link>
            </div>

            {activities.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No hay actividades ni eventos locales registrados aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activities.slice(0, 3).map((act) => (
                  <div
                    key={act.id || act.nombre}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{act.nombre || act.titulo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.categoria || act.ubicacion || 'Recomendación turística'}</div>
                      </div>
                    </div>
                    <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(193,92,61,0.1)', color: 'var(--primary)', border: '1px solid rgba(193,92,61,0.2)' }}>
                      {act.tipo || 'Actividad'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total registradas: <strong>{activities.length} actividades</strong>
            </span>
          </div>
        </div>

      </div>

      {/* ── Reservaciones Recientes (Tabla Enriquecida) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reservaciones Recientes</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando {recentReservations.length} de {reservations.length} reservaciones registradas
          </span>
        </div>
        
        {recentReservations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--border-radius-md)' }}>
            No se encontraron reservaciones registradas aún.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID / Folio</th>
                  <th>Huésped</th>
                  <th>Habitación</th>
                  <th>Fechas</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Saldo Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((res) => {
                  const checkInFormatted = getISOStringDate(res.fecha_entrada || res.checkIn);
                  const checkOutFormatted = getISOStringDate(res.fecha_salida || res.checkOut);
                  const { totalPagar, saldo } = getReservationPaymentInfo(res);
                  
                  const isConfirmed = res.estado === 'confirmada' || res.estado === 'confirmed';
                  const isPending = res.estado === 'pendiente' || res.estado === 'pending';
                  const isCanceled = res.estado === 'cancelada' || res.estado === 'canceled';
                  const frequentGuest = isFrequentGuest(res);

                  return (
                    <tr key={res.id || res.folio}>
                      <td data-label="Folio" style={{ fontFamily: 'var(--mono)', fontWeight: 'bold' }}>
                        <div style={{ textAlign: 'right' }}>{getFolio(res)}</div>
                      </td>
                      <td data-label="Huésped">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>{getGuestName(res)}</span>
                          {frequentGuest && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                              fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                              backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 600
                            }}>
                              <Sparkles size={10} /> Cliente Frecuente
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Habitación">
                        <div style={{ textAlign: 'right' }}>{getRoomName(res)}</div>
                      </td>
                      <td data-label="Fechas" style={{ fontSize: '0.85rem' }}>
                        <div style={{ textAlign: 'right' }}>{checkInFormatted} al {checkOutFormatted}</div>
                      </td>
                      <td data-label="Estado">
                        <div style={{ textAlign: 'right' }}>
                          {isConfirmed && (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle size={10} /> Confirmada
                            </span>
                          )}
                          {isPending && (
                            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={10} /> Pendiente
                            </span>
                          )}
                          {isCanceled && (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <AlertTriangle size={10} /> Cancelada
                            </span>
                          )}
                          {!isConfirmed && !isPending && !isCanceled && (
                            <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--border)' }}>
                              {res.estado || 'N/A'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Total" style={{ fontWeight: 600 }}>
                        <div style={{ textAlign: 'right' }}>${totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</div>
                      </td>
                      <td data-label="Saldo" style={{ fontWeight: 600 }}>
                        <div style={{ textAlign: 'right' }}>
                          {saldo > 0 ? (
                            <span style={{ color: '#b45309' }}>
                              ${saldo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                            </span>
                          ) : (
                            <span style={{ color: 'green', fontSize: '0.85rem' }}>
                              $0.00 MXN (Pagado)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


