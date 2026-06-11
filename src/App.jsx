import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './features/public/pages/Home';
import { Rooms } from './features/rooms/pages/Rooms';
import { Booking } from './features/booking/pages/Booking';
import { Login } from './features/auth/pages/Login';
import { Dashboard as AdminDashboard } from './features/system-admin/pages/Dashboard';
import { Reservations as AdminReservations } from './features/reservations/Reservations';
// AdminRooms: './features/hotel-admin/pages/' está vacío — página pendiente de crear

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
            {/* <Route path="rooms" element={<AdminRooms />} /> — pendiente de crear */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
