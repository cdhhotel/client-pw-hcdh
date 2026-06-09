import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Hotel, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../app/AuthContext';

export const MainLayout = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      {/* Header Sticky con Glassmorphism */}
      <header
        className={`glass-panel`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'var(--transition)',
          padding: isScrolled ? '0.75rem 2rem' : '1.25rem 2rem',
          borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent',
          backgroundColor: isScrolled ? 'var(--bg-linen)' : 'transparent',
          boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
        }}
      >
        <div className="container d-flex justify-between align-center" style={{ padding: 0 }}>
          <Link to="/" className="d-flex align-center gap-1" style={{ color: 'var(--text-main)' }}>
            <Hotel size={28} className="animate-fade-in" style={{ color: 'var(--primary)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>
              Casa Dolores
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
            <NavLink
              to="/"
              style={({ isActive }) => ({
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px',
              })}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/rooms"
              style={({ isActive }) => ({
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px',
              })}
            >
              Habitaciones
            </NavLink>
            <NavLink
              to="/booking"
              style={({ isActive }) => ({
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px',
              })}
            >
              Reservar
            </NavLink>

            {/* Admin Acceso */}
            {isAdmin && (
              <Link
                to="/admin"
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Shield size={14} /> Panel Admin
              </Link>
            )}

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="d-flex align-center gap-1" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                  title="Cerrar sesión"
                >
                  <LogOut size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Iniciar Sesión
              </Link>
            )}
          </nav>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'none', // Styled via JS check below or CSS media query helper
            }}
            className="mobile-toggle"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            <Link to="/rooms" onClick={() => setIsMenuOpen(false)}>Habitaciones</Link>
            <Link to="/booking" onClick={() => setIsMenuOpen(false)}>Reservar</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                Panel Administrativo
              </Link>
            )}
            {isAuthenticated ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span>Hola, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-primary text-center">
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Margen para compensar el header fixed */}
      <main className="main-content" style={{ marginTop: isScrolled ? '60px' : '75px', transition: 'var(--transition)' }}>
        <Outlet />
      </main>

      {/* Footer del Hotel */}
      <footer style={{ backgroundColor: 'var(--bg-sand)', borderTop: '1px solid var(--border)', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
            <div>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)' }}>Hotel Casa Dolores</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '300px' }}>
                Un refugio de elegancia e historia en el corazón de Dolores Hidalgo, Guanajuato. Descubre la calidez y hospitalidad mexicana en su máxima expresión.
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)' }}>Contacto</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                📍 Hidalgo #123, Centro Histórico
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                📞 +52 (418) 123-4567
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                ✉️ contacto@hotelcasadolores.com
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)' }}>Enlaces</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/rooms">Habitaciones</Link></li>
                <li><Link to="/booking">Reservar Ahora</Link></li>
                <li><Link to="/login">Área del Personal</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <p>&copy; {new Date().getFullYear()} Hotel Casa Dolores Hidalgo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Media Query Injector Helper para Mobile CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </div>
  );
};
