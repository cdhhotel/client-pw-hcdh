import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Briefcase, Mail, Phone, User, CheckCircle2, AlertCircle, Loader2, Download, MessageCircle, Plus, Trash2, FileText, X, ShieldAlert, Info } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../app/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { toPng } from 'html-to-image';

export const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=300&q=80';

  const getRoomImage = (room) => {
    const imagenes = room?.atributos_extra?.imagenes;
    if (Array.isArray(imagenes) && imagenes.length > 0) return imagenes[0];
    return FALLBACK_IMAGE;
  };

  const presetRoom = searchParams.get('room');
  const presetCheckIn = searchParams.get('checkIn') || '';
  const presetCheckOut = searchParams.get('checkOut') || '';
  const presetGuests = parseInt(searchParams.get('guests')) || 1;

  // Estados de carga y catálogos
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [hotelPhone, setHotelPhone] = useState('524182396176'); // Teléfono por defecto

  // Lista de habitaciones seleccionadas [{ roomId, guests }]
  const [selectedRooms, setSelectedRooms] = useState([
    { roomId: presetRoom || '', guests: presetGuests }
  ]);

  // Estados del Formulario
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    checkIn: presetCheckIn,
    checkOut: presetCheckOut,
    guests: presetGuests,
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    specialRequests: '',
  });

  const [nights, setNights] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const receiptRef = useRef(null);

  // Actualizar formData si cambian los parámetros URL
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      checkIn: presetCheckIn || prev.checkIn,
      checkOut: presetCheckOut || prev.checkOut,
      guests: presetGuests || prev.guests,
    }));
  }, [presetCheckIn, presetCheckOut, presetGuests]);

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;

    const toastId = toast.loading('Generando imagen del recibo...');
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)' },
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `recibo-${bookingResult?.code || 'reserva'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('¡Recibo descargado correctamente!', { id: toastId });
    } catch (error) {
      console.error('Error al generar la imagen del recibo:', error);
      toast.error('No se pudo descargar el recibo. Intenta de nuevo.', { id: toastId });
    }
  };

  // 1. Cargar habitaciones disponibles desde el servidor (filtrando ocupadas por fecha)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        let endpoint = '/room/rooms';
        if (formData.checkIn && formData.checkOut) {
          endpoint += `?checkIn=${formData.checkIn}&checkOut=${formData.checkOut}`;
        }
        const response = await api.get(endpoint);
        const data = response?.data ?? response;
        const disponibles = Array.isArray(data)
          ? data.filter((r) => r.estatus === 'disponible')
          : [];
        setRooms(disponibles);

        if (disponibles.length > 0) {
          // Asegurar que las habitaciones seleccionadas existan en las disponibles
          setSelectedRooms((prev) => {
            const updated = prev.map((sel) => {
              const stillExists = disponibles.some((r) => String(r.id) === String(sel.roomId));
              return stillExists ? sel : { ...sel, roomId: disponibles[0].id };
            });
            // Remover posibles duplicados automáticos
            const seen = new Set();
            return updated.map((sel, idx) => {
              if (seen.has(sel.roomId)) {
                const nextAvail = disponibles.find((r) => !seen.has(r.id)) || disponibles[0];
                seen.add(nextAvail.id);
                return { ...sel, roomId: nextAvail.id };
              }
              seen.add(sel.roomId);
              return sel;
            });
          });
        } else {
          toast.error('No hay habitaciones disponibles en las fechas seleccionadas.');
        }
      } catch (err) {
        console.error('Error al cargar habitaciones del backend:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [formData.checkIn, formData.checkOut, presetRoom, presetGuests]);

  // Cargar información oficial del hotel (teléfono para WhatsApp y política de cancelación)
  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        const response = await api.get('/hotel/hotels');
        const hotels = response?.data?.data ?? response?.data ?? [];
        if (hotels.length > 0) {
          const firstHotel = hotels[0];
          if (firstHotel.politica_cancelacion) {
            setCancellationPolicy(firstHotel.politica_cancelacion);
          }
          const rawPhone = firstHotel.telefono?.replace(/\D/g, '');
          if (rawPhone) {
            const formattedPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
            setHotelPhone(formattedPhone);
          }
        }
      } catch (err) {
        console.error('Error al cargar información del hotel:', err);
      }
    };
    fetchHotelInfo();
  }, []);

  // 2. Rellenar automáticamente los datos del usuario si ha iniciado sesión
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nombre: prev.nombre || user.nombre || user.name?.split(' ')[0] || '',
        apellidos: prev.apellidos || user.apellidos || user.name?.split(' ').slice(1).join(' ') || '',
        email: prev.email || user.email || '',
        telefono: prev.telefono || user.telefono || user.phone || '',
      }));
    }
  }, [user]);

  // 3. Cálculos de huéspedes asignados y precios
  const totalAssignedGuests = selectedRooms.reduce((sum, item) => sum + (Number(item.guests) || 0), 0);

  const totalBasePricePerNight = selectedRooms.reduce((sum, item) => {
    const roomObj = rooms.find((r) => String(r.id) === String(item.roomId));
    return sum + (Number(roomObj?.precio_base_noche) || 0);
  }, 0);

  const subtotal = nights * totalBasePricePerNight;
  const totalPrice = subtotal;

  // Calcular noches
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const difference = end.getTime() - start.getTime();
      const calculatedNights = Math.ceil(difference / (1000 * 3600 * 24));

      if (calculatedNights > 0) {
        setNights(calculatedNights);
      } else {
        setNights(0);
      }
    } else {
      setNights(0);
    }
  }, [formData.checkIn, formData.checkOut]);

  // Funciones para manejar selección múltiple de habitaciones
  const handleAddRoomSelection = () => {
    if (rooms.length === 0) return;
    const notPicked = rooms.find((r) => !selectedRooms.some((sr) => String(sr.roomId) === String(r.id)));
    if (!notPicked) {
      toast.error('Ya has seleccionado todas las habitaciones disponibles.');
      return;
    }
    const remainingGuests = Math.max(1, Number(formData.guests) - totalAssignedGuests);
    const assignedForNew = Math.min(remainingGuests, Number(notPicked.capacidad_maxima) || 2);
    setSelectedRooms((prev) => [...prev, { roomId: notPicked.id, guests: assignedForNew }]);
  };

  const handleRemoveRoomSelection = (index) => {
    if (selectedRooms.length <= 1) return;
    setSelectedRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index, field, value) => {
    setSelectedRooms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (nights <= 0) {
        toast.error('La fecha de salida debe ser posterior a la fecha de llegada.');
        return;
      }
      if (rooms.length === 0) {
        toast.error('No hay habitaciones disponibles en las fechas seleccionadas.');
        return;
      }
      if (totalAssignedGuests !== Number(formData.guests)) {
        toast.error(`La suma de huéspedes asignados a las habitaciones (${totalAssignedGuests}) debe ser igual al total seleccionado (${formData.guests}).`);
        return;
      }
      // Verificar duplicados de habitación
      const roomIds = selectedRooms.map(s => s.roomId);
      if (new Set(roomIds).size !== roomIds.length) {
        toast.error('No puedes seleccionar la misma habitación más de una vez. Elige habitaciones distintas.');
        return;
      }
      for (let i = 0; i < selectedRooms.length; i++) {
        const sel = selectedRooms[i];
        const rObj = rooms.find((r) => String(r.id) === String(sel.roomId));
        if (rObj && Number(sel.guests) > Number(rObj.capacidad_maxima)) {
          toast.error(`La Habitación #${i + 1} (${rObj.nombre}) solo admite un máximo de ${rObj.capacidad_maxima} huéspedes.`);
          return;
        }
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const responses = [];
    const createdFolios = [];
    let accumulatedTotal = 0;

    try {
      // Registrar reservaciones de forma secuencial
      for (let i = 0; i < selectedRooms.length; i++) {
        const roomSel = selectedRooms[i];
        const payload = {
          habitacion_id: roomSel.roomId,
          usuario_id: user?.id || null,
          fecha_entrada: formData.checkIn,
          fecha_salida: formData.checkOut,
          cantidad_huespedes: parseInt(roomSel.guests),
          comentarios: formData.specialRequests || null,
          huesped_principal: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: formData.email || null,
            telefono: formData.telefono,
          }
        };

        const res = await api.post('/reservations', payload);
        responses.push(res);
        createdFolios.push(res.data?.folio || res.folio);
        accumulatedTotal += Number(res.data?.total_pagar || 0);
      }

      const foliosStr = createdFolios.join(', ');
      const totalFinal = accumulatedTotal || totalPrice;

      setBookingResult({
        success: true,
        message: selectedRooms.length > 1
          ? `¡Tus ${selectedRooms.length} reservaciones han sido registradas exitosamente!`
          : (responses[0]?.message || '¡Tu reservación ha sido registrada exitosamente!'),
        code: foliosStr,
        data: responses[0]?.data,
        totalFinal
      });
      setStep(4);

      // Fin de registro de reserva
    } catch (err) {
      console.error('Error al registrar reservación en el servidor:', err);
      toast.error(err.message || 'Hubo un error al registrar tu reservación. Por favor, verifica la disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRooms) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
        <Loader2 size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Cargando disponibilidad de habitaciones…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div><Toaster /></div>
      <div className="container py-section animate-fade-in" style={{ maxWidth: '1000px' }}>
        <h1 className="section-title">Reserva tu Estancia</h1>
        <p className="section-subtitle">Completa el formulario en unos pasos sencillos</p>

        {/* Botón Políticas de Cancelación */}
        {/* <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setShowCancellationModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary)',
              backgroundColor: 'rgba(160, 68, 42, 0.08)',
              border: '1px solid var(--primary)',
              borderRadius: '20px',
              padding: '0.45rem 1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <FileText size={15} /> Ver Políticas de Cancelación
          </button>
        </div> */}

        {/* Indicador de Pasos */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 1 ? 1 : 0.4 }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>1</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Fechas & Habitaciones</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 2 ? 1 : 0.4 }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>2</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tus Datos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 3 ? 1 : 0.4 }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>3</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Confirmación</span>
            </div>
          </div>
        )}

        {/* Contenedor Principal */}
        {step < 4 ? (
          <div className="grid grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>

            {/* Columna Izquierda: Formulario */}
            <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', borderRadius: 'var(--border-radius-md)' }}>

              {/* Paso 1: Fechas y Habitaciones */}
              {step === 1 && (
                <form onSubmit={handleNextStep}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Selecciona Fechas & Habitaciones</h2>

                  <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Fecha de Entrada</label>
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        className="form-control"
                        min={new Date().toISOString().split('T')[0]}
                        required />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Fecha de Salida</label>
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        className="form-control"
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        required />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Total de Huéspedes a Hospedar</label>
                    <select name="guests" value={formData.guests} onChange={handleChange} className="form-control">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Huésped' : 'Huéspedes'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Asignación de Habitaciones */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 600, color: 'var(--secondary)' }}>
                        Habitaciones Solicitadas ({selectedRooms.length})
                      </h3>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: totalAssignedGuests === Number(formData.guests) ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.15)',
                        color: totalAssignedGuests === Number(formData.guests) ? '#15803d' : '#854d0e',
                        border: `1px solid ${totalAssignedGuests === Number(formData.guests) ? '#bbf7d0' : '#fef08a'}`
                      }}>
                        Asignados: {totalAssignedGuests} de {formData.guests} huéspedes
                      </span>
                    </div>

                    {selectedRooms.map((roomSel, index) => {
                      const currentRoom = rooms.find((r) => String(r.id) === String(roomSel.roomId));
                      const roomMaxCap = currentRoom?.capacidad_maxima || 4;
                      const otherPickedRoomIds = selectedRooms.filter((_, i) => i !== index).map((sr) => String(sr.roomId));

                      return (
                        <div key={index} style={{
                          backgroundColor: 'var(--bg-linen)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '1rem 0.85rem',
                          marginBottom: '1rem',
                          boxSizing: 'border-box',
                          minWidth: 0,
                          width: '100%',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'var(--primary)' }}>
                              Habitación #{index + 1}
                            </span>
                            {selectedRooms.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRoomSelection(index)}
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={13} /> Quitar
                              </button>
                            )}
                          </div>

                          <div className="grid grid-2" style={{ gap: '1rem', minWidth: 0, width: '100%' }}>
                            <div className="form-group" style={{ margin: 0, minWidth: 0, width: '100%' }}>
                              <label style={{ fontSize: '0.78rem' }}>Suite / Habitación</label>
                              <select
                                value={roomSel.roomId}
                                onChange={(e) => handleRoomChange(index, 'roomId', e.target.value)}
                                className="form-control"
                                style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
                                required
                              >
                                {rooms.map((r) => {
                                  const isSelectedInOther = otherPickedRoomIds.includes(String(r.id));
                                  return (
                                    <option key={r.id} value={r.id} disabled={isSelectedInOther}>
                                      {r.nombre} (Cap: {r.capacidad_maxima} pers. — ${Number(r.precio_base_noche).toLocaleString('es-MX')} MXN){isSelectedInOther ? ' — (Ya elegida)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            <div className="form-group" style={{ margin: 0, minWidth: 0, width: '100%' }}>
                              <label style={{ fontSize: '0.78rem' }}>Huéspedes en esta Habitación</label>
                              <select
                                value={roomSel.guests}
                                onChange={(e) => handleRoomChange(index, 'guests', parseInt(e.target.value))}
                                className="form-control"
                                style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
                              >
                                {[...Array(roomMaxCap).keys()].map((n) => (
                                  <option key={n + 1} value={n + 1}>
                                    {n + 1} {n + 1 === 1 ? 'Huésped' : 'Huéspedes'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                      );
                    })}

                    <button
                      type="button"
                      onClick={handleAddRoomSelection}
                      className="btn btn-outline"
                      style={{ width: '100%', borderStyle: 'dashed', marginTop: '0.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Plus size={15} /> Añadir otra habitación
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.75rem' }}>
                    Continuar
                  </button>
                </form>
              )}

              {/* Paso 2: Datos del Huésped */}
              {step === 2 && (
                <form onSubmit={handleNextStep}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Información de Contacto</h2>

                  <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label><User size={12} style={{ marginRight: '4px' }} /> Nombre(s)</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Juan"
                        required />
                    </div>
                    <div className="form-group">
                      <label><User size={12} style={{ marginRight: '4px' }} /> Apellidos</label>
                      <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Pérez"
                        required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label><Mail size={12} style={{ marginRight: '4px' }} /> Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="juan.perez@ejemplo.com"
                      required />
                  </div>

                  <div className="form-group">
                    <label><Phone size={12} style={{ marginRight: '4px' }} /> Teléfono de Contacto</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="418 123 4567"
                      required />
                  </div>

                  <div className="form-group">
                    <label><Briefcase size={12} style={{ marginRight: '4px' }} /> Peticiones Especiales (Opcional)</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Notas o requerimientos especiales (ej. alergias, cuna para bebé...)"
                      rows="3"
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={handlePrevStep} className="btn btn-outline" style={{ flex: 1 }}>
                      Atrás
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                      Verificar Reserva
                    </button>
                  </div>
                </form>
              )}

              {/* Paso 3: Confirmación y Envío */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Confirmar Reservación</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Por favor, revisa detalladamente la información antes de finalizar.
                  </p>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', padding: '1.25rem', backgroundColor: 'var(--bg-linen)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div><strong>Titular:</strong> {formData.nombre} {formData.apellidos}</div>
                    <div><strong>Correo:</strong> {formData.email}</div>
                    <div><strong>Teléfono:</strong> {formData.telefono}</div>
                    <div><strong>Fechas:</strong> Del {formData.checkIn} al {formData.checkOut}</div>
                    <div><strong>Total Huéspedes:</strong> {formData.guests} personas ({selectedRooms.length} {selectedRooms.length === 1 ? 'habitación' : 'habitaciones'})</div>
                    <div>
                      <strong>Habitaciones:</strong>
                      <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0, fontSize: '0.9rem' }}>
                        {selectedRooms.map((sr, idx) => {
                          const rObj = rooms.find((r) => String(r.id) === String(sr.roomId));
                          return (
                            <li key={idx}>
                              {rObj?.nombre || 'Habitación'} — {sr.guests} huéspedes (${Number(rObj?.precio_base_noche).toLocaleString()} MXN/noche)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {formData.specialRequests && <div><strong>Notas:</strong> {formData.specialRequests}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={handlePrevStep} className="btn btn-outline" style={{ flex: 1 }} disabled={loading}>
                      Atrás
                    </button>
                    <button type="submit" className="btn btn-secondary" style={{ flex: 2 }} disabled={loading}>
                      {loading ? 'Procesando...' : 'Confirmar & Finalizar'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Columna Derecha: Detalle de Cotización */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                Resumen de Cotización
              </h3>

              {selectedRooms.map((sr, idx) => {
                const roomObj = rooms.find((r) => String(r.id) === String(sr.roomId));
                if (!roomObj) return null;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem' }}>
                    <img src={getRoomImage(roomObj)} alt={roomObj.nombre} style={{ width: '65px', height: '50px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>{roomObj.nombre}</h4>
                      <div style={{ color: 'var(--text-muted)' }}>{sr.guests} {sr.guests === 1 ? 'persona' : 'personas'}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 600 }}>${Number(roomObj.precio_base_noche).toLocaleString()} MXN / noche</div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Noches de Estancia</span>
                  <span style={{ fontWeight: 'bold' }}>{nights} {nights === 1 ? 'Noche' : 'Noches'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Huéspedes</span>
                  <span>{formData.guests} {formData.guests === 1 ? 'Persona' : 'Personas'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span>Subtotal por noche</span>
                  <span>${totalBasePricePerNight.toLocaleString()} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  <span>Total Estimado</span>
                  <span>${totalPrice.toLocaleString()} MXN</span>
                </div>
                <div style={{ marginTop: '0.85rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowCancellationModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline',
                    }}
                  >
                    <Info size={14} /> Políticas de cancelación
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Paso 4: Pantalla de Éxito */
          <div className="glass-panel text-center animate-fade-in" style={{ padding: '3rem 2rem', borderRadius: 'var(--border-radius-md)', maxWidth: '600px', margin: '0 auto' }}>
            <CheckCircle2 size={64} style={{ color: 'var(--secondary)', marginBottom: '1.5rem', marginLeft: 'auto', marginRight: 'auto' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{bookingResult?.message}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Hemos registrado la reservación a nombre de <span style={{ fontWeight: 'bold' }}>{formData.email || formData.nombre}</span>. ¡Gracias por elegir Hotel Casa Dolores!
            </p>

            {/* Tarjeta del Recibo para Descargar */}
            <div
              ref={receiptRef}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #eee8e0',
                borderRadius: '8px',
                padding: '2.5rem 2rem',
                margin: '2rem auto',
                textAlign: 'left',
                maxWidth: '500px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                color: '#3d3730',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
              }}
            >
              {/* Encabezado del Recibo */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #eee8e0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#A0442A', margin: 0, fontSize: '1.5rem', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Hotel Casa Dolores
                </h3>
                <p style={{ color: '#8a7e72', margin: '4px 0 0 0', fontSize: '0.85rem', letterSpacing: '1px', fontStyle: 'italic' }}>
                  Hidalgo, Guanajuato
                </p>
              </div>

              {/* Folio y Estado */}
              <div style={{ backgroundColor: '#fdfaf7', borderLeft: '4px solid #B38A3A', padding: '1rem', borderRadius: '0 4px 4px 0', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#8a7e72', fontWeight: 700, letterSpacing: '1px' }}>Folio(s) de Reservación</span>
                <div style={{ fontSize: '1.3rem', color: '#A0442A', fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {bookingResult?.code || 'CDH-982341'}
                </div>
              </div>

              {/* Detalles */}
              <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid #eee8e0', paddingBottom: '6px', marginBottom: '1rem', color: '#3d3730', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Detalles de la Estancia
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Fecha de Entrada</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3d3730' }}>{formData.checkIn}</div>
                  <span style={{ fontSize: '0.75rem', color: '#8a7e72' }}>Check-in: 15:00 hrs</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Fecha de Salida</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3d3730' }}>{formData.checkOut}</div>
                  <span style={{ fontSize: '0.75rem', color: '#8a7e72' }}>Check-out: 12:00 hrs</span>
                </div>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #fdfaf7', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Habitaciones Reservadas</span>
                  {selectedRooms.map((sr, idx) => {
                    const rObj = rooms.find((r) => String(r.id) === String(sr.roomId));
                    return (
                      <div key={idx} style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#3d3730', marginTop: '2px' }}>
                        • {rObj?.nombre || 'Suite'} ({sr.guests} huéspedes)
                      </div>
                    );
                  })}
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Total Huéspedes</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3d3730' }}>{formData.guests} personas</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Noches</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3d3730' }}>{nights} {nights === 1 ? 'noche' : 'noches'}</div>
                </div>
              </div>

              {formData.specialRequests && (
                <div style={{ borderTop: '1px dashed #eee8e0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Peticiones Especiales</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#5a524a', fontStyle: 'italic' }}>
                    "{formData.specialRequests}"
                  </p>
                </div>
              )}

              {/* Pago */}
              <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid #eee8e0', paddingBottom: '6px', marginBottom: '1rem', color: '#3d3730', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Resumen del Pago
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a524a' }}>Método de Pago</span>
                  <span style={{ fontWeight: 'bold' }}>Efectivo / Transferencia (al check-in)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a524a' }}>Estado del Pago</span>
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>Pendiente</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee8e0', paddingTop: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', color: '#A0442A' }}>
                  <span>Total Confirmado</span>
                  <span>${(bookingResult?.totalFinal || totalPrice).toLocaleString()} MXN</span>
                </div>
              </div>

              {/* Pie de Recibo */}
              <div style={{ textAlign: 'center', borderTop: '1px solid #eee8e0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#8a7e72', lineHeight: '1.5' }}>
                  Av. San Luis Potosí 22, Centro Histórico, Dolores Hidalgo, Gto.
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#b5a89b' }}>
                  &copy; {new Date().getFullYear()} Hotel Casa Dolores. Todos los derechos reservados.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button
                onClick={handleDownloadImage}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Download size={18} />
                Descargar Recibo en Imagen
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
                style={{ cursor: 'pointer' }}
              >
                Volver a la Página de Inicio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Políticas de Cancelación */}
      {showCancellationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setShowCancellationModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--border-radius-md)',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'fadeIn 0.25s ease-out',
              borderTop: '5px solid var(--primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-linen)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--secondary)', fontWeight: 700 }}>
                  Políticas de Cancelación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCancellationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div style={{ padding: '1.5rem', fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-main)', maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ marginTop: 0, color: 'var(--text-muted)' }}>
                En <strong>Hotel Casa Dolores Hidalgo</strong> deseamos brindarte claridad y tranquilidad en la gestión de tus reservaciones.
              </p>

              {cancellationPolicy ? (
                <div style={{ backgroundColor: 'rgba(160, 68, 42, 0.06)', borderLeft: '4px solid var(--primary)', padding: '1.25rem', borderRadius: '0 6px 6px 0', marginTop: '1rem', whiteSpace: 'pre-line' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.98rem', fontWeight: 700 }}>
                    Política Oficial de Cancelación
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.7' }}>
                    {cancellationPolicy}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {/* Card 1: Cancelación Gratuita */}
                  <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderLeft: '4px solid #16a34a', padding: '1rem', borderRadius: '0 6px 6px 0' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#15803d', fontSize: '0.95rem', fontWeight: 700 }}>
                      ✓ Cancelación Sin Costo (Hasta 48 hrs)
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>
                      Puedes cancelar tu reservación sin ningún tipo de penalización hasta 48 horas antes de la fecha de tu check-in (15:00 hrs).
                    </p>
                  </div>

                  {/* Card 2: Cancelación Tardía / No Show */}
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid #dc2626', padding: '1rem', borderRadius: '0 6px 6px 0' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#b91c1c', fontSize: '0.95rem', fontWeight: 700 }}>
                      ⚠ Cancelaciones Tardías o No-Show
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b' }}>
                      Las cancelaciones dentro de las 48 horas previas a la llegada o la inasistencia (No-Show) generarán un cargo equivalente al costo de la primera noche.
                    </p>
                  </div>

                  {/* Card 3: Modificaciones */}
                  <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', borderLeft: '4px solid #ca8a04', padding: '1rem', borderRadius: '0 6px 6px 0' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#a16207', fontSize: '0.95rem', fontWeight: 700 }}>
                      ✎ Modificación de Fechas
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#854d0e' }}>
                      Los cambios de fecha están sujetos a disponibilidad de habitaciones y posibles variaciones tarifarias según la temporada elegida.
                    </p>
                  </div>
                </div>
              )}

              {/* Información de Contacto */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>¿Dudas o requerimientos especiales?</strong><br />
                Contáctanos al correo <a href="mailto:casadoloreshidalgohotel@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>casadoloreshidalgohotel@gmail.com</a> o por WhatsApp/Teléfono al <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>418 177 5155</span>.
              </div>
            </div>

            {/* Footer del Modal */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right', backgroundColor: 'var(--bg-sand)' }}>
              <button
                type="button"
                onClick={() => setShowCancellationModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.75rem', fontSize: '0.88rem' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Booking;
