import { useState, useEffect, useCallback } from 'react';
import {
  Building2, MapPin, Phone, Mail, FileText, Globe,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import { hotelService } from '../services/hotel.service';
import { useAuth } from '../../../app/AuthContext';




// ─── Badge de estatus ────────────────────────────────────────────────────────────
const StatusBadge = ({ estatus }) => {
  const isActive = estatus === 'activo';
  return (
    <span
      className={isActive ? 'badge badge-success' : 'badge badge-danger'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
    >
      {isActive ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
};

// ─── Fila de solo lectura ────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, mono = false }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '1rem',
    padding: '1rem 0', borderBottom: '1px solid var(--border-color)'
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      backgroundColor: 'rgba(193,92,61,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color: 'var(--primary)'
    }}>
      <Icon size={16} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem'
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.95rem', lineHeight: '1.5',
        fontFamily: mono ? 'var(--mono)' : 'inherit',
        color: value ? 'var(--text-main)' : 'var(--text-muted)',
        fontStyle: value ? 'normal' : 'italic'
      }}>
        {value || 'Sin información'}
      </p>
    </div>
  </div>
);

// ─── Campo de formulario ─────────────────────────────────────────────────────────
const FormField = ({ label, name, value, onChange, type = 'text', rows, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{
      fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '1px', color: 'var(--text-muted)'
    }}>
      {label}{required && <span style={{ color: 'var(--primary)', marginLeft: 2 }}>*</span>}
    </label>
    {rows ? (
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="form-control"
        style={{ resize: 'vertical', minHeight: `${rows * 2.6}rem` }}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className="form-control"
        required={required}
      />
    )}
  </div>
);

// ─── Componente principal ────────────────────────────────────────────────────────
export const Hotels = () => {
  const { user } = useAuth();
  const hotelId = user?.hotel_id || "6547a35d-d6d8-4b4a-80f7-aed8c8885811";

  const [hotel, setHotel] = useState(null);
  const [form, setForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


  // ── Carga de datos ────────────────────────────────────────────────────────────
  const fetchHotel = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await hotelService.getById(hotelId);
      const data = res.data ?? res;
      setHotel(data);
      setForm(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la información del hotel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHotel(); }, [fetchHotel]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleEstatus = () => {
    setForm(prev => ({
      ...prev,
      estatus: prev.estatus === 'activo' ? 'inactivo' : 'activo'
    }));
  };

  const handleCancel = () => {
    setForm(hotel);
    setIsEditing(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await hotelService.update(hotelId, form);
      const updated = res.data ?? res;
      setHotel(updated);
      setForm(updated);
      setIsEditing(false);
      setSuccessMsg('Información del hotel actualizada correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  // ── Skeleton de carga ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Cargando información del hotel…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* ── Encabezado ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Gestión del Hotel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualiza y actualiza la información oficial de Casa Dolores Hidalgo.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {!isEditing && (
            <>
              <button
                onClick={fetchHotel}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}
              >
                <RefreshCw size={14} /> Recargar
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Edit3 size={15} /> Editar información
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Alertas ───────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626', marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} /> <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', color: '#16a34a', marginBottom: '1.5rem' }}>
          <CheckCircle size={18} /> <span style={{ fontSize: '0.9rem' }}>{successMsg}</span>
        </div>
      )}

      {hotel && !isEditing && (
        /* ── Modo Vista ──────────────────────────────────────────────────────── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(640px, 1fr))', gap: '1.5rem' }}>

          {/* Tarjeta: Identidad */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Identidad del Hotel</h2>
              <StatusBadge estatus={hotel.estatus} />
            </div>
            <InfoRow icon={Building2} label="Nombre" value={hotel.nombre} />
            <InfoRow icon={FileText} label="Descripción Corta" value={hotel.descripcion_corta} />
            <InfoRow icon={FileText} label="Descripción Larga" value={hotel.descripcion_larga} rows={4} />
          </div>

          {/* Tarjeta: Contacto y Ubicación */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Contacto y Ubicación</h2>
            <InfoRow icon={MapPin} label="Dirección" value={hotel.direccion} />
            <InfoRow icon={Globe} label="Latitud" value={hotel.latitud} mono />
            <InfoRow icon={Globe} label="Longitud" value={hotel.longitud} mono />
            <InfoRow icon={Phone} label="Teléfono" value={hotel.telefono} />
            <InfoRow icon={Mail} label="Email de Contacto" value={hotel.email_contacto} />
          </div>

          {/* Tarjeta: Políticas */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)', gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Política de Cancelación</h2>
            <InfoRow icon={FileText} label="Política actual" value={hotel.politica_cancelacion} />
          </div>
        </div>
      )}

      {isEditing && (
        /* ── Modo Edición ────────────────────────────────────────────────────── */
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(640px, 1fr))', gap: '1.5rem' }}>

            {/* Sección: Identidad */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Identidad del Hotel</h2>

              <FormField label="Nombre del Hotel" name="nombre" value={form.nombre} onChange={handleChange} required />
              <FormField label="Descripción Corta" name="descripcion_corta" value={form.descripcion_corta} onChange={handleChange} rows={2} />
              <FormField label="Descripción Larga" name="descripcion_larga" value={form.descripcion_larga} onChange={handleChange} rows={5} />

              {/* Toggle de estatus */}
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Estatus
                </p>
                <button
                  type="button"
                  onClick={handleToggleEstatus}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)', cursor: 'pointer',
                    backgroundColor: form.estatus === 'activo' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                    color: form.estatus === 'activo' ? '#16a34a' : '#dc2626',
                    fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s ease'
                  }}
                >
                  {form.estatus === 'activo'
                    ? <><ToggleRight size={18} /> Activo</>
                    : <><ToggleLeft size={18} /> Inactivo</>
                  }
                </button>
              </div>
            </div>

            {/* Sección: Contacto y Ubicación */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Contacto y Ubicación</h2>

              <FormField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField label="Latitud" name="latitud" value={form.latitud} onChange={handleChange} type="number" />
                <FormField label="Longitud" name="longitud" value={form.longitud} onChange={handleChange} type="number" />
              </div>
              <FormField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} type="tel" />
              <FormField label="Email de Contacto" name="email_contacto" value={form.email_contacto} onChange={handleChange} type="email" />
            </div>

            {/* Sección: Políticas */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem', gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Política de Cancelación</h2>
              <FormField label="Texto de la política" name="politica_cancelacion" value={form.politica_cancelacion} onChange={handleChange} rows={4} />
            </div>
          </div>

          {/* Barra de acciones */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
            marginTop: '2rem', padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--bg-linen)', borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              className="btn"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}
            >
              <X size={15} /> Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px', justifyContent: 'center' }}
            >
              {saving
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Guardando…</>
                : <><Save size={15} /> Guardar Cambios</>
              }
            </button>
          </div>
        </form>
      )}

      {/* Spinner CSS */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Hotels;
