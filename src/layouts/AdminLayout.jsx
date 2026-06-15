import { Navigate, Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { LayoutDashboard, Calendar, Bed, LogOut, Home, Shield, User } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-linen)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Cargando Panel...</p>
      </div>
    );
  }

  // Redirigir a login si no está autenticado o no es administrador
  // Deshabilitado temporalmente: todos tienen acceso público
  /*
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  */

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-linen)' }}>
      {/* Sidebar de Administración */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sand)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Shield size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 'bold' }}>Casa Dolores Admin</span>
          </Link>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px', marginTop: '0.25rem', fontWeight: 600 }}>
            Panel de Control
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-main)',
              fontWeight: 500,
            })}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/admin/reservations"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-main)',
              fontWeight: 500,
            })}
          >
            <Calendar size={18} />
            Reservaciones
          </NavLink>

          <NavLink
            to="/admin/rooms"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-main)',
              fontWeight: 500,
            })}
          >
            <Bed size={18} />
            Habitaciones
          </NavLink>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            <Home size={18} />
            Volver al Sitio
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: 'none',
              color: '#c15c3d',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              width: '100%',
              textAlign: 'left',
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido de Administración */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Admin */}
        <header
          style={{
            height: '70px',
            backgroundColor: 'var(--bg-sand)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'Administrador'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email || 'admin@casadolores.com'}</div>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              AD
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main style={{ padding: '2.5rem', flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
