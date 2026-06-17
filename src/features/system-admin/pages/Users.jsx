import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"; // Asegúrate de instalar heroicons
import { useAuth } from '../../../app/AuthContext';
import { userService } from '../services/users.service';

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();
    const hotelId = user?.hotel_id || "6547a35d-d6d8-4b4a-80f7-aed8c8885811";

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await userService.getAll();
            // El servidor retorna { success: true, data: [...] }
            const list = res?.data ?? res;
            setUsers(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message || 'No se pudo cargar la información de los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="max-w-full py-section">
            <div className="container">
                {/* Header de la sección */}
                <div className="text-center mb-8">
                    <h1 className="section-title">Usuarios</h1>
                    <p className="section-subtitle">
                        Gestión completa de usuarios registrados
                    </p>
                </div>

                {/* Estado de carga */}
                {loading && (
                    <div className="text-center py-12 text-muted">
                        Cargando usuarios...
                    </div>
                )}

                {/* Estado de error */}
                {error && (
                    <div className="text-center py-8 text-red-500">
                        {error}
                    </div>
                )}

                {/* Contenedor de la tabla con estilo premium */}
                {!loading && !error && (
                    <div className="admin-table-container animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Contacto</th>
                                        <th>Rol</th>
                                        <th>Última conexión</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="font-medium text-secondary">
                                                    {user.nombre} {user.apellidos}
                                                </div>
                                                <div className="text-xs text-muted mt-1">
                                                    ID: {user.id}
                                                </div>
                                            </td>
                                            <td>
                                                <div>{user.email}</div>
                                                <div className="text-sm text-muted mt-1">
                                                    {user.telefono}
                                                </div>
                                            </td>
                                            <td className="text-muted">
                                                {user.rol?.nombre ?? '—'}
                                            </td>
                                            <td>
                                                <div>{user.ultima_conexion ? new Date(user.ultima_conexion).toLocaleDateString() : '—'}</div>
                                                <div className="text-xs text-muted mt-1">
                                                    {user.ultima_conexion ? new Date(user.ultima_conexion).toLocaleTimeString() : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.estatus
                                                    ? 'badge-success'
                                                    : 'badge-warning'
                                                    }`}>
                                                    {user.estatus ? 'activo' : 'inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        className="p-2 hover:bg-accent/10 rounded transition-all"
                                                        title="Ver detalles"
                                                    >
                                                        <EyeIcon className="w-4 h-4 text-accent" />
                                                    </button>
                                                    <button
                                                        className="p-2 hover:bg-primary/10 rounded transition-all"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="w-4 h-4 text-primary" />
                                                    </button>
                                                    <button
                                                        className="p-2 hover:bg-red-100 rounded transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <TrashIcon className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer de la tabla con información adicional */}
                        <div className="px-6 py-4 border-t border-border bg-bg-sand/20 flex justify-between items-center">
                            <div className="text-sm text-muted">
                                Mostrando {users.length} usuarios registrados
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline text-sm">
                                    Anterior
                                </button>
                                <button className="btn btn-primary text-sm">
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};