import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

export const RoomRow = ({ room, hotelName, onEdit, onDelete }) => {
    const imgList = room.atributos_extra?.imagenes || [];
    const firstImg = imgList.length > 0 ? imgList[0] : null;

    return (
        <tr key={room.id}>
            <td>
                {firstImg ? (
                    <img
                        src={firstImg}
                        alt={`Habitación ${room.numero}`}
                        className="w-[70px] h-[50px] object-cover border border-[var(--border)]"
                    />
                ) : (
                    <div className="w-[70px] h-[50px] bg-[var(--bg-linen)] flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)]">
                        <ImageIcon size={18} />
                    </div>
                )}
            </td>
            <td className="font-bold text-base text-[var(--secondary)]">{room.numero}</td>
            <td>
                <div className="font-semibold">{room.nombre || 'Sin nombre'}</div>
                <div className="text-xs text-[var(--text-muted)] capitalize">{room.tipo_habitacion}</div>
            </td>
            <td className="text-sm text-[var(--text-muted)]">{hotelName}</td>
            <td className="text-sm">
                <div>Max: {room.capacidad_maxima} pers.</div>
                <div className="text-xs text-[var(--text-muted)]">
                    {room.numero_camas} camas ({room.tipo_camas || 'N/A'})
                </div>
            </td>
            <td className="font-semibold text-[var(--primary)]">
                ${Number(room.precio_base_noche).toLocaleString()} MXN
            </td>
            <td>
                {room.estatus === 'disponible' && <span className="badge badge-success">Disponible</span>}
                {room.estatus === 'mantenimiento' && <span className="badge badge-warning">Mantenimiento</span>}
                {room.estatus === 'ocupada' && <span className="badge badge-danger">Ocupada</span>}
            </td>
            <td className="text-right">
                <div className="inline-flex gap-2">
                    <button
                        className="btn btn-outline p-2 border-none"
                        onClick={() => onEdit(room)}
                        title="Editar"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        className="btn btn-outline p-2 border-none text-[#c15c3d]"
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