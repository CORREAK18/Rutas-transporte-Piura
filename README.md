# RutasPiura

Aplicación móvil de transporte público para la ciudad de Piura, Perú. Permite a los ciudadanos encontrar rutas de colectivos, combis y buses, visualizar sus recorridos en el mapa, ver paraderos oficiales y guardar sus rutas favoritas.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Framework móvil | Expo SDK 54 (React Native 0.81) |
| Navegación | Expo Router v6 (file-based routing) |
| Mapas | react-native-maps |
| Base de datos | Neon PostgreSQL (vía HTTP API) |
| Favoritos (local) | AsyncStorage |
| Autenticación | Sesión local en AsyncStorage + verificación bcrypt en Neon |

---

## Roles de usuario

| Rol | Cómo accede | Permisos |
|---|---|---|
| **Administrador** | Inicia sesión con credenciales de admin | Crear, editar y eliminar rutas. Acceso completo. |
| **Usuario registrado** | Crea una cuenta desde la pantalla de bienvenida | Ver rutas, ver mapa, guardar favoritos. |
| **Visitante** | Entra con el botón "Entrar como Visitante" | Ver rutas y mapa únicamente. Sin favoritos. |

> El administrador es único y no se puede crear desde la aplicación. Se inserta directamente en la base de datos.

---

## Estructura del proyecto

```
rutas-transporte/
├── app/
│   ├── welcome.js              # Pantalla de bienvenida (login / registro)
│   ├── _layout.js              # Layout raíz con redirección de sesión
│   └── (tabs)/
│       ├── index.js            # Home
│       ├── buscar-ruta.js      # Búsqueda de rutas
│       ├── resultados.js       # Resultados con radar de proximidad
│       ├── favoritos.js        # Rutas favoritas del usuario
│       ├── crear-ruta.js       # Formulario de creación/edición de ruta (admin)
│       ├── crear-ruta-mapa.js  # Mapa interactivo para trazar recorridos (admin)
│       ├── ruta/[routeId].js   # Detalle de una ruta
│       └── mapa/[routeId].js   # Visualización del mapa de una ruta
│
├── src/
│   ├── components/             # Componentes visuales reutilizables
│   │   ├── ActionButton.js
│   │   ├── AppScreen.js
│   │   ├── Card.js
│   │   ├── EmptyState.js
│   │   ├── InputField.js
│   │   ├── LoadingOverlay.js
│   │   ├── MapRoute.js
│   │   ├── RouteCard.js
│   │   ├── StatsGrid.js
│   │   └── StopTimeline.js
│   │
│   ├── controllers/            # Lógica de cada pantalla (hooks de estado)
│   │   ├── useHomeController.js
│   │   ├── useSearchController.js
│   │   ├── useResultsController.js
│   │   ├── useFavoritesController.js
│   │   ├── useRouteDetailController.js
│   │   ├── useRouteMapController.js
│   │   ├── useCreateRouteController.js
│   │   └── useCreateRouteMapController.js
│   │
│   ├── views/                  # Componentes de pantalla (UI pura)
│   │   ├── HomeView.js
│   │   ├── SearchView.js
│   │   ├── ResultsView.js
│   │   ├── FavoritesView.js
│   │   ├── RouteDetailView.js
│   │   ├── RouteMapView.js
│   │   └── CreateRouteView.js
│   │
│   ├── services/               # Acceso a datos externos
│   │   ├── neonDb.js           # Cliente HTTP para Neon PostgreSQL
│   │   ├── authService.js      # Login, registro, sesión, logout
│   │   ├── localDb.js          # Operaciones CRUD sobre rutas y paraderos en Neon
│   │   ├── routeService.js     # Capa de negocio sobre rutas
│   │   └── favoriteService.js  # Favoritos por usuario (AsyncStorage local)
│   │
│   ├── config/
│   │   ├── theme.js            # Paleta de colores y tokens de diseño
│   │   └── navigation.js       # Rutas de navegación nombradas
│   │
│   ├── models/
│   │   └── route.js            # Modelo de datos de ruta
│   │
│   └── utils/
│       ├── search.js           # Algoritmo de proximidad y scoring de rutas
│       ├── strings.js          # Formateo de texto, distancias, dinero
│       └── routePathStore.js   # Store temporal para pasar trazado entre pantallas
│
├── neon_schema.sql             # Schema de la base de datos Neon
├── app.json                    # Configuración de Expo
└── package.json
```

---

## Base de datos

La base de datos está alojada en [Neon](https://neon.tech) (PostgreSQL serverless). La conexión se realiza sin drivers TCP nativos usando la API HTTP de Neon, lo que la hace compatible con React Native.

### Tablas

| Tabla | Descripción |
|---|---|
| `users` | Usuarios registrados con contraseña hasheada (bcrypt via `pgcrypto`) |
| `routes` | Rutas de transporte con trazado en coordenadas, tarifa, color y paraderos |
| `stops` | Paraderos con nombre, referencia y coordenadas |
| `route_stops` | Relación N:M entre rutas y paraderos con orden |

> Los **favoritos** no se guardan en la base de datos. Se almacenan localmente en el dispositivo del usuario mediante `AsyncStorage` para mayor privacidad y rapidez.

---

## Funcionalidades

### Para todos los usuarios
- Ver listado de rutas de Piura
- Buscar rutas por nombre, origen o destino
- Ver el mapa de una ruta con su recorrido y paraderos
- Radar de proximidad: escaneo visual que detecta rutas cercanas al usuario

### Para usuarios registrados (además de lo anterior)
- Guardar y quitar rutas de favoritos
- Ver su lista personal de favoritos

### Para el administrador (además de todo lo anterior)
- Crear nuevas rutas de transporte
- Trazar el recorrido de una ruta sobre un mapa interactivo
- Marcar paraderos oficiales sobre el mapa
- Editar rutas existentes (nombre, color, recorrido, paraderos)
- Eliminar rutas del sistema

---

## Instalación y ejecución local

### Requisitos previos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go instalado en el dispositivo móvil (o emulador Android/iOS)

### Pasos

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd rutas-transporte

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

Escanea el código QR con la app Expo Go en tu dispositivo para ejecutar la aplicación.

---

## Compilar APK (Android)

Para generar un APK instalable se usa EAS Build de Expo.

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar el proyecto (primera vez)
eas build:configure

# Construir APK de desarrollo/preview
eas build --platform android --profile preview
```

> Se requiere una cuenta gratuita en [expo.dev](https://expo.dev) para usar EAS Build.

---

## Variables de entorno

Toda variable considerada privada se encuentra en el archivo `.env`. Por seguridad, ese archivo no se encuentra en el repositorio.

---

## Autor

Desarrollado por **Krystopher Gianpablo Correa Juarez** — Piura, Perú, 2026.
