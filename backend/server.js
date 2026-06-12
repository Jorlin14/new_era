/**
 * Server Entry Point — New Era Supermercado
 *
 * Punto de entrada de la API REST.
 * Configura seguridad, CORS, rate limiting, archivos estáticos y rutas.
 *
 * @module server
 */

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

import apiRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import prisma from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOrigin = frontendUrl === '*' ? '*' : [frontendUrl, 'http://localhost:3000'];

// CREACIÓN DEL SERVIDOR HTTP Y SOCKET.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// EVENTOS DE SOCKET.IO PARA RASTREO GPS
io.on('connection', (socket) => {
  console.log(`[Socket] Nuevo cliente conectado: ${socket.id}`);

  // Unir a un cliente (usuario o domiciliario) a la sala de su pedido
  socket.on('join_order_room', ({ orderId }) => {
    if (!orderId) return;
    const roomName = `order_${orderId}`;
    socket.join(roomName);
    console.log(`[Socket] Cliente ${socket.id} unido a sala: ${roomName}`);
  });

  // Recibir ubicación del domiciliario y retransmitirla al cliente
  socket.on('update_location', (data) => {
    const { orderId, lat, lng } = data;
    if (!orderId || lat === undefined || lng === undefined) return;
    
    // Enviar evento a todos en la sala (excepto al remitente)
    socket.to(`order_${orderId}`).emit('location_updated', { lat, lng });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Cliente desconectado: ${socket.id}`);
  });
});

// SECURITY
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:4000", "http://localhost:3000"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en 15 minutos.',
  },
});
app.use('/api', limiter);

// LOGGING
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// BODY PARSERS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// SERVE STATIC FILES (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API ROUTES
app.use('/api', apiRouter);

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada.`,
  });
});

// ERROR HANDLER
app.use(errorHandler);

// START SERVER
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    httpServer.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
};

// GRACEFUL SHUTDOWN
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\nServidor cerrado y BD desconectada.');
  process.exit(0);
});

startServer();
