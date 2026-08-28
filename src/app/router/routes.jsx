import { Route } from "react-router-dom";



import { MainLayout } from "../../layouts/MainLayout";
import { AdminLayout } from "../../layouts/AdminLayout";

// rutas publicas
import { Home } from "../../features/public/pages/Home";
import { Rooms } from "../../features/rooms/pages/Rooms";
import { Booking } from "../../features/booking/pages/Booking";
import { AboutUs } from "../../features/public/pages/AboutUs";
import { Login } from "../../features/auth/pages/Login";
import { Contacto } from "../../features/public/pages/Contacto";

// rutas para admin de hotel
import { Dashboard } from "../../features/hotel-admin/pages/Dashboard";
import { Reservations } from "../../features/hotel-admin/pages/Reservations";

// rutas para super admin
import { SystemDashboard } from "../../features/system-admin/pages/Dashboard";
import { Hotels } from "../../features/system-admin/pages/Hotels";
import { Reservations } from "../../features/system-admin/pages/Reservations";
import { Users } from "../../features/system-admin/pages/Users";

import { PrivateRoute } from "./PrivateRoute";
import { RoleRoute } from "./RoleRoute";

import { ROLES } from "../../shared/constants/roles";

export const AppRoutes = () => {
    return (
        <>
            {/* PUBLICAS */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="booking" element={<Booking />} />
                <Route path="sobre-nosotros" element={<AboutUs />} />
                <Route path="login" element={<Login />} />
                <Route path="contacto" element={<Contacto />} />
            </Route>

            {/* ADMIN HOTEL */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <RoleRoute role={ROLES.HOTEL_ADMIN}>
                            <AdminLayout />
                        </RoleRoute>
                    </PrivateRoute>
                }
            >
                <Route index element={<Dashboard />} />

                <Route
                    path="reservations"
                    element={<Reservations />}
                />

                <Route
                    path="rooms"
                    element={<div>Rooms Management</div>}
                />
            </Route>

            {/* SYSTEM ADMIN */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <RoleRoute role={ROLES.SYSTEM_ADMIN}>
                            <AdminLayout />
                        </RoleRoute>
                    </PrivateRoute>
                }
            >
                <Route index element={<SystemDashboard />} />

                <Route path="hotels" element={<Hotels />} />

                <Route path="users" element={<Users />} />
            </Route>
        </>
    );
};