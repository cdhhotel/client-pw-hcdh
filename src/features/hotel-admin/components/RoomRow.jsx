import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { sendCleaningWhatsAppNotification } from '../../../services/cleaningService';

export const RoomRow = ({ room, hotelName, onEdit, onDelete }) => {
    const imgList = room.atributos_extra?.imagenes || [];
    const firstImg = imgList.length > 0 ? imgList[0] : null;

    return (
        <tr key={room.id}>
            {/* Foto — sin etiqueta en móvil */}
            <td data-label="">
                {firstImg ? (
                    <img
                        src={firstImg}
                        alt={`Habitación ${room.numero}`}
                        className="w-[70px] h-[50px] object-cover rounded border border-[var(--border)]"
                    />
                ) : (
                    <div className="w-[70px] h-[50px] rounded border border-[var(--border)] bg-[rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-[var(--text-muted)] text-[0.65rem] gap-0.5">
                        <ImageIcon size={16} />
                        <span>Sin foto</span>
                    </div>
                )}
            </td>

            {/* Número / Nombre */}
            <td data-label="Habitación">
                <div className="font-semibold text-[var(--primary)] text-base">
                    Hab. #{room.numero}
                </div>
                {room.nombre && (
                    <div className="text-xs text-[var(--text-muted)] font-normal mt-0.5">
                        {room.nombre}
                    </div>
                )}
            </td>

            {/* Tipo */}
            <td data-label="Tipo" className="capitalize text-sm font-medium">
                {room.tipo_habitacion}
            </td>

            {/* Hotel */}
            <td data-label="Hotel" className="text-sm font-medium text-[var(--text-muted)]">
                {hotelName}
            </td>

            {/* Capacidad / Camas */}
            <td data-label="Capacidad" className="text-xs text-[var(--text-muted)]">
                <div>Max. {room.capacidad_maxima} pers.</div>
                <div>{room.numero_camas} camas ({room.tipo_camas || 'N/A'})</div>
            </td>

            {/* Precio */}
            <td data-label="Precio" className="font-semibold text-sm">
                ${Number(room.precio_base_noche).toLocaleString()} MXN
            </td>

            {/* Estatus */}
            <td data-label="Estatus">
                {room.estatus === 'disponible' && <span className="badge badge-success">Disponible</span>}
                {room.estatus === 'limpieza' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-info" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.3)' }}>Limpieza</span>
                        {/* <button
                            type="button"
                            onClick={() => sendCleaningWhatsAppNotification(room.numero, room.nombre)}
                            title="Avisar limpieza por WhatsApp"
                            style={{
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.7rem',
                                backgroundColor: '#25D366',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            WhatsApp
                        </button> */}
                    </div>
                )}
                {room.estatus === 'mantenimiento' && <span className="badge badge-warning">Mantenimiento</span>}
                {room.estatus === 'ocupada' && <span className="badge badge-danger">Ocupada</span>}
            </td>

            {/* Acciones — sin etiqueta en móvil */}
            <td data-label="" className="text-right">
                <div className="inline-flex gap-2">
                    <button
                        className="btn btn-outline p-2 border-none"
                        onClick={() => onEdit(room)}
                        title="Editar"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        className="btn btn-outlines p-2 border-none text-[#c15c3d]"
                        onClick={() => onDelete(room.id, room.numero)}
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};