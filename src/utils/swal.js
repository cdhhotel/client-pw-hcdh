import Swal from 'sweetalert2';

/**
 * Muestra un cuadro de confirmación personalizado con SweetAlert2
 */
export const showConfirmAlert = async ({
    title = '¿Estás seguro?',
    text = 'Esta acción no se puede deshacer',
    icon = 'warning', // 'warning' | 'error' | 'success' | 'info' | 'question'
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar',
    confirmButtonColor = '#3d2b1f',
    cancelButtonColor = '#6b7280'
}) => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        focusCancel: false,
        customClass: {
            popup: 'swal2-hotel-popup',
            confirmButton: 'swal2-hotel-confirm-btn',
            cancelButton: 'swal2-hotel-cancel-btn'
        }
    });

    return result.isConfirmed;
};

/**
 * Muestra una alerta de éxito con SweetAlert2
 */
export const showSuccessAlert = (title = '¡Éxito!', text = '') => {
    return Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonColor: '#3d2b1f',
        confirmButtonText: 'Aceptar'
    });
};

/**
 * Muestra una alerta de error con SweetAlert2
 */
export const showErrorAlert = (title = 'Error', text = '') => {
    return Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Cerrar'
    });
};

export default Swal;
