import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Hotel, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../app/AuthContext';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { InterestContactsModal } from '../components/InterestContactsModal';

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
    <div className="app-container relative">
      {/* Header (Controlamos el color del texto global de sus hijos aquí) */}
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center transition-all duration-500 ease-in-out px-8 ${isScrolled
          ? 'bg-[var(--bg-linen)] text-[var(--text-main)] shadow-md border-b border-[var(--border)]'
          : 'bg-transparent text-[var(--white)] border-b border-transparent'
          }`}
        style={{ height: isScrolled ? 'var(--navbar-height-scrolled)' : 'var(--navbar-height)' }}
      >
        <div className="container mx-auto flex justify-between items-center w-full">
          {/* Logo y Nombre */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* <img
              src="/logo_mono.png"
              alt="Logo Hotel Casa Dolores"
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 bg-white/90 p-1 rounded-md shadow-sm"
            /> */}
            <img
              src="/logo_mono.png"
              alt="Logo Hotel Casa Dolores"
              style={{
                height: '54px',
                maxWidth: '140px',
                width: 'auto',
                objectFit: 'contain',
                backgroundColor: 'rgba(255, 255, 255, 0)',
                padding: '4px 6px',
                borderRadius: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <span style={{ fontFamily: 'var(--font-serif)' }} className="text-xl md:text-2xl font-bold tracking-wide">
              Casa Dolores Hidalgo
            </span>
          </Link>

          {/* Navbar habitaciones */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <NavLink
              to="/rooms"
              target="_blank"
              rel="noopener noreferrer"
              className={({ isActive }) =>
                `font-medium pb-1 border-b-2 transition-colors duration-300 ${isActive
                  ? 'text-[var(--primary)] border-[var(--primary)]'
                  : isScrolled
                    ? 'border-transparent hover:text-[var(--primary)]'
                    : 'border-transparent hover:text-[var(--primary-hover)]'
                }`
              }
            >
              Habitaciones
            </NavLink>

            {/* Admin Acceso */}
            {isAdmin && (
              <Link
                to="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-outline py-2 px-4 text-xs flex items-center gap-1.5 transition-all duration-300 ${isScrolled
                  ? 'border-[var(--secondary)] text-[var(--secondary)]'
                  : 'border-[var(--white)] text-[var(--white)] hover:bg-[var(--white)] hover:text-[var(--secondary)]'
                  }`}
              >
                <Shield size={14} /> Panel Admin
              </Link>
            )}

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className={`flex items-center gap-2 border-l pl-6 transition-colors duration-500 ${isScrolled ? 'border-[var(--border)]' : 'border-[var(--white)]/30'
                }`}>
                <User size={20} className="text-[var(--primary)]" />
                <span className="text-sm font-semibold">{user.name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className={`bg-transparent border-none cursor-pointer flex items-center ml-2 transition-colors duration-500 ${isScrolled ? 'text-[var(--text-muted)]' : 'text-[var(--white)]/70 hover:text-[var(--white)]'
                    }`}
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/booking" target="_blank" rel="noopener noreferrer" className="btn btn-primary py-2.5 px-6 text-sm rounded-md">
                Reservar
              </Link>
            )}
          </nav>

          {/* Botón menú móvil (Hereda color automáticamente) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="block md:hidden bg-transparent border-none cursor-pointer"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Enlaces Menú Móvil */}
        {isMenuOpen && (
          <div className="glass-panel animate-fade-in absolute top-full left-0 right-0 p-8 flex flex-col gap-6 border-b border-[var(--border)] text-[var(--text-main)]">
            <Link to="/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            <Link to="/rooms" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>Habitaciones</Link>
            <Link to="/booking" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>Reservar</Link>
            {isAdmin && (
              <Link to="/admin" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="text-[var(--primary)] font-bold">
                Panel Administrativo
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
                <span>Hola, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-outline py-1.5 px-4">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="btn btn-primary text-center w-full">
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Contenido Principal */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--secondary-hover)', borderTop: '1px solid var(--border)', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
            <div>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Hotel Casa Dolores</h3>
              <p style={{ color: 'var(--white)', fontSize: '0.95rem', maxWidth: '300px' }}>
                Un refugio de elegancia e historia en el corazón de Dolores Hidalgo, Guanajuato. Descubre la calidez y hospitalidad mexicana en su máxima expresión.
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Contacto</h3>

              {/* Dirección */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <svg className="w-6 h-6" style={{ flexShrink: 0, color: 'var(--gold)' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clipRule="evenodd" />
                </svg>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem', margin: 0 }}>
                  Av. San Luis Potosí 22, Centro, 37800 Dolores Hidalgo, C.I.N, Gto.
                </p>
              </div>

              {/* Teléfono */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <svg className="w-6 h-6 " style={{ flexShrink: 0, color: 'var(--gold)' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z" />
                </svg>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem', margin: 0 }}>
                  4181775155
                </p>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg className="w-6 h-6" style={{ flexShrink: 0, color: 'var(--gold)' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.038 5.61A2 2 0 0 1 4 4h16a2 2 0 0 1 1.962 1.61l-9.333 7A2 2 0 0 1 11.37 13l-9.332-7Z" />
                  <path d="M1.057 7.985A2 2 0 0 0 1 8.667V18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8.667a2 2 0 0 0-.057-.682l-9.317 6.988a4 4 0 0 1-4.8 0L1.057 7.985Z" />
                </svg>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem', margin: 0 }}>
                  casadoloreshidalgohotel@gmail.com
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>Enlaces</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--white)' }}>
                <li><Link to="/" target="_blank" rel="noopener noreferrer">Inicio</Link></li>
                <li><Link to="/rooms" target="_blank" rel="noopener noreferrer">Habitaciones</Link></li>
                <li><Link to="/booking" target="_blank" rel="noopener noreferrer">Reservar Ahora</Link></li>
                <li><Link to="/login" target="_blank" rel="noopener noreferrer">Área del Personal</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--gold)', paddingTop: '2rem', textAlign: 'center', color: 'var(--white)', fontSize: '0.85rem' }}>
            <p>&copy; {new Date().getFullYear()} Hotel Casa Dolores Hidalgo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botones flotantes (WhatsApp y Servicios y Emergencia) */}
      <WhatsAppButton />
      <InterestContactsModal />
    </div>
  );
};