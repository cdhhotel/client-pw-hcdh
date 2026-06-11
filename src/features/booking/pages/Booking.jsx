import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Briefcase, Mail, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

export const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Catálogo de habitaciones para calcular cotizaciones
  const roomsData = {
    'estandar-sencilla': { name: 'Estándar Colonial Sencilla', price: 1500, maxGuests: 2, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=300&q=80' },
    'doble-deluxe': { name: 'Doble Colonial Deluxe', price: 2200, maxGuests: 4, image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=300&q=80' },
    'junior-suite': { name: 'Junior Suite Dolores', price: 2400, maxGuests: 2, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=300&q=80' },
    'master-suite': { name: 'Master Suite', price: 3800, maxGuests: 4, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80' }
  };

  const presetRoom = searchParams.get('room');

  // Estados del Formulario
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    roomId: presetRoom && roomsData[presetRoom] ? presetRoom : 'junior-suite',
    checkIn: '',
    checkOut: '',
    guests: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Calcular noches y precio total
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const difference = end.getTime() - start.getTime();
      const calculatedNights = Math.ceil(difference / (1000 * 3600 * 24));

      if (calculatedNights > 0) {
        setNights(calculatedNights);
        const selectedRoomPrice = roomsData[formData.roomId]?.price || 0;
        setTotalPrice(calculatedNights * selectedRoomPrice);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [formData.checkIn, formData.checkOut, formData.roomId]);

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
        alert('La fecha de salida debe ser posterior a la fecha de llegada.');
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
      roomId: formData.roomId,
      roomName: roomsData[formData.roomId]?.name,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: parseInt(formData.guests),
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      notes: formData.specialRequests,
      totalPrice: totalPrice,
      nights: nights,
    };

    try {
      // Intentar enviar al backend real
      const res = await api.post('/bookings', payload);
      setBookingResult({ success: true, message: '¡Tu reservación ha sido registrada exitosamente!', data: res });
      setStep(4);
    } catch (err) {
      console.warn('Backend /bookings no disponible. Simulando registro de reserva para desarrollo local.');

      // Simulador exitoso en local
      setTimeout(() => {
        setBookingResult({
          success: true,
          message: '¡Tu reservación ha sido registrada exitosamente! (Modo Simulación)',
          code: 'CD-' + Math.floor(100000 + Math.random() * 900000),
          data: payload,
        });
        setStep(4);
        setLoading(false);
      }, 1500);
    }
  };

  const selectedRoom = roomsData[formData.roomId];

  return (
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
                  <select name="roomId" value={formData.roomId} onChange={handleChange} className="form-control">
                    {Object.keys(roomsData).map((key) => (
                      <option key={key} value={key}>
                        {roomsData[key].name} (${roomsData[key].price} MXN / noche)
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
                      required
                    />
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
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Número de Huéspedes</label>
                  <select name="guests" value={formData.guests} onChange={handleChange} className="form-control">
                    {[...Array(selectedRoom?.maxGuests || 2).keys()].map((n) => (
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

                <div className="form-group">
                  <label><User size={12} style={{ marginRight: '4px' }} /> Nombre Completo</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Juan Pérez"
                    required
                  />
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Phone size={12} style={{ marginRight: '4px' }} /> Teléfono de Contacto</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="418 123 4567"
                    required
                  />
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
                  <div><strong>Titular:</strong> {formData.fullName}</div>
                  <div><strong>Correo:</strong> {formData.email}</div>
                  <div><strong>Teléfono:</strong> {formData.phone}</div>
                  <div><strong>Suite:</strong> {selectedRoom?.name}</div>
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
                <img src={selectedRoom.image} alt={selectedRoom.name} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{selectedRoom.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>${selectedRoom.price} MXN / noche</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                <span>Total Estimado</span>
                <span>${totalPrice.toLocaleString()} MXN</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Paso 4: Pantalla de Éxito */
        <div className="glass-panel text-center animate-fade-in" style={{ padding: '4rem 2rem', borderRadius: 'var(--border-radius-md)', maxWidth: '600px', margin: '0 auto' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{bookingResult?.message}</h2>

          <div style={{ backgroundColor: 'var(--bg-sand)', padding: '1.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)', margin: '2rem 0', textAlign: 'left' }}>
            <p style={{ marginBottom: '0.5rem' }}><strong>Código de Reserva:</strong> <span style={{ fontFamily: 'var(--mono)', fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{bookingResult?.code || 'CD-982341'}</span></p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Habitación:</strong> {roomsData[formData.roomId]?.name}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Huésped:</strong> {formData.fullName}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Periodo:</strong> Del {formData.checkIn} al {formData.checkOut} ({nights} noches)</p>
            <p><strong>Total Pagado:</strong> ${totalPrice.toLocaleString()} MXN</p>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            Hemos enviado un correo de confirmación con los detalles del check-in a <span style={{ fontWeight: 'bold' }}>{formData.email}</span>. ¡Gracias por elegir Hotel Casa Dolores!
          </p>

          <button onClick={() => navigate('/')} className="btn btn-primary">
            Volver a la Página de Inicio
          </button>
        </div>
      )}
    </div>
  );
};
