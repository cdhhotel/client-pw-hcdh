import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Hotel, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../app/AuthContext';
import { WhatsAppButton } from '../components/WhatsAppButton';

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
      {/* Header*/}
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center transition-all duration-500 ease-in-out px-8 ${isScrolled
          ? 'bg-[var(--bg-linen)] shadow-md border-b border-[var(--border)] h-20'
          : 'bg-transparent border-b border-transparent h-28'
          }`}
      >
        <div className="container mx-auto flex justify-between items-center w-full">
          {/* Logo y Nombre */}
          <Link to="/" className="flex items-center gap-2 text-[var(--text-main)]">
            <Hotel size={32} className="animate-fade-in text-[var(--primary)]" />
            <span style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-bold tracking-wide">
              Casa Dolores Hidalgo
            </span>
          </Link>

          {/* Navbar habitaciones */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `font-medium pb-1 border-b-2 transition-colors ${isActive
                  ? 'text-[var(--primary)] border-[var(--primary)]'
                  : 'text-[var(--text-main)] border-transparent hover:text-[var(--primary)]'
                }`
              }
            >
              Habitaciones
            </NavLink>

            {/* Admin Acceso */}
            {isAdmin && (
              <Link
                to="/admin"
                className="btn btn-outline py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Shield size={14} /> Panel Admin
              </Link>
            )}

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-[var(--border)] pl-6">
                <User size={20} className="text-[var(--primary)]" />
                <span className="text-sm font-semibold">{user.name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="bg-transparent border-none cursor-pointer flex items-center text-[var(--text-muted)] ml-2"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary py-2.5 px-6 text-sm rounded-md">
                Iniciar Sesión
              </Link>
            )}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="block md:hidden bg-transparent border-none cursor-pointer text-[var(--text-main)]"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Enlaces */}
        {isMenuOpen && (
          <div className="glass-panel animate-fade-in absolute top-full left-0 right-0 p-8 flex flex-col gap-6 border-b border-[var(--border)]">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            <Link to="/rooms" onClick={() => setIsMenuOpen(false)}>Habitaciones</Link>
            <Link to="/booking" onClick={() => setIsMenuOpen(false)}>Reservar</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-[var(--primary)] font-bold">
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
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-primary text-center w-full">
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

              {/* Dirección */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" style={{ flexShrink: 0 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clipRule="evenodd" />
                </svg>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                  Av. San Luis Potosí 22, Centro, 37800 Dolores Hidalgo, C.I.N, Gto.
                </p>
              </div>

              {/* Teléfono */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" style={{ flexShrink: 0 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z" />
                </svg>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                  4181775155
                </p>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" style={{ flexShrink: 0 }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.038 5.61A2 2 0 0 1 4 4h16a2 2 0 0 1 1.962 1.61l-9.333 7A2 2 0 0 1 11.37 13l-9.332-7Z" />
                  <path d="M1.057 7.985A2 2 0 0 0 1 8.667V18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8.667a2 2 0 0 0-.057-.682l-9.317 6.988a4 4 0 0 1-4.8 0L1.057 7.985Z" />
                </svg>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                  casadoloreshidalgohotel@gmail.com
                </p>
              </div>
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

      {/* Botón flotante WhatsApp */}
      <WhatsAppButton />
    </div>
  );
};