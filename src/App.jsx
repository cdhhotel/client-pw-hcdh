import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { Booking } from './pages/Booking';
import { Login } from './pages/Login';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Reservations as AdminReservations } from './pages/admin/Reservations';
import { Rooms as AdminRooms } from './pages/admin/Rooms';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas del Sitio Web */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="booking" element={<Booking />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Rutas Administrativas Protegidas */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="rooms" element={<AdminRooms />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
