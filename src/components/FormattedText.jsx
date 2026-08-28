import React from 'react';
import { CheckCircle2, Sparkles, MapPin, Compass, Heart, Coffee, ShieldCheck, Star } from 'lucide-react';

/**
 * Componente FormattedText
 * Parsea descripciones de hoteles y habitaciones de forma natural y elegante.
 * Presenta encabezados con tipografía serif colonial, párrafos con excelente legibilidad
 * y listas de características en bloques estructurados limpios y uniformes.
 */
export const FormattedText = ({ text, className = '', style = {} }) => {
  if (!text || typeof text !== 'string') return null;

  // 1. Normalizar saltos de línea y separar párrafos
  const cleanText = text
    .replace(/\r\n/g, '\n')
    // Asegurar que viñetas tengan salto de línea si vienen pegadas
    .replace(/([^\n])\s*([•➛▸➢]|-(?=\s)|[*](?=\s))/g, '$1\n$2');

  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  const elements = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <div
          key={`list-${key}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.85rem',
            margin: '1rem 0 1.5rem 0'
          }}
        >
          {currentList.map((item, idx) => {
            // Extraer título antes de los dos puntos si existe
            const colonIndex = item.indexOf(':');
            let title = '';
            let content = item;

            if (colonIndex > 0 && colonIndex < 40) {
              title = item.slice(0, colonIndex).trim();
              content = item.slice(colonIndex + 1).trim();
            }

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(160, 68, 42, 0.15)',
                  borderRadius: '8px',
                  padding: '0.85rem 1.1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  boxShadow: '0 2px 6px rgba(44, 26, 14, 0.04)'
                }}
              >
                <span
                  style={{
                    color: 'var(--primary)',
                    fontSize: '1rem',
                    lineHeight: '1.4',
                    flexShrink: 0,
                    fontWeight: 700
                  }}
                >
                  ✦
                </span>
                <div style={{ fontSize: '0.94rem', lineHeight: '1.55', color: 'var(--text-main)', textAlign: 'justify' }}>
                  {title ? (
                    <>
                      <strong style={{ color: '#5C2314', fontWeight: 700 }}>{title}: </strong>
                      <span>{content}</span>
                    </>
                  ) : (
                    <span>{item}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    // Detectar si la línea es un ítem de lista (empieza con *, -, •, etc.)
    const isBulletItem = /^[•➛▸➢\-*]\s+/.test(line);
    const cleanLine = line.replace(/^[•➛▸➢\-*]\s*/, '').trim();

    // Detectar si actúa como encabezado de sección
    // Ejemplo: "Tu Experiencia...", "Lo que te ofrece...", o líneas cortas terminadas en ":"
    const isHeader =
      !isBulletItem &&
      (line.endsWith(':') ||
        /^(Lo que te ofrece|Tu Experiencia|Comodidad y Tradición|Hospitalidad y Acceso|Características|Detalles|Servicios principales|Ubicación y Entorno)/i.test(line));

    if (isHeader) {
      flushList(index);
      const titleText = line.replace(/:$/, '').trim();
      elements.push(
        <div key={`header-${index}`} style={{ marginTop: index === 0 ? '0' : '1.75rem', marginBottom: '0.75rem' }}>
          <h4
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#5C2314',
              lineHeight: 1.3,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            {titleText}
          </h4>
          <div style={{ height: '2px', width: '40px', backgroundColor: 'var(--primary)', marginTop: '6px', borderRadius: '2px', opacity: 0.7 }} />
        </div>
      );
    } else if (isBulletItem) {
      currentList.push(cleanLine);
    } else {
      flushList(index);
      elements.push(
        <p
          key={`p-${index}`}
          style={{
            fontSize: '1rem',
            lineHeight: '1.75',
            color: 'var(--text-main)',
            marginBottom: '0.9rem',
            fontWeight: 400,
            textAlign: 'justify'
          }}
        >
          {line}
        </p>
      );
    }
  });

  flushList('end');

  return (
    <div className={`formatted-text-container ${className}`} style={{ width: '100%', textAlign: 'justify', ...style }}>
      {elements}
    </div>
  );
};

export default FormattedText;
