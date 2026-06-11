## Arquitectura del Proyecto

El proyecto sigue una arquitectura basada en características (Feature-Based Architecture), donde cada módulo funcional encapsula sus páginas, componentes, hooks y servicios.

### app

Configuración global de la aplicación, incluyendo rutas, proveedores y estado global.

### assets

Recursos estáticos como imágenes, iconos y videos.

### shared

Elementos reutilizables por toda la aplicación, como componentes genéricos, hooks, utilidades, constantes y configuración de servicios.

### features

Contiene la lógica de negocio organizada por módulos funcionales:

* auth: autenticación y autorización.
* rooms: gestión y consulta de habitaciones.
* reservations: reservaciones.
* payments: integración de pagos.
* hotel-admin: funcionalidades del administrador de hotel.
* system-admin: funcionalidades del administrador global.
* public: páginas públicas visibles para cualquier visitante.

### layouts

Plantillas reutilizables para diferentes áreas del sistema.

### styles

Estilos globales, variables CSS y animaciones.

