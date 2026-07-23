import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, Car, X } from 'lucide-react';

export const InterestContactsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Botón flotante de Servicios y Emergencias */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Servicios y Emergencias"
        style={{
          position: 'fixed',
          bottom: isMobile ? '1.25rem' : '1.5rem',
          right: isMobile ? '1.25rem' : '1.5rem',
          backgroundColor: 'var(--primary)',
          color: 'var(--bg-linen)',
          border: 'none',
          borderRadius: '50px',
          padding: isMobile ? '0.55rem 0.9rem' : '0.65rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 15px rgba(160, 68, 42, 0.45)',
          cursor: 'pointer',
          zIndex: 9998,
          fontWeight: 'bold',
          fontFamily: 'var(--font-sans)',
          fontSize: isMobile ? '0.75rem' : '0.82rem',
          transition: 'transform 0.2s, background-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(160, 68, 42, 0.55)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(160, 68, 42, 0.45)';
        }}
      >
        <Phone size={16} />
        <span>Servicios y Emergencias</span>
      </button>

      {/* Modal de contactos de interés */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 21, 16, 0.7)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
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
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.2s ease',
              maxHeight: '90vh',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-sand)',
                borderTopLeftRadius: 'var(--border-radius-md)',
                borderTopRightRadius: 'var(--border-radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={20} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
                  Servicios y Emergencias
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Sección 1: Emergencias */}
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} style={{ color: 'var(--primary)' }} /> Líneas de Emergencia y Apoyo
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>TECUIDO (Denuncia Segura)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Línea de acompañamiento y denuncia</span>
                    </div>
                    <a href="tel:8008328436" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(160, 68, 42, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.15)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.08)'}>
                      800 832 8436
                    </a>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>Denuncia Anónima</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Atención rápida y reservada</span>
                    </div>
                    <a href="tel:89" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(160, 68, 42, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.15)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.08)'}>
                      89
                    </a>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(220, 38, 38, 0.03)', padding: '0.75rem 1rem', border: '1px solid rgba(220, 38, 38, 0.15)', borderRadius: 'var(--border-radius-sm)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#b91c1c' }}>Número de Emergencias</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cualquier caso urgente / Policía / Ambulancia</span>
                    </div>
                    <a href="tel:911" style={{ fontSize: '1rem', fontWeight: 'bold', color: '#b91c1c', textDecoration: 'none', background: 'rgba(220, 38, 38, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.15)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)'}>
                      911
                    </a>
                  </div>
                </div>
              </div>

              {/* Sección 2: Transporte */}
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Car size={16} style={{ color: 'var(--primary)' }} /> Servicios de Transporte Local
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* DH Group */}
                  <div style={{ background: 'var(--white)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>DH Group</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '0.1rem' }}>Servicio 24 horas</span>
                      </div>
                      <a href="tel:4182460149" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(160, 68, 42, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.15)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.08)'}>
                        418 246 0149
                      </a>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Servicio de transporte personalizado, brindando el mejor servicio día a día. Servicio automotor, viajes y transporte.
                    </p>
                  </div>

                  {/* Tu Destino DH */}
                  <div style={{ background: 'var(--white)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Tu Destino DH</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.3' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>Horarios:</span><br />
                          • Lun a Jue: 6:00 AM - 11:30 PM<br />
                          • Vie a Sáb: 6:00 AM - 11:55 PM<br />
                          • Dom: 7:00 AM - 11:30 PM
                        </span>
                      </div>
                      <a href="tel:4181778489" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(160, 68, 42, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.15)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(160, 68, 42, 0.08)'}>
                        418 177 8489
                      </a>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '0.25rem' }}>
                      Servicio de transporte local, foráneo y a comunidades. Entrega de servicio y/o recolección de productos o servicios. Agenda o programación de servicios anticipados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
