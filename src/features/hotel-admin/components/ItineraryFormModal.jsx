import { X, MapPin, Loader2, Calendar } from 'lucide-react';
import { ITINERARY_CATEGORIES } from '../../itinerary/constants/categories';

export const ItineraryFormModal = ({
  isOpen,
  isEditMode,
  formData,
  sitios = [],
  isSubmitting,
  onClose,
  onInputChange,
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

  const isEvento = formData.tipoRegistro === 'evento';

  return (
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
          animation: 'fadeIn 0.25s ease',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isEvento ? (
              <Calendar size={20} style={{ color: 'var(--primary)' }} />
            ) : (
              <MapPin size={20} style={{ color: 'var(--primary)' }} />
            )}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
              {isEditMode ? (isEvento ? 'Editar Evento Local' : 'Editar Sitio Cercano') : (isEvento ? 'Nuevo Evento Local' : 'Nuevo Sitio Cercano')}
            </h2>
          </div>
          <button
            type="button"
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

        {/* Formulario */}
        <form onSubmit={onSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Selector de Tipo (Bloqueado en modo edición) */}
          <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.82rem', color: 'var(--secondary)', cursor: isEditMode ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}>
              <input
                type="radio"
                name="tipoRegistro"
                value="sitio"
                checked={formData.tipoRegistro === 'sitio'}
                disabled={isEditMode}
                onChange={onInputChange}
                style={{ accentColor: 'var(--primary)' }}
              />
              Sitio Cercano (Lugar Físico)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.82rem', color: 'var(--secondary)', cursor: isEditMode ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}>
              <input
                type="radio"
                name="tipoRegistro"
                value="evento"
                checked={formData.tipoRegistro === 'evento'}
                disabled={isEditMode}
                onChange={onInputChange}
                style={{ accentColor: 'var(--primary)' }}
              />
              Evento Local de Temporada
            </label>
          </div>

          {isEvento ? (
            /* ────────────────────────────────────────────────────────── */
            /* ─── VISTA: FORMULARIO EVENTO LOCAL                     ─── */
            /* ────────────────────────────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={sectionTitle}>Datos del Evento</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle} htmlFor="nombre">Nombre del Evento *</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Ej. Festival de la Vendimia"
                      value={formData.nombre}
                      onChange={onInputChange}
                      required
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle} htmlFor="sitio_cercano_id">Sede / Lugar del Evento (Socio)</label>
                    <select
                      id="sitio_cercano_id"
                      name="sitio_cercano_id"
                      value={formData.sitio_cercano_id || ''}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    >
                      <option value="">Independiente / Ninguno</option>
                      {sitios.map(site => (
                        <option key={site.id} value={site.id}>{site.nombre} ({site.categoria})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="mes_referencia">Mes de Referencia</label>
                    <input
                      id="mes_referencia"
                      name="mes_referencia"
                      type="text"
                      placeholder="Ej. Noviembre"
                      value={formData.mes_referencia}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="fecha_inicio">Fecha de Inicio</label>
                    <input
                      id="fecha_inicio"
                      name="fecha_inicio"
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="fecha_fin">Fecha de Cierre</label>
                    <input
                      id="fecha_fin"
                      name="fecha_fin"
                      type="date"
                      value={formData.fecha_fin}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="descripcion">Descripción del Evento</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={4}
                  placeholder="Describe las actividades, degustaciones o detalles del evento..."
                  value={formData.descripcion}
                  onChange={onInputChange}
                  className="form-control"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            /* ────────────────────────────────────────────────────────── */
            /* ─── VISTA: FORMULARIO SITIO CERCANO                    ─── */
            /* ────────────────────────────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* ─── Sección: Información General ─── */}
              <div>
                <p style={sectionTitle}>Información General</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle} htmlFor="nombre">Nombre del sitio *</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Ej. Parroquia de Nuestra Señora de los Dolores"
                      value={formData.nombre}
                      onChange={onInputChange}
                      required
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="categoria">Categoría</label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    >
                      <option value="" disabled>Selecciona una subcategoría</option>
                      {Object.entries(ITINERARY_CATEGORIES).map(([mainCat, subCats]) => (
                        <optgroup key={mainCat} label={mainCat}>
                          {subCats.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Horarios de Atención</label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {formData.horario_entries && formData.horario_entries.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            placeholder="Días (ej. Lunes a Sábado)"
                            value={entry.dias || ''}
                            onChange={(e) => {
                              const updated = [...formData.horario_entries];
                              updated[index].dias = e.target.value;
                              onInputChange({ target: { name: 'horario_entries', value: updated } });
                            }}
                            className="form-control"
                            style={{ flex: 2, minWidth: '150px' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1.5, minWidth: '110px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>De:</span>
                            <input
                              type="time"
                              value={entry.hora_apertura || ''}
                              onChange={(e) => {
                                const updated = [...formData.horario_entries];
                                updated[index].hora_apertura = e.target.value;
                                onInputChange({ target: { name: 'horario_entries', value: updated } });
                              }}
                              className="form-control"
                              style={{ width: '100%', padding: '0.375rem 0.5rem' }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1.5, minWidth: '110px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>A:</span>
                            <input
                              type="time"
                              value={entry.hora_cierre || ''}
                              onChange={(e) => {
                                const updated = [...formData.horario_entries];
                                updated[index].hora_cierre = e.target.value;
                                onInputChange({ target: { name: 'horario_entries', value: updated } });
                              }}
                              className="form-control"
                              style={{ width: '100%', padding: '0.375rem 0.5rem' }}
                            />
                          </div>
                          {formData.horario_entries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.horario_entries.filter((_, idx) => idx !== index);
                                onInputChange({ target: { name: 'horario_entries', value: updated } });
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '1.25rem',
                                padding: '0 0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Eliminar este horario"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(formData.horario_entries || []), { dias: '', hora_apertura: '', hora_cierre: '' }];
                        onInputChange({ target: { name: 'horario_entries', value: updated } });
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '0.35rem 0.75rem',
                        background: 'transparent',
                        border: '1px dashed var(--primary)',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: 'var(--border-radius-sm)',
                        marginTop: '0.25rem'
                      }}
                    >
                      + Agregar Rango de Horario
                    </button>
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="servicios">Servicios Disponibles</label>
                    <input
                      id="servicios"
                      name="servicios"
                      type="text"
                      placeholder="Ej. Baños, Estacionamiento, Wi-Fi"
                      value={formData.servicios}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle} htmlFor="imagen_url">URL de Imagen</label>
                    <input
                      id="imagen_url"
                      name="imagen_url"
                      type="text"
                      placeholder="Ej. https://images.unsplash.com/... o /images/tours.png"
                      value={formData.imagen_url || ''}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Sección: Ubicación y Contacto ─── */}
              <div>
                <p style={sectionTitle}>Ubicación y Contacto</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle} htmlFor="direccion">Dirección</label>
                    <input
                      id="direccion"
                      name="direccion"
                      type="text"
                      placeholder="Ej. Plaza Principal S/N"
                      value={formData.direccion}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="text"
                      placeholder="Ej. 418 123 4567"
                      value={formData.telefono}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="sitio_web">Sitio Web</label>
                    <input
                      id="sitio_web"
                      name="sitio_web"
                      type="text"
                      placeholder="Ej. www.museodolores.com"
                      value={formData.sitio_web}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle} htmlFor="correo_contacto">Correo de Contacto</label>
                    <input
                      id="correo_contacto"
                      name="correo_contacto"
                      type="email"
                      placeholder="Ej. info@museo.com"
                      value={formData.correo_contacto}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="redes_sociales">Redes Sociales</label>
                    <input
                      id="redes_sociales"
                      name="redes_sociales"
                      type="text"
                      placeholder="Ej. FB: @museodolores"
                      value={formData.redes_sociales}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="link_maps">Enlace a Google Maps</label>
                    <input
                      id="link_maps"
                      name="link_maps"
                      type="text"
                      placeholder="Ej. https://maps.app.goo.gl/..."
                      value={formData.link_maps}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Sección: Coordenadas y Detalles ─── */}
              <div>
                <p style={sectionTitle}>Coordenadas y Detalles de Viaje</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle} htmlFor="latitud">Latitud</label>
                      <input
                        id="latitud"
                        name="latitud"
                        type="number"
                        step="0.00000001"
                        placeholder="Ej. 21.1578"
                        value={formData.latitud}
                        onChange={onInputChange}
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="longitud">Longitud</label>
                      <input
                        id="longitud"
                        name="longitud"
                        type="number"
                        step="0.00000001"
                        placeholder="Ej. -100.9312"
                        value={formData.longitud}
                        onChange={onInputChange}
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle} htmlFor="distancia_km">Distancia (KM)</label>
                      <input
                        id="distancia_km"
                        name="distancia_km"
                        type="number"
                        step="0.1"
                        placeholder="Ej. 2.5"
                        value={formData.distancia_km}
                        onChange={onInputChange}
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="tiempo_estimado_minutos">Tiempo Estimado (Min)</label>
                      <input
                        id="tiempo_estimado_minutos"
                        name="tiempo_estimado_minutos"
                        type="number"
                        placeholder="Ej. 15"
                        value={formData.tiempo_estimado_minutos}
                        onChange={onInputChange}
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="calificacion">Calificación (1-5)</label>
                      <input
                        id="calificacion"
                        name="calificacion"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        placeholder="Ej. 4.5"
                        value={formData.calificacion}
                        onChange={onInputChange}
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="descripcion">Descripción</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      rows={3}
                      placeholder="Describe brevemente el sitio..."
                      value={formData.descripcion}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="especificaciones">Especificaciones</label>
                    <textarea
                      id="especificaciones"
                      name="especificaciones"
                      rows={2}
                      placeholder="Ej. Llevar ropa cómoda, no se permiten mascotas..."
                      value={formData.especificaciones}
                      onChange={onInputChange}
                      className="form-control"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Sección: Eventos Rápidos Anidados ─── */}
              <div>
                <p style={sectionTitle}>Eventos Rápidos del Sitio</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {formData.evento_local && formData.evento_local.length > 0 ? (
                    formData.evento_local.map((ev, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 'var(--border-radius-sm)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>{ev.nombre}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {ev.fecha_inicio ? new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : ''} 
                            {ev.fecha_fin ? ` al ${new Date(ev.fecha_fin).toLocaleDateString('es-MX', { timeZone: 'UTC' })}` : ''}
                            {ev.mes_referencia ? ` (${ev.mes_referencia})` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.evento_local.filter((_, idx) => idx !== index);
                            onInputChange({ target: { name: 'evento_local', value: updated } });
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No hay eventos locales rápidos en este sitio.</p>
                  )}
                </div>

                <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--border-radius-sm)', background: 'rgba(216, 200, 168, 0.03)' }}>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>Añadir Evento Rápido</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Nombre del Evento</label>
                      <input
                        id="temp_ev_nombre"
                        type="text"
                        placeholder="Ej. Cata Especial"
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Mes de Referencia</label>
                      <input
                        id="temp_ev_mes"
                        type="text"
                        placeholder="Ej. Noviembre"
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Fecha Inicio</label>
                      <input
                        id="temp_ev_inicio"
                        type="date"
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.7rem' }}>Fecha Fin</label>
                      <input
                        id="temp_ev_fin"
                        type="date"
                        className="form-control"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nombreVal = document.getElementById('temp_ev_nombre').value.trim();
                      const mesVal = document.getElementById('temp_ev_mes').value.trim();
                      const inicioVal = document.getElementById('temp_ev_inicio').value;
                      const finVal = document.getElementById('temp_ev_fin').value;

                      if (!nombreVal) {
                        alert('El nombre del evento es requerido');
                        return;
                      }

                      const newEvent = {
                        nombre: nombreVal,
                        mes_referencia: mesVal || null,
                        fecha_inicio: inicioVal || null,
                        fecha_fin: finVal || null
                      };

                      const updated = [...(formData.evento_local || []), newEvent];
                      onInputChange({ target: { name: 'evento_local', value: updated } });

                      // Limpiar campos temporales
                      document.getElementById('temp_ev_nombre').value = '';
                      document.getElementById('temp_ev_mes').value = '';
                      document.getElementById('temp_ev_inicio').value = '';
                      document.getElementById('temp_ev_fin').value = '';
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: 'var(--primary)',
                      color: 'var(--bg-linen)',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-sm)'
                    }}
                  >
                    Añadir Evento Rápido
                  </button>
                </div>
              </div>
            </div>
          )}

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
                isEditMode ? 'Guardar cambios' : (isEvento ? 'Registrar evento' : 'Registrar sitio')
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ItineraryFormModal;
