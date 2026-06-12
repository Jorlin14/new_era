# New Era Supermercado

New Era Supermercado es una plataforma moderna e integral de comercio electrónico y logística, diseñada específicamente para la entrega de víveres a domicilio. La aplicación cuenta con un sólido sistema de control de acceso basado en roles, rastreo de geolocalización en tiempo real para las entregas y una integración de pagos de alta seguridad.

## Arquitectura del Proyecto

El sistema está construido bajo una arquitectura desacoplada de alto rendimiento:

- **Frontend:** Next.js (App Router), React, TailwindCSS.
- **Backend:** Node.js, Express.js, Prisma ORM.
- **Base de Datos:** PostgreSQL (alojada en Supabase).
- **Integraciones de Terceros:** Wompi (Pasarela de Pagos), Leaflet (Rastreo GPS).

## Módulos y Roles del Sistema

El proyecto se divide en dominios funcionales adaptados a roles operativos específicos:

1. **Cliente (Customer)**
   - Exploración del catálogo de productos y gestión del carrito de compras.
   - Gestión de direcciones de entrega con coordenadas GPS.
   - Seguimiento del estado del pedido en tiempo real.
   - Flujo de pago seguro procesado a través de Wompi.

2. **Cajero (Cashier)**
   - Gestión del flujo de las órdenes (Pendiente -> Pagado -> En Preparación).
   - Validación del éxito o fracaso de las entregas despachadas.
   - Panel de métricas y vista general de la operación.

3. **Domiciliario (Deliverer)**
   - Recepción y asignación de órdenes preparadas.
   - Actualización de estado a Despachado al salir de la sede.
   - Interfaz de rastreo en tiempo real para visualizar la ruta de entrega.

4. **Administrador (Admin)**
   - Gestión integral de usuarios, empleados y roles.
   - Control de inventario, productos y categorías.
   - Configuración de banners promocionales.
   - Supervisión de métricas financieras y operativas.

## Guía de Configuración

### Prerrequisitos

- Node.js (versión 18 o superior).
- PostgreSQL.
- Gestor de paquetes: npm o yarn.

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd new_era
   ```

2. **Configuración del Backend:**
   ```bash
   cd backend
   npm install
   ```
   Asegúrate de configurar las variables de entorno en el archivo `backend/.env` basándote en el archivo de ejemplo proporcionado.
   
   Sincroniza la estructura de la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. **Configuración del Frontend:**
   ```bash
   cd frontend
   npm install
   ```
   Configura las variables de entorno en `frontend/.env.local`.
   Inicia la aplicación cliente:
   ```bash
   npm run dev
   ```

## Directrices de Desarrollo

- **Seguridad:** Mantener y respetar la protección de rutas basada en roles, tanto en los middlewares del backend como en los layouts del frontend.
- **Base de Datos:** Seguir el esquema definido en Prisma (`schema.prisma`) para todas las migraciones, relaciones y actualizaciones.
- **Diseño UI:** Preservar la modularidad de los componentes y depender del sistema de diseño unificado ( TailwindCSS y componentes compartidos en `/components`).

## Licencia

Este proyecto es de carácter propietario y confidencial. Queda estrictamente prohibida la copia, distribución o reproducción no autorizada de este código fuente.
