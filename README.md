src/
├── app/                      # Configuración central de la app
│   ├── routes/               # Definición central de rutas (React Router)
│   ├── store/                # Configuración global del store (Zustand/Redux)
│   ├── providers/            # Wrappers de Context (Theme, Auth, QueryClient)
│   └── config/               # Variables de entorno, i18n, constantes globales
│
├── layouts/                  # Layouts anidados (AuthLayout, DashboardLayout)
│
├── features/                 # ¡EL CORAZÓN DE LA APP! Módulos de negocio
│   ├── auth/                 # Feature de Autenticación
│   │   ├── components/       # (LoginForm, RegisterForm)
│   │   ├── hooks/            # (useAuth, useLogin)
│   │   ├── services/         # (authAPI.ts -> login, register, logout)
│   │   ├── types/            # (User, LoginCredentials)
│   │   ├── schemas/          # (loginSchema, registerSchema) con Zod
│   │   └── store/            # Estado local de auth (user, token)
│   ├── rooms/                # Feature de Habitaciones
│   ├── reservations/         # Feature de Reservaciones
│   └── ... (dashboard, payments)
│
├── pages/                    # Páginas públicas/privadas (Home, Contacto)
│   # Nota: Las páginas complejas solo "componen" features.
│   # Ej: DashboardPage -> usa <ReservationList /> de features/reservations
│
├── components/               # UI Genérica (Atomic Design)
│   ├── ui/                   # Components: Button, Input, Badge, Card
│   ├── layouts/              # Header, Footer, Sidebar
│   └── feedback/             # Toast, Modal, Skeleton
│
├── services/                 # Servicios globales (HTTP, Analytics, Notifications)
│   ├── api/                  # Cliente Axios, interceptores
│   └── lib/                  # utils externos (date-fns, currency)
│
├── hooks/                    # Hooks globales reusables (useMediaQuery, useDebounce)
├── utils/                    # helpers (formatCurrency, validateEmail)
├── types/                    # Tipos globales (ApiResponse, PaginatedResult)
├── constants/                # constants (navLinks, roomTypes, httpStatus)
└── assets/                   # imágenes, fuentes, estilos globales (Tailwind)