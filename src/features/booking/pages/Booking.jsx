import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Briefcase, Mail, Phone, User, CheckCircle2, AlertCircle, Loader2, Download, MessageCircle } from 'lucide-react';
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

  // Estados de carga y catálogos
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [hotelPhone, setHotelPhone] = useState('524182396176'); // Teléfono por defecto

  // Estados del Formulario
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    roomId: presetRoom || '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    specialRequests: '',
  });

  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const receiptRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;

    const toastId = toast.loading('Generando imagen del recibo...');
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
        },
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

  // 1. Cargar habitaciones disponibles desde el servidor
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await api.get('/room/rooms');
        const data = response?.data ?? response;
        const disponibles = Array.isArray(data)
          ? data.filter((r) => r.estatus === 'disponible')
          : [];
        setRooms(disponibles);

        if (disponibles.length > 0) {
          const hasPreset = disponibles.some(r => r.id === presetRoom);
          setFormData(prev => ({
            ...prev,
            roomId: hasPreset ? presetRoom : disponibles[0].id
          }));
        }
      } catch (err) {
        console.error('Error al cargar habitaciones del backend:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [presetRoom]);

  // Cargar teléfono oficial del hotel para el botón de WhatsApp
  useEffect(() => {
    const fetchHotelPhone = async () => {
      try {
        const response = await api.get('/hotel/hotels');
        const hotels = response?.data?.data ?? response?.data ?? [];
        if (hotels.length > 0) {
          const rawPhone = hotels[0].telefono?.replace(/\D/g, '');
          if (rawPhone) {
            // Si tiene 10 dígitos, asumimos código de México (52)
            const formattedPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
            setHotelPhone(formattedPhone);
          }
        }
      } catch (err) {
        console.error('Error al cargar teléfono del hotel para WhatsApp:', err);
      }
    };
    fetchHotelPhone();
  }, []);

  // 2. Rellenar automáticamente los datos del usuario si ha iniciado sesión
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: prev.nombre || user.nombre || user.name?.split(' ')[0] || '',
        apellidos: prev.apellidos || user.apellidos || user.name?.split(' ').slice(1).join(' ') || '',
        email: prev.email || user.email || '',
        telefono: prev.telefono || user.telefono || user.phone || '',
      }));
    }
  }, [user]);

  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  // 3. Calcular subtotal, IVA y total estimado de la cotización
  const pricePerNight = Number(selectedRoom?.precio_base_noche) || 0;
  const subtotal = nights * pricePerNight;
  const iva = subtotal * 0.16;

  // Calcular noches y precio total (totalPrice es subtotal + IVA)
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const difference = end.getTime() - start.getTime();
      const calculatedNights = Math.ceil(difference / (1000 * 3600 * 24));

      if (calculatedNights > 0) {
        setNights(calculatedNights);
        const calculatedSubtotal = calculatedNights * pricePerNight;
        const calculatedTotal = calculatedSubtotal * 1.16;
        setTotalPrice(calculatedTotal);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [formData.checkIn, formData.checkOut, formData.roomId, selectedRoom, pricePerNight]);

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
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      habitacion_id: formData.roomId,
      usuario_id: user?.id || null,
      fecha_entrada: formData.checkIn,
      fecha_salida: formData.checkOut,
      cantidad_huespedes: parseInt(formData.guests),
      comentarios: formData.specialRequests || null,
      huesped_principal: {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email || null,
        telefono: formData.telefono,
      }
    };

    try {
      // Envío de la reservación al backend real
      const res = await api.post('/reservations', payload);
      setBookingResult({
        success: true,
        message: res.message || '¡Tu reservación ha sido registrada exitosamente!',
        code: res.data?.folio,
        data: res.data
      });
      setStep(4);

      // Redirigir automáticamente a WhatsApp
      const totalNeto = (res.data?.total_pagar || totalPrice);
      const folio = res.data?.folio || 'Pendiente';

      const message = `*Nueva Reservación - Hotel Casa Dolores*\n\n` +
        `*Folio:* ${folio}\n` +
        `*Huésped:* ${formData.nombre} ${formData.apellidos}\n` +
        `*Correo:* ${formData.email || 'No proporcionado'}\n` +
        `*Teléfono:* ${formData.telefono}\n\n` +
        `*Detalles de la Estancia:*\n` +
        `- *Habitación:* ${selectedRoom?.nombre || 'Habitación'}\n` +
        `- *Fecha de Entrada:* ${formData.checkIn}\n` +
        `- *Fecha de Salida:* ${formData.checkOut}\n` +
        `- *Huéspedes:* ${formData.guests} ${formData.guests === 1 ? 'persona' : 'personas'}\n` +
        `- *Estancia:* ${nights} ${nights === 1 ? 'noche' : 'noches'}\n` +
        `- *Peticiones Especiales:* ${formData.specialRequests || 'Ninguna'}\n\n` +
        `*Total Estimado:* $${Number(totalNeto).toLocaleString('es-MX')} MXN\n` +
        `*Estado del Pago:* Pendiente (Transferencia bancaria)`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${hotelPhone}?text=${encodedMessage}`, '_blank');
    } catch (err) {
      console.error('Error al registrar reservación en el servidor:', err);
      toast.error('Hubo un error al registrar tu reservación. Por favor, verifica los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRooms) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
        <Loader2 size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Cargando información del hotel…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <><div><Toaster /></div>
      <div className="container py-section animate-fade-in" style={{ maxWidth: '1000px' }}>
        <h1 className="section-title">Reserva tu Estancia</h1>
        <p className="section-subtitle">Completa el formulario en unos pasos sencillos</p>

        {/* Indicador de Pasos */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 1 ? 1 : 0.4 }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>1</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Fechas & Suite</span>
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

        {/* Contenedor Principal (Formulario + Detalles de Cotización) */}
        {step < 4 ? (
          <div className="grid grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>

            {/* Columna Izquierda: Formulario */}
            <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', borderRadius: 'var(--border-radius-md)' }}>

              {/* Paso 1: Fechas y Suite */}
              {step === 1 && (
                <form onSubmit={handleNextStep}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Selecciona Fechas & Suite</h2>

                  <div className="form-group">
                    <label>Habitación / Suite</label>
                    <select name="roomId" value={formData.roomId} onChange={handleChange} className="form-control" required>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre} (${Number(r.precio_base_noche).toLocaleString()} MXN / noche)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-2" style={{ gap: '1rem', margin: '1rem 0' }}>
                    <div className="form-group">
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
                    <div className="form-group">
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

                  <div className="form-group">
                    <label>Número de Huéspedes</label>
                    <select name="guests" value={formData.guests} onChange={handleChange} className="form-control">
                      {[...Array(selectedRoom?.capacidad_maxima || 2).keys()].map((n) => (
                        <option key={n + 1} value={n + 1}>
                          {n + 1} {n + 1 === 1 ? 'Huésped' : 'Huéspedes'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
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
                    <div><strong>Suite:</strong> {selectedRoom?.nombre}</div>
                    <div><strong>Fechas:</strong> Del {formData.checkIn} al {formData.checkOut}</div>
                    <div><strong>Huéspedes:</strong> {formData.guests}</div>
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
                Resumen de la Cotización
              </h3>

              {selectedRoom && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <img src={getRoomImage(selectedRoom)} alt={selectedRoom.nombre} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{selectedRoom.nombre}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>${pricePerNight.toLocaleString()} MXN / noche</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Noches de Estancia</span>
                  <span style={{ fontWeight: 'bold' }}>{nights} {nights === 1 ? 'Noche' : 'Noches'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Huéspedes</span>
                  <span>{formData.guests} {formData.guests === 1 ? 'Persona' : 'Personas'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IVA (16%)</span>
                  <span>${iva.toLocaleString()} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  <span>Total Estimado</span>
                  <span>${totalPrice.toLocaleString()} MXN</span>
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
              Hemos enviado un correo de confirmación con los detalles del check-in a <span style={{ fontWeight: 'bold' }}>{formData.email}</span>. ¡Gracias por elegir Hotel Casa Dolores!
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

              {/* Folio y Estado de Reservación */}
              <div style={{ backgroundColor: '#fdfaf7', borderLeft: '4px solid #B38A3A', padding: '1rem', borderRadius: '0 4px 4px 0', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#8a7e72', fontWeight: 700, letterSpacing: '1px' }}>Folio de Reservación</span>
                <div style={{ fontSize: '1.5rem', color: '#A0442A', fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {bookingResult?.code || 'CDH-982341'}
                </div>
              </div>

              {/* Detalles de la Estancia */}
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
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Habitación</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3d3730' }}>{selectedRoom?.nombre}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8a7e72', textTransform: 'uppercase', fontWeight: 700 }}>Huéspedes</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3d3730' }}>{formData.guests} {formData.guests === 1 ? 'Persona' : 'Personas'}</div>
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

              {/* Información Financiera y de Pago */}
              <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid #eee8e0', paddingBottom: '6px', marginBottom: '1rem', color: '#3d3730', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                Resumen del Pago
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a524a' }}>Subtotal</span>
                  <span style={{ fontWeight: 'bold' }}>${subtotal.toLocaleString()} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a524a' }}>Impuestos (16% IVA)</span>
                  <span style={{ fontWeight: 'bold' }}>${iva.toLocaleString()} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a524a' }}>Método de Pago</span>
                  <span style={{ fontWeight: 'bold' }}>Efectivo (al check-in)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#5a524a' }}>Estado del Pago</span>
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>Pendiente</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee8e0', paddingTop: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', color: '#A0442A' }}>
                  <span>Total Confirmado</span>
                  <span>${(bookingResult?.data?.total_pagar || totalPrice).toLocaleString()} MXN</span>
                </div>
              </div>

              {/* Pie de Recibo */}
              <div style={{ textAlign: 'center', borderTop: '1px solid #eee8e0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#8a7e72', lineHeight: '1.5' }}>
                  Calle Principal #10, Centro Histórico, Dolores Hidalgo, Gto.
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
      </div></>
  );
};
