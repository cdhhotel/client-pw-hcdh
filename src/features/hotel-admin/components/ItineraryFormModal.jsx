import { useRef, useState, useEffect } from 'react';
import { X, Upload, Trash2, MapPin, Clock } from 'lucide-react';

const CATEGORIAS = [
  'Gastronomía', 'Cultura', 'Naturaleza', 'Aventura',
  'Compras', 'Historia', 'Arte', 'Deporte', 'Relax', 'Otro',
];

/** Convierte "1970-01-01T07:00:00.000Z" → "07:00" para input time */
function isoToTimeInput(isoTime) {
  if (!isoTime) return '';
  try {
    const str = String(isoTime);
    const match = str.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
    return str.substring(0, 5);
  } catch {
    return '';
  }
}

export const ItineraryFormModal = ({
  isOpen,
  isEditMode,
  formData,
  sitiosCercanos,
  isSubmitting,
  existingImageUrl,
  onClose,
  onInputChange,
  onImageSelect,
  onRemoveImage,
  onRemoveExistingImage,
  onSubmit,
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // Generar preview de la imagen local seleccionada
  useEffect(() => {
    if (formData.imagenFile) {
      const url = URL.createObjectURL(formData.imagenFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [formData.imagenFile]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(74, 55, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg-linen)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          animation: 'fadeIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-sand)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
              {isEditMode ? 'Editar Actividad' : 'Nueva Actividad'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la actividad *</label>
            <input
              id="nombre"
              name="nombre"
              className="form-control"
              type="text"
              placeholder="Ej. Tour por el centro histórico"
              value={formData.nombre}
              onChange={onInputChange}
              required
            />
          </div>

          {/* Sitio cercano */}
          <div className="form-group">
            <label htmlFor="sitio_cercano_id">Lugar / Sitio cercano *</label>
            <select
              id="sitio_cercano_id"
              name="sitio_cercano_id"
              className="form-control"
              value={formData.sitio_cercano_id}
              onChange={onInputChange}
              required
            >
              <option value="">— Selecciona un lugar —</option>
              {sitiosCercanos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.categoria ? `(${s.categoria})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Horarios */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="horario_inicio">
                <Clock size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Hora inicio *
              </label>
              <input
                id="horario_inicio"
                name="horario_inicio"
                className="form-control"
                type="time"
                value={isoToTimeInput(formData.horario_inicio)}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="horario_fin">
                <Clock size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Hora fin *
              </label>
              <input
                id="horario_fin"
                name="horario_fin"
                className="form-control"
                type="time"
                value={isoToTimeInput(formData.horario_fin)}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          {/* Categoría y Disponibilidad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                className="form-control"
                value={formData.categoria}
                onChange={onInputChange}
              >
                <option value="">— Sin categoría —</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="disponibilidad">Cupos disponibles</label>
              <input
                id="disponibilidad"
                name="disponibilidad"
                className="form-control"
                type="number"
                min="0"
                max="999"
                value={formData.disponibilidad}
                onChange={onInputChange}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="form-control"
              rows={3}
              placeholder="Describe brevemente la actividad..."
              value={formData.descripcion}
              onChange={onInputChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Imagen */}
          <div className="form-group">
            <label>Imagen de la actividad</label>

            {/* Imagen existente en modo edición */}
            {isEditMode && existingImageUrl && !formData.imagenFile && (
              <div style={{ marginBottom: '0.75rem', position: 'relative', display: 'inline-block' }}>
                <img
                  src={existingImageUrl}
                  alt="Imagen actual"
                  style={{
                    width: '100%', maxWidth: '300px', height: '160px',
                    objectFit: 'cover',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border)',
                  }}
                />
                <button
                  type="button"
                  onClick={onRemoveExistingImage}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'var(--primary)', border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white',
                  }}
                >
                  <Trash2 size={12} />
                </button>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Imagen actual — selecciona otra para reemplazarla
                </p>
              </div>
            )}

            {/* Preview de nueva imagen */}
            {preview && (
              <div style={{ marginBottom: '0.75rem', position: 'relative', display: 'inline-block' }}>
                <img
                  src={preview}
                  alt="Nueva imagen"
                  style={{
                    width: '100%', maxWidth: '300px', height: '160px',
                    objectFit: 'cover',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '2px solid var(--primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { onRemoveImage(); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'var(--primary)', border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Zona de drop */}
            {!preview && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--white)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  Arrastra una imagen o <span style={{ color: 'var(--primary)', fontWeight: 600 }}>haz clic para seleccionar</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  JPG, PNG, WEBP — máx. 5 MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditMode ? 'Actualizando...' : 'Registrando...')
                : (isEditMode ? 'Guardar cambios' : 'Registrar actividad')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItineraryFormModal;
