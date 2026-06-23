import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './features/public/pages/Home';
import { Rooms } from './features/rooms/pages/Rooms';
import { Booking } from './features/booking/pages/Booking';
import { Login } from './features/auth/pages/Login';
import { Dashboard as AdminDashboard } from './features/system-admin/pages/Dashboard';
import { Reservations as AdminReservations } from './features/reservations/Reservations';
import { Hotels } from './features/system-admin/pages/Hotels';
import { Register } from './features/auth/pages/Register';
import { Users } from './features/system-admin/pages/Users';
import { AdminRooms } from './features/hotel-admin/pages/AdminRooms';
import { AdminItinerary } from './features/hotel-admin/pages/AdminItinerary';
import { Itinerary } from './features/itinerary/pages/Itinerary';

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
            <Route path="itinerary" element={<Itinerary />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Rutas Administrativas Protegidas */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="users" element={<Users />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="itinerary" element={<AdminItinerary />} />
          </Route>

          {/* Redirecciones de conveniencia para accesos directos o erróneos */}
          <Route path="/Hotels" element={<Navigate to="/admin/hotels" replace />} />
          <Route path="/hotels" element={<Navigate to="/admin/hotels" replace />} />
          <Route path="/admin-sistema/hotels" element={<Navigate to="/admin/hotels" replace />} />
          <Route path="/admin-sistema/users" element={<Navigate to="/admin/users" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
