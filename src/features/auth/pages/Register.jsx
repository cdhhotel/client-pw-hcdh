import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../app/AuthContext';
import { UserPlus, Mail, Key, Phone, User, AlertTriangle, CheckCircle } from 'lucide-react';

export const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await register(form.nombre, form.apellidos, form.email, form.telefono, form.password);
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="animate-fade-in"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                padding: '3rem 1.5rem',
            }}
        >
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '875px',
                    padding: '2.5rem',
                    borderRadius: 'var(--border-radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Encabezado */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(193, 92, 61, 0.1)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}
                    >
                        <UserPlus size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Crear cuenta</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Completa tus datos para registrarte
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        style={{
                            backgroundColor: 'rgba(193, 92, 61, 0.12)',
                            color: '#a3482d',
                            border: '1px solid rgba(193, 92, 61, 0.3)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--border-radius-sm)',
                            fontSize: '0.85rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    {/* Nombre y Apellidos en fila */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <User size={12} /> Nombre
                            </label>
                            <input
                                id="register-nombre"
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Juan"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <User size={12} /> Apellidos
                            </label>
                            <input
                                id="register-apellidos"
                                type="text"
                                name="apellidos"
                                value={form.apellidos}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="García"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Mail size={12} /> Correo Electrónico
                        </label>
                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="nombre@hotel.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={12} /> Teléfono
                        </label>
                        <input
                            id="register-telefono"
                            type="tel"
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="+52 (xxx) xxx-xxxx"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Key size={12} /> Contraseña
                        </label>
                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={12} /> Confirmar Contraseña
                        </label>
                        <input
                            id="register-confirm-password"
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Repite tu contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        id="register-submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.85rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>

                {/* Enlace a login */}
                <div
                    style={{
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border)',
                        textAlign: 'center',
                    }}
                >
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)' }}>
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};