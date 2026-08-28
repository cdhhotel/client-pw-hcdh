import { X, Upload, Loader2 } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Modal de formulario para crear / editar habitaciones.
 *
 * Props:
 *  - isOpen            {boolean}
 *  - isEditMode        {boolean}
 *  - formData          {object}   – estado del formulario
 *  - hotels            {array}    – lista de hoteles para el select
 *  - isSubmitting      {boolean}
 *  - keepImages        {string[]} – URLs de imágenes existentes que se conservan
 *  - newImagePreviews  {string[]} – Object URLs de imágenes nuevas (preview local)
 *  - onClose           {fn}
 *  - onInputChange     {fn}
 *  - onCheckboxChange  {fn}
 *  - onImageSelect     {fn}       – handler del input[type=file]
 *  - onRemoveLocalImage  {fn(index)}
 *  - onRemoveExistingImage {fn(url)}
 *  - onSubmit          {fn}
 */
export const RoomFormModal = ({
    isOpen,
    isEditMode,
    formData,
    hotels,
    isSubmitting,
    keepImages,
    newImagePreviews,
    onClose,
    onInputChange,
    onCheckboxChange,
    onImageSelect,
    onRemoveLocalImage,
    onRemoveExistingImage,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const labelStyle = {
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '0.35rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontFamily: 'var(--font-sans)',
    };

    const sectionTitle = {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--secondary)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontFamily: 'var(--font-sans)',
    };

    return (
        /* Overlay */
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(28, 21, 16, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflowY: 'auto',
                padding: '1rem 0.5rem',
            }}
        >
            {/* Panel */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-linen)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--border-radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    width: '100%',
                    maxWidth: '680px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 1.75rem',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-sand)',
                    }}
                >
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
                        {isEditMode ? 'Editar Habitación' : 'Nueva Habitación'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.25rem',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body — Form */}
                <form onSubmit={onSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* ─── Sección: Identificación ─── */}
                    <div>
                        <p style={sectionTitle}>Características de la habitación</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* Hotel */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Hotel *</label>
                                <select
                                    name="hotelId"
                                    value={formData.hotelId}
                                    onChange={onInputChange}
                                    required
                                    className="form-control"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">— Selecciona un hotel —</option>
                                    {hotels.map((h) => (
                                        <option key={h.id} value={h.id}>{h.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Número */}
                            <div>
                                <label style={labelStyle}>Número de habitación *</label>
                                <input
                                    type="text"
                                    name="numero"
                                    value={formData.numero}
                                    onChange={onInputChange}
                                    required
                                    placeholder="Ej: 101"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Nombre */}
                            <div>
                                <label style={labelStyle}>Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={onInputChange}
                                    placeholder="Ej: Suite Colonial"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Tipo de habitación */}
                            <div>
                                <label style={labelStyle}>Tipo de habitación *</label>
                                <select
                                    name="tipoHabitacion"
                                    value={formData.tipoHabitacion}
                                    onChange={onInputChange}
                                    required
                                    className="form-control"
                                    style={{ width: '100%' }}
                                >
                                    <option value="individual">Individual</option>
                                    <option value="doble">Doble</option>
                                </select>
                            </div>

                            {/* Estatus */}
                            <div>
                                <label style={labelStyle}>Estatus *</label>
                                <select
                                    name="estatus"
                                    value={formData.estatus}
                                    onChange={onInputChange}
                                    required
                                    className="form-control"
                                    style={{ width: '100%' }}
                                >
                                    <option value="disponible">Disponible</option>
                                    <option value="ocupada">Ocupada</option>
                                    <option value="limpieza">En limpieza</option>
                                    <option value="mantenimiento">En mantenimiento</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ─── Sección: Capacidad y precio ─── */}
                    <div>
                        <p style={sectionTitle}>Capacidad y Precio</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Precio / Noche (MXN) *</label>
                                <input
                                    type="number"
                                    name="precioBaseNoche"
                                    value={formData.precioBaseNoche}
                                    onChange={onInputChange}
                                    required
                                    min="0"
                                    placeholder="1500"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Capacidad máx. *</label>
                                <input
                                    type="number"
                                    name="capacidadMaxima"
                                    value={formData.capacidadMaxima}
                                    onChange={onInputChange}
                                    required
                                    min="1"
                                    max="20"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            {/* <div>
                                <label style={labelStyle}>Metros cuadrados</label>
                                <input
                                    type="number"
                                    name="metrosCuadrados"
                                    value={formData.metrosCuadrados}
                                    onChange={onInputChange}
                                    min="0"
                                    placeholder="25"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div> */}
                            <div>
                                <label style={labelStyle}>Núm. de camas *</label>
                                <input
                                    type="number"
                                    name="numeroCamas"
                                    value={formData.numeroCamas}
                                    onChange={onInputChange}
                                    required
                                    min="1"
                                    max="10"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Tipo de camas</label>
                                <input
                                    type="text"
                                    name="tipoCamas"
                                    value={formData.tipoCamas}
                                    onChange={onInputChange}
                                    placeholder="King Size, Queen, Individual…"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─── Sección: Descripción ─── */}
                    <div>
                        <p style={sectionTitle}>Descripción</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Descripción corta</label>
                                <textarea
                                    name="descripcionCorta"
                                    value={formData.descripcionCorta}
                                    onChange={onInputChange}
                                    rows={2}
                                    placeholder="Resumen breve visible en las tarjetas…"
                                    className="form-control"
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Descripción completa</label>
                                <textarea
                                    name="descripcionLarga"
                                    value={formData.descripcionLarga}
                                    onChange={onInputChange}
                                    rows={3}
                                    placeholder="Descripción detallada de la habitación…"
                                    className="form-control"
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─── Sección: Atributos extra ─── */}
                    <div>
                        <p style={sectionTitle}>Atributos Especiales</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                            {[
                                { name: 'extras', label: 'Kit de Baño' },
                                { name: 'toallas', label: 'Toallas' },
                                { name: 'bano', label: 'Baño completo' },
                                { name: 'tv', label: 'TV' },
                                { name: 'wifi', label: 'Wi-Fi' },
                                { name: 'ventilador', label: 'Ventilador' }
                            ].map(({ name, label }) => (
                                <label
                                    key={name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-body)',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name={name}
                                        checked={!!formData.atributosExtra?.[name]}
                                        onChange={onCheckboxChange}
                                        style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ─── Sección: Imágenes ─── */}
                    <div>
                        <p style={sectionTitle}>Imágenes</p>

                        {/* Imágenes existentes (modo edición) */}
                        {isEditMode && keepImages.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    Imágenes actuales (haz clic en ✕ para eliminar):
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {keepImages.map((url) => {
                                        // Usar la ruta tal como viene de la BD:
                                        // - Si es /uploads/... el proxy de Vite la reenvía al servidor
                                        // - Si es una URL absoluta (http/https) se usa directamente
                                        const src = url;
                                        return (
                                            <div key={url} style={{ position: 'relative' }}>
                                                <img
                                                    src={src}
                                                    alt="Imagen existente"
                                                    style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
                                                />
                                                {formData.numero && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        left: 4,
                                                        background: 'rgba(0, 0, 0, 0.75)',
                                                        color: '#fff',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 'bold',
                                                        padding: '1px 5px',
                                                        borderRadius: '3px',
                                                        pointerEvents: 'none'
                                                    }}>
                                                        Hab. #{formData.numero}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveExistingImage(url)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -6,
                                                        right: -6,
                                                        background: 'var(--primary)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: 20,
                                                        height: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        color: 'var(--bg-linen)',
                                                    }}
                                                >
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Nuevas imágenes seleccionadas */}
                        {newImagePreviews.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    Imágenes por subir:
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {newImagePreviews.map((src, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            <img
                                                src={src}
                                                alt={`Preview ${idx + 1}`}
                                                style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 4, border: '2px dashed var(--accent)' }}
                                            />
                                            {formData.numero && (
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    left: 4,
                                                    background: 'rgba(0, 0, 0, 0.75)',
                                                    color: '#fff',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 'bold',
                                                    padding: '1px 5px',
                                                    borderRadius: '3px',
                                                    pointerEvents: 'none'
                                                }}>
                                                    Hab. #{formData.numero}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => onRemoveLocalImage(idx)}
                                                style={{
                                                    position: 'absolute',
                                                    top: -6,
                                                    right: -6,
                                                    background: 'var(--primary)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'var(--bg-linen)',
                                                }}
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input file */}
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.7rem 1.2rem',
                                border: '1.5px dashed var(--border)',
                                borderRadius: 'var(--border-radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: 'var(--text-muted)',
                                width: 'fit-content',
                                transition: 'border-color 0.2s',
                            }}
                        >
                            <Upload size={16} />
                            Seleccionar imágenes
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={onImageSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {/* ─── Acciones ─── */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                            paddingTop: '1rem',
                            marginTop: '0.5rem',
                            borderTop: '1px solid var(--border)',
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Guardando…
                                </>
                            ) : (
                                isEditMode ? 'Guardar cambios' : 'Registrar habitación'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
