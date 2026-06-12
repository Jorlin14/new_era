/**
 * Order Controller — New Era Supermercado
 *
 * Creación y gestión de pedidos.
 * Los permisos de cambio de estado varían según el rol del usuario.
 *
 * @module controllers/order
 */

import * as orderService from '../services/order.service.js';
import * as wompiService from '../services/wompi.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import prisma from '../config/database.js';


/** Estados que puede actualizar un repartidor */
const DELIVERER_ALLOWED = ['DISPATCHED', 'DELIVERED'];

/** Estados que puede actualizar personal de tienda */
const STAFF_ALLOWED = ['PAID', 'PREPARING', 'CANCELLED'];

/** POST /api/orders — Crear pedido (usuario autenticado) */
export const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrder(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: '¡Pedido creado exitosamente!',
      data: result.order,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/orders/mine — Pedidos del usuario autenticado */
export const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user.id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/** GET /api/orders — Todos los pedidos (ADMIN / CASHIER / DELIVERER) */
export const getAllOrders = async (req, res, next) => {
  try {
    // Si es DELIVERER, solo mostrar órdenes asignadas o disponibles para tomar
    if (req.user.role === 'DELIVERER') {
      const result = await orderService.getDelivererOrders(req.user.id, req.query);
      return res.status(200).json({ success: true, ...result });
    }
    
    // Para ADMIN y CASHIER, mostrar todas las órdenes
    const result = await orderService.getAllOrders(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/orders/:id/status — Cambiar estado del pedido */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role === 'DELIVERER' && !DELIVERER_ALLOWED.includes(status)) {
      throw new AppError(`Como repartidor, solo puedes actualizar a: ${DELIVERER_ALLOWED.join(', ')}.`, 403);
    }

    if (['ADMIN', 'CASHIER'].includes(req.user.role) && !STAFF_ALLOWED.includes(status)) {
      throw new AppError(`Tu rol operativo solo puede actualizar a: ${STAFF_ALLOWED.join(', ')}.`, 403);
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status, req.user.id);

    res.status(200).json({
      success: true,
      message: `Estado de la orden actualizado a ${status}.`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/orders/:id/accept — Aceptar pedido (DELIVERER) */
export const acceptOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'DELIVERER') {
      throw new AppError('Solo los domiciliarios pueden aceptar pedidos directamente.', 403);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Orden no encontrada.', 404);

    if (order.delivererId) {
      throw new AppError('Este pedido ya fue tomado por otro domiciliario.', 400);
    }

    if (order.status !== 'PREPARING') {
      throw new AppError('Solo se pueden aceptar pedidos que ya estén en preparación.', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { delivererId: req.user.id },
    });

    res.status(200).json({
      success: true,
      message: '¡Has aceptado el pedido exitosamente!',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/orders/:id/wompi-signature — Obtener firma de Wompi para una orden */
export const getWompiSignature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id, customerId: req.user.id },
    });

    if (!order) {
      throw new AppError('Orden no encontrada.', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError(`La orden ya está en estado ${order.status}.`, 400);
    }

    // El monto debe estar en centavos para Wompi
    const amountInCents = Math.round(parseFloat(order.total) * 100);
    const signature = wompiService.generateIntegritySignature(order.id, amountInCents);

    res.status(200).json({
      success: true,
      data: {
        signature,
        amountInCents,
        reference: order.id,
        publicKey: process.env.WOMPI_PUBLIC_KEY,
      },
    });

  } catch (error) {
    next(error);
  }
};

/** POST /api/orders/webhook/wompi — Webhook de Wompi */
export const handleWompiWebhook = async (req, res, next) => {
  try {
    const receivedHash = req.headers['wompi_hash'];
    
    // 1. Verificar autenticidad
    const isValid = wompiService.verifyWebhookHash(req.body, receivedHash);
    if (!isValid) {
      console.warn('Webhook de Wompi recibido con hash inválido');
      return res.status(401).json({ success: false, message: 'Invalid hash' });
    }

    const { data: { transaction }, event } = req.body;

    // Solo nos interesan actualizaciones de transacciones
    if (event !== 'transaction.updated') {
      return res.status(200).json({ success: true });
    }

    // 2. Procesar según el estado de la transacción
    // Estados Wompi: APPROVED, DECLINED, VOIDED, ERROR
    if (transaction.status === 'APPROVED') {
      const orderId = transaction.reference;
      
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      
      if (order && order.status === 'PENDING') {
        await orderService.updateOrderStatus(orderId, 'PAID', 'SYSTEM_WOMPI');
        console.log(`Orden ${orderId} marcada como PAGADA vía Wompi`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de Wompi:', error);
    // Respondemos 200 para evitar que Wompi reintente infinitamente si es un error lógico nuestro,
    // pero logueamos el error.
    res.status(200).json({ success: false, message: 'Error processing webhook' });
  }
};

