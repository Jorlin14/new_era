# New Era Supermercado

New Era Supermercado is a modern, full-stack e-commerce and logistics platform designed for grocery delivery. It features role-based access control, real-time geolocation tracking for deliveries, and seamless payment integration.

## Architecture

The project is built using a modern, decoupled architecture:

- **Frontend:** Next.js (App Router), React, TailwindCSS
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Integrations:** Wompi (Payments), Leaflet (Geolocation)

## Modules & Roles

The system is divided into functional domains tailored to specific operational roles:

1. **Customer (Client)**
   - Product browsing and cart management.
   - Address management with GPS coordinates.
   - Real-time order tracking.
   - Secure checkout with Wompi.

2. **Cashier**
   - Order pipeline management (Pending -> Paid -> Preparing).
   - Validation of successful or failed deliveries.
   - Quick statistics and dashboard overview.

3. **Deliverer (Domiciliario)**
   - Assignment of prepared orders.
   - Route tracking and geolocation updates.
   - Status updates (Dispatched).

4. **Administrator**
   - User and role management.
   - Inventory and product management.
   - Category and promotional banner configuration.
   - Full system metrics and oversight.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd new_era
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Configure your environment variables in `backend/.env` according to `backend/.env.example`.
   Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```
   Configure your environment variables in `frontend/.env.local`.
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Development Guidelines

- Maintain strict role-based route protection on both backend middleware and frontend layouts.
- Follow the established Prisma schema for all database migrations and updates.
- Keep components modular and rely on the shared UI utilities in the `components/` directory.

## License

This project is proprietary and confidential. Unauthorized copying or distribution of this codebase is strictly prohibited.
