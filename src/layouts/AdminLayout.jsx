import { useState } from 'react';
import { Navigate, Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { LayoutDashboard, Calendar, Bed, LogOut, Home, Shield, Menu, X, User } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-linen)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Cargando Panel...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
    color: isActive ? '#fff' : 'var(--text-main)',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s',
  });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/casa-dolores" onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', textDecoration: 'none' }}>
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
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 'bold', lineHeight: 1.2 }}>Casa Dolores</div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 600 }}>Panel de Control</div>
          </div>
        </Link>
        {/* Botón cerrar en móvil */}
        <button
          onClick={closeSidebar}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
          className="sidebar-close-btn"
          aria-label="Cerrar menú"
        >
          <X size={22} />
        </button>
      </div>

      {/* Navegación */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1 }}>
        <NavLink to="/admin" end style={navLinkStyle} onClick={closeSidebar}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/admin/reservations" style={navLinkStyle} onClick={closeSidebar}>
          <Calendar size={18} /> Reservaciones
        </NavLink>
        <NavLink to="/admin/rooms" style={navLinkStyle} onClick={closeSidebar}>
          <Bed size={18} /> Habitaciones
        </NavLink>
        {user?.role === 'admin-sistema' && (
          <NavLink to="/admin/hotels" style={navLinkStyle} onClick={closeSidebar}>
            <Shield size={18} /> Hotel
          </NavLink>
        )}
        <NavLink to="/admin/users" style={navLinkStyle} onClick={closeSidebar}>
          <Shield size={18} /> Usuarios
        </NavLink>
        <NavLink to="/admin/itinerary" style={navLinkStyle} onClick={closeSidebar}>
          <Shield size={18} /> Actividades
        </NavLink>
      </nav>

      {/* Pie del sidebar */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link
          to="/casa-dolores"
          onClick={closeSidebar}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderRadius: 'var(--border-radius-sm)', color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'none' }}
        >
          <Home size={17} /> Volver a Casa Dolores
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderRadius: 'var(--border-radius-sm)', border: 'none', background: 'none', color: '#c15c3d', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, width: '100%', textAlign: 'left' }}
        >
          <LogOut size={17} /> Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-linen)' }}>

      {/* ── Overlay oscuro en móvil ── */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            backgroundColor: 'rgba(20,12,6,0.45)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar (desktop: fijo | móvil: drawer) ── */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-sand)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.75rem 1.25rem',
        // En móvil se convierte en drawer (posicionado fuera de flujo)
        position: undefined,
      }}
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}
      >
        <SidebarContent />
      </aside>

      {/* ── Área de contenido ── */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Header */}
        <header style={{
          backgroundColor: 'var(--bg-sand)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          height: '60px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Hamburger — solo visible en móvil */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="admin-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: '0.4rem', borderRadius: '6px', display: 'none' }}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          {/* Título en móvil */}
          <span className="admin-mobile-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)', display: 'none' }}>
            Admin Panel
          </span>

          {/* Usuario */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || 'Administrador'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email || 'admin@casadolores.com'}</div>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
            }}>
              AD
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main style={{ padding: '2rem 2.5rem', flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }} className="admin-main">
          <Outlet />
        </main>
      </div>

      {/* Estilos responsivos del layout admin */}
      <style>{`
        /* ── Sidebar como drawer en móvil ── */
        @media (max-width: 767px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            left: -260px;
            height: 100vh;
            width: 240px !important;
            z-index: 50;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            box-shadow: 4px 0 24px rgba(20,12,6,0.18);
          }
          .admin-sidebar--open {
            left: 0 !important;
          }
          .sidebar-close-btn {
            display: flex !important;
          }
          .admin-hamburger {
            display: flex !important;
          }
          .admin-mobile-title {
            display: block !important;
          }
          .admin-main {
            padding: 1.25rem 1rem !important;
          }
        }
        @media (min-width: 768px) {
          .admin-sidebar {
            position: sticky !important;
            top: 0;
            height: 100vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
};
