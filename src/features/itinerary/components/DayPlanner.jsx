import { Calendar, ChevronRight } from 'lucide-react';

export const DayPlanner = ({ days, selectedDay, onSelectDay, onDaysChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Selector de días */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Calendar size={18} style={{ color: 'var(--gold)' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-serif)' }}>
            ¿Cuántos días te hospedas?
          </h3>
        </div>

        {/* Controles de días */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onDaysChange(Math.max(1, days - 1))}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg-linen)',
              cursor: days === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
              color: days === 1 ? 'var(--border)' : 'var(--secondary)',
              fontWeight: 700,
              transition: 'var(--transition)',
            }}
            disabled={days === 1}
          >
            −
          </button>

          <div style={{
            minWidth: '80px',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--primary)',
              lineHeight: 1,
            }}>
              {days}
            </span>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {days === 1 ? 'día' : 'días'}
            </p>
          </div>

          <button
            onClick={() => onDaysChange(Math.min(14, days + 1))}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg-linen)',
              cursor: days === 14 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
              color: days === 14 ? 'var(--border)' : 'var(--secondary)',
              fontWeight: 700,
              transition: 'var(--transition)',
            }}
            disabled={days === 14}
          >
            +
          </button>
        </div>
      </div>

      {/* Tabs de días */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <p style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-muted)',
          margin: '0 0 0.75rem 0',
          fontWeight: 600,
        }}>
          Selecciona el día
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {Array.from({ length: days }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: selectedDay === day ? 'var(--primary)' : 'transparent',
                color: selectedDay === day ? 'var(--bg-linen)' : 'var(--text-main)',
                border: selectedDay === day ? 'none' : '1px solid transparent',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: selectedDay === day ? 600 : 400,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.background = 'var(--bg-sand)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>Día {day}</span>
              <ChevronRight size={14} style={{ opacity: selectedDay === day ? 1 : 0.4 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayPlanner;
