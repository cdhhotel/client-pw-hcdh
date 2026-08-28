import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Bed, TrendingUp, Users, CheckCircle, Clock, AlertTriangle,
  RefreshCw, Loader2, LogOut, DollarSign, Sparkles, MapPin, Compass,
  BarChart3, Wrench, ArrowRight, ChevronLeft, ChevronRight, Star, ExternalLink, Award,
  Key, MessageSquare, CheckCircle2, Tag, Download, FileText
} from 'lucide-react';
import { reservationsService } from '../services/reservations.service';
import { itineraryService } from '../../hotel-admin/services/itineraryService';
import { api } from '../../../services/api';
import { exportReservationsToExcel } from '../../../utils/exportExcel';
import { generatePdfAnalyticsReport } from '../../../utils/exportPdfReport';

export const Dashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estadísticas reales obtenidas de Airbnb (Habitación ID 1245181293769210016)
  const [airbnbData, setAirbnbData] = useState({
    rating: 4.77,
    maxRating: 5.0,
    totalReviews: 13,
    listingTitle: 'Casa Dolores Hidalgo, hab 9',
    listingUrl: 'https://www.airbnb.mx/rooms/1245181293769210016?check_in=2026-09-08&check_out=2026-09-09',
    categoryRatings: [
      { label: 'Limpieza', score: 4.5 },
      { label: 'Veracidad', score: 4.6 },
      { label: 'Llegada', score: 4.8 },
      { label: 'Comunicación', score: 4.8 },
      { label: 'Ubicación', score: 5.0 },
      { label: 'Calidad-precio', score: 4.8 },
    ],
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resResult, roomsResult, eventosResult, airbnbResult] = await Promise.allSettled([
        reservationsService.getAll(),
        api.get('/room/rooms'),
        itineraryService.getEventos(),
        api.get('/hotel/airbnb-rating'),
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

      let evList = [];
      if (eventosResult.status === 'fulfilled') {
        const rawEventos = eventosResult.value;
        evList = Array.isArray(rawEventos?.data) ? rawEventos.data : (Array.isArray(rawEventos) ? rawEventos : []);
      }

      if (airbnbResult.status === 'fulfilled' && airbnbResult.value?.data) {
        const resData = airbnbResult.value.data;
        if (resData.data) {
          setAirbnbData(resData.data);
        } else if (resData.rating) {
          setAirbnbData(resData);
        }
      }

      setReservations(resList);
      setRooms(roomsList);
      setEvents(evList);
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

  // Obtener los 3 eventos actuales o más próximos según la fecha
  const upcomingEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parseDate = (d) => {
      if (!d) return null;
      const dateObj = new Date(d);
      return isNaN(dateObj.getTime()) ? null : dateObj;
    };

    const processed = events.map(ev => {
      const start = parseDate(ev.fecha_inicio);
      const end = parseDate(ev.fecha_fin) || start;

      let category = 3; // 1 = Actual (en curso), 2 = Próximo, 3 = Sin fecha o pasado
      let diffDays = 999999;

      if (start) {
        if (end && today >= start && today <= end) {
          category = 1; // En curso hoy
          diffDays = 0;
        } else if (start >= today) {
          category = 2; // Próximo
          diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          category = 3; // Pasado
          diffDays = Math.abs(Math.ceil((today.getTime() - (end || start).getTime()) / (1000 * 60 * 60 * 24)));
        }
      }

      return { ...ev, category, diffDays };
    });

    processed.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category - b.category;
      }
      return a.diffDays - b.diffDays;
    });

    return processed.slice(0, 3);
  }, [events]);

  const formatEventDate = (ev) => {
    if (ev.fecha_inicio) {
      const fInit = new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' });
      if (ev.fecha_fin) {
        const fEnd = new Date(ev.fecha_fin).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' });
        return `${fInit} - ${fEnd}`;
      }
      return fInit;
    }
    return ev.mes_referencia || 'Fecha por confirmar';
  };

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

  // 7. Habitaciones en Limpieza y Mantenimiento (separadas)
  const roomsCleaningCount = useMemo(() => {
    return rooms.filter(
      (room) => room.estatus === 'limpieza' || room.estatus === 'sucia'
    ).length;
  }, [rooms]);

  const roomsMaintenanceCount = useMemo(() => {
    return rooms.filter(
      (room) => room.estatus === 'mantenimiento'
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

  // 8. Proyección de Ocupación (Navegación por Semanas)
  const [weekOffset, setWeekOffset] = useState(0);

  const next7DaysProjection = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    startDate.setDate(startDate.getDate() + weekOffset * 7);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const isoStr = d.toISOString().slice(0, 10);

      let dayName = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      if (weekOffset === 0) {
        if (i === 0) dayName = 'Hoy';
        else if (i === 1) dayName = 'Mañana';
      }

      const occupied = reservations.filter((r) => {
        if (r.estado === 'cancelada') return false;
        const inDate = getISOStringDate(r.fecha_entrada || r.checkIn);
        const outDate = getISOStringDate(r.fecha_salida || r.checkOut);
        return inDate <= isoStr && outDate > isoStr;
      }).length;

      const percentage = totalRoomsCount > 0 ? Math.min(100, Math.round((occupied / totalRoomsCount) * 100)) : 0;

      days.push({
        isoStr,
        dayName,
        occupied,
        percentage,
        dateObj: d,
      });
    }

    return days;
  }, [reservations, totalRoomsCount, weekOffset]);

  const weekDateRangeLabel = useMemo(() => {
    if (next7DaysProjection.length === 0) return '';
    const first = next7DaysProjection[0].dateObj;
    const last = next7DaysProjection[6].dateObj;
    const fStr = first.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const lStr = last.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fStr} - ${lStr}`;
  }, [next7DaysProjection]);

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

  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');

  const filteredDashboardReservations = useMemo(() => {
    if (reservationStatusFilter === 'all') return reservations;
    return reservations.filter(res => {
      const st = (res.estado || '').toLowerCase();
      if (reservationStatusFilter === 'confirmada') return st === 'confirmada' || st === 'confirmed' || st === 'aprobada';
      if (reservationStatusFilter === 'pendiente') return st === 'pendiente' || st === 'pending';
      if (reservationStatusFilter === 'cancelada') return st === 'cancelada' || st === 'canceled';
      if (reservationStatusFilter === 'finalizada') return st === 'finalizada' || st === 'completed' || st === 'completada';
      if (reservationStatusFilter === 'activa') return st === 'activa' || st === 'active';
      return st === reservationStatusFilter;
    });
  }, [reservations, reservationStatusFilter]);

  const recentReservations = useMemo(() => {
    return filteredDashboardReservations.slice(0, 10);
  }, [filteredDashboardReservations]);

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
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem', fontWeight: 700, color: '#6C220E' }}>Estadísticas Generales</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>Resumen operativo, ocupación en tiempo real y flujo financiero del hotel.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
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
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ocupación</span>
            <Bed size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{occupancyPercentage}%</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {occupiedRoomsCount} de {totalRoomsCount} habitaciones ocupadas
          </div>
        </div>

        {/* Llegadas Hoy (Check-ins) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Llegadas Hoy</span>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{arrivalsTodayCount} Check-ins</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Programados para hoy</div>
        </div>

        {/* Reservas Activas */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reservas Activas</span>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{activeReservations.length}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {confirmedCount} confirmadas, {pendingCount} pendientes
          </div>
        </div>

        {/* Calificación Airbnb */}
        {/* <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderTop: '3px solid #FF385C' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Airbnb Rating</span>
            <Star size={20} style={{ color: '#FF385C', fill: '#FF385C' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {airbnbData.rating.toFixed(2)} <span style={{ fontSize: '1.1rem', color: '#FF385C' }}>★</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {airbnbData.totalReviews} evaluaciones en Airbnb
          </div>
        </div> */}

        {/* Ingresos del Mes */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ingresos Mes</span>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#9a3412' }}>
            ${monthRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Acumulado del mes (MXN)</div>
        </div>

      </div>

      {/* Indicadores Operativos*/}
      <div className="grid grid-4" style={{ marginBottom: '2.5rem' }}>

        {/* Check-outs */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salidas Hoy</span>
            <LogOut size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{departuresTodayCount} Check-outs</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Habitaciones a desocupar hoy</div>
        </div>

        {/* Pagos Pendientes */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid #5f4633' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pagos Pendientes</span>
            <DollarSign size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.25rem' }}>
            ${pendingPaymentsStats.totalPendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {pendingPaymentsStats.reservationsWithBalanceCount} reservaciones con saldo por cobrar
          </div>
        </div>

        {/* Limpieza */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid #69503c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Limpieza</span>
            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.25rem' }}>{roomsCleaningCount} Hab.</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pendientes de aseo / reacondicionamiento</div>
        </div>

        {/* Habitaciones en Mantenimiento */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid #735945' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>En Mantenimiento</span>
            <Wrench size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9a3412', marginBottom: '0.25rem' }}>{roomsMaintenanceCount} Hab.</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fuera de servicio por reparaciones</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>

        {/* Visualización de Tendencias (Gráfica de Ocupación a 7 Días) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} style={{ color: 'var(--primary)' }} /> Pronóstico de ocupación
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {weekOffset === 0 ? '' : weekOffset > 0 ? `${weekOffset}` : `${weekOffset}`} ({weekDateRangeLabel})
                </span>
              </div>

              {/* Navegación por Semanas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  title="Semana anterior"
                  style={{
                    padding: '0.3rem 0.55rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {weekOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    title="Volver a la semana actual"
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid var(--primary)',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'rgba(160, 68, 42, 0.08)',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Hoy
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  title="Semana siguiente"
                  style={{
                    padding: '0.3rem 0.55rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
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

        {/* Eventos Locales (3 actuales o más próximos según la fecha) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: 'var(--secondary)' }} />Próximos Eventos Locales
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Eventos actuales y más próximos a la fecha</span>
              </div>
              <Link to="/admin/itinerary" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                Gestionar <ArrowRight size={14} />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No hay eventos locales registrados aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingEvents.map((act) => (
                  <div
                    key={act.id || act.nombre}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(160,68,42,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{act.nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatEventDate(act)}
                          {act.sitio_cercano?.nombre ? ` • ${act.sitio_cercano.nombre}` : ''}
                        </div>
                      </div>
                    </div>
                    {act.category === 1 ? (
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(122,128,97,0.15)', color: 'var(--accent)', border: '1px solid rgba(122,128,97,0.3)' }}>
                        En curso
                      </span>
                    ) : act.category === 2 ? (
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(193,92,61,0.1)', color: 'var(--primary)', border: '1px solid rgba(193,92,61,0.2)' }}>
                        En {act.diffDays} {act.diffDays === 1 ? 'día' : 'días'}
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {act.mes_referencia || 'Evento'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total registrados: <strong>{events.length} eventos</strong>
            </span>
          </div>
        </div>

      </div>

      {/* ── Sección de Reputación Airbnb (Ancho Completo entre Actividades y Reservaciones) ── */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2.5rem', borderTop: '4px solid #FF385C' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111' }}>
              <Star size={20} style={{ color: '#FF385C', fill: '#FF385C' }} /> Reputación Airbnb
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Evaluaciones de huéspedes en el anuncio oficial</span>
          </div>
          <span className="badge" style={{ backgroundColor: 'rgba(255, 56, 92, 0.1)', color: '#FF385C', border: '1px solid rgba(255, 56, 92, 0.3)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
            <Award size={14} /> Excelente
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          {/* Tarjeta de Puntuación destacada */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '1.25rem 1.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center', paddingRight: '1.25rem', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>
                {airbnbData.rating.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: '2px', color: '#FF385C', marginTop: '0.35rem', justifyContent: 'center' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} style={{ fill: '#FF385C' }} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                {airbnbData.listingTitle}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#FF385C', fontWeight: 600 }}>
                {airbnbData.totalReviews} evaluaciones verificadas
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Anuncio oficial en Airbnb.mx
              </div>
            </div>
          </div>

          {/* Desglose de las 6 Categorías */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {(airbnbData.categoryRatings || []).map((cat) => {
              const getIcon = (lbl) => {
                const l = (lbl || '').toLowerCase();
                if (l.includes('limpieza')) return <Sparkles size={15} style={{ color: '#FF385C' }} />;
                if (l.includes('veracidad')) return <CheckCircle2 size={15} style={{ color: '#FF385C' }} />;
                if (l.includes('llegada')) return <Key size={15} style={{ color: '#FF385C' }} />;
                if (l.includes('comunicación') || l.includes('comunicacion')) return <MessageSquare size={15} style={{ color: '#FF385C' }} />;
                if (l.includes('ubicación') || l.includes('ubicacion')) return <MapPin size={15} style={{ color: '#FF385C' }} />;
                if (l.includes('calidad') || l.includes('precio')) return <Tag size={15} style={{ color: '#FF385C' }} />;
                return <Star size={15} style={{ color: '#FF385C' }} />;
              };

              return (
                <div key={cat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', backgroundColor: 'rgba(255,255,255,0.7)', padding: '0.65rem 0.85rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getIcon(cat.label)}
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <div style={{ width: '55px', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(cat.score / 5) * 100}%`, height: '100%', backgroundColor: '#FF385C', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'right', color: '#111' }}>{cat.score.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón Enlace */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', textAlign: 'right' }}>
          <a
            href={airbnbData.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              gap: '0.5rem',
              backgroundColor: '#FF385C',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.85rem',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--border-radius-sm)',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(255, 56, 92, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <ExternalLink size={15} /> Ver Anuncio Oficial en Airbnb
          </a>
        </div>
      </div>

      {/* ── Reservaciones Recientes (Tabla Enriquecida con Pestañas por Estado) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reservaciones Recientes</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando {recentReservations.length} de {filteredDashboardReservations.length} reservaciones
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => generatePdfAnalyticsReport(filteredDashboardReservations)}
              className="btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
              title="Generar e imprimir Reporte Ejecutivo en PDF"
            >
              <FileText size={15} />
              Reporte PDF
            </button>
            <button
              type="button"
              onClick={() => exportReservationsToExcel(filteredDashboardReservations)}
              className="btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
              title="Descargar reporte en Excel (.csv)"
            >
              <Download size={15} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Pestañas de Filtro por Estado de Reservación (Scrollable) */}
        <div style={{ width: '100%', overflowX: 'auto', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 'max-content', paddingBottom: 0, scrollbarWidth: 'thin' }}>
            {[
              { id: 'all', label: 'Todas', count: reservations.length },
              { id: 'confirmada', label: 'Confirmadas', count: reservations.filter(r => ['confirmada', 'confirmed', 'aprobada'].includes((r.estado || '').toLowerCase())).length },
              { id: 'pendiente', label: 'Pendientes', count: reservations.filter(r => ['pendiente', 'pending'].includes((r.estado || '').toLowerCase())).length },
              { id: 'activa', label: 'Activas', count: reservations.filter(r => ['activa', 'active'].includes((r.estado || '').toLowerCase())).length },
              { id: 'finalizada', label: 'Finalizadas', count: reservations.filter(r => ['finalizada', 'completed', 'completada'].includes((r.estado || '').toLowerCase())).length },
              { id: 'cancelada', label: 'Canceladas', count: reservations.filter(r => ['cancelada', 'canceled'].includes((r.estado || '').toLowerCase())).length },
            ].map(tab => {
              const isActive = reservationStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReservationStatusFilter(tab.id)}
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

        {recentReservations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--border-radius-md)' }}>
            No se encontraron reservaciones registradas con el estado seleccionado.
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


