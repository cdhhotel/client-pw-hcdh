import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { Shield, Key, Mail, AlertTriangle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirigir al panel administrativo tras login exitoso
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Error de inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(193, 92, 61, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Personal del Hotel</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ingresa tus credenciales para acceder</p>
        </div>

        {/* Alertas */}
        {isExpired && (
          <div
            style={{
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              color: '#8c7320',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            Tu sesión ha expirado. Por favor inicia sesión de nuevo.
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(193, 92, 61, 0.12)',
              color: '#a3482d',
              border: '1px solid rgba(193, 92, 61, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={12} /> Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="nombre@hotel.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Key size={12} /> Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Nota informativa de Desarrollo */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}> Credenciales de prueba:</p>
          <p style={{ fontFamily: 'var(--font-sans)' }}>Usuario: <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>admin@casadolores.com</span></p>
          <p style={{ fontFamily: 'var(--font-sans)' }}>Contraseña: <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>admin123</span></p>
        </div>
      </div>
    </div>
  );
};
