/**
 * Order Service — New Era Supermercado
 *
 * Creación de pedidos, cálculo de envío y transiciones de estado.
 *
 * @module services/order
 */

import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

// SHIPPING RATES
const SHIPPING = {
  BASE_FEE:          4_000,
  BASE_KM_THRESHOLD: 3,
  FEE_PER_EXTRA_KM:  1_000,
  MAX_COVERAGE_KM:   15,
  FREE_THRESHOLD:    100_000,
  FREE_MAX_KM:       5,
};

// SERIALIZE ORDER DECIMALS
const serializeOrder = (order) => ({
  ...order,
  total: parseFloat(order.total),
  items: order.items?.map((item) => ({
    ...item,
    unitPrice: parseFloat(item.unitPrice),
  })),
});

// CALCULATE SHIPPING
const calculateShipping = (distance, subtotal) => {
  if (distance > SHIPPING.MAX_COVERAGE_KM) {
    throw new AppError(
      `Fuera de cobertura. El máximo es ${SHIPPING.MAX_COVERAGE_KM} km. Tu distancia: ${distance} km.`,
      400
    );
  }

  const qualifiesFreeShipping =
    subtotal >= SHIPPING.FREE_THRESHOLD && distance <= SHIPPING.FREE_MAX_KM;

  if (qualifiesFreeShipping) return 0;

  const extraKm = Math.max(0, distance - SHIPPING.BASE_KM_THRESHOLD);
  return SHIPPING.BASE_FEE + Math.ceil(extraKm) * SHIPPING.FEE_PER_EXTRA_KM;
};

// VALID ORDER TRANSITIONS
const VALID_TRANSITIONS = {
  PENDING:    ['PAID', 'CANCELLED'],
  PAID:       ['PREPARING', 'CANCELLED'],
  PREPARING:  ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED', 'CANCELLED'],
  DELIVERED:  [],
  CANCELLED:  [],
};

// CREATE ORDER
export const createOrder = async (customerId, { addressId, distance, items }) => {
  // VERIFY ADDRESS OWNERSHIP
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: customerId },
  });

  if (!address) {
    throw new AppError('La dirección no existe o no te pertenece.', 404);
  }

  // FETCH PRODUCTS
  const productIds = items.map((item) => item.productId);

  const productsInDB = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, stock: true },
  });

  // CHECK PRODUCT AVAILABILITY
  if (productsInDB.length !== productIds.length) {
    const foundIds = new Set(productsInDB.map((p) => p.id));
    const missingIds = productIds.filter((id) => !foundIds.has(id));
    throw new AppError(
      `Los siguientes productos no están disponibles: ${missingIds.join(', ')}`,
      404
    );
  }

  // CHECK STOCK & CALCULATE SUBTOTAL
  const productMap = new Map(productsInDB.map((p) => [p.id, p]));
  let subtotal = 0;
  const stockErrors = [];

  const enrichedItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (product.stock < item.quantity) {
      stockErrors.push(
        `"${product.name}": solicitás ${item.quantity}, disponible ${product.stock}`
      );
    }

    const unitPrice = parseFloat(product.price);
    subtotal += unitPrice * item.quantity;

    return { productId: item.productId, quantity: item.quantity, unitPrice };
  });

  if (stockErrors.length > 0) {
    throw new AppError(`Stock insuficiente para:\n${stockErrors.join('\n')}`, 409);
  }

  // CALCULATE SHIPPING
  const shippingCost = calculateShipping(distance, subtotal);
  const total = subtotal + shippingCost;

  // ATOMIC TRANSACTION: CREATE ORDER + DECREMENT STOCK
  const addressSnapshot = `${address.address}, ${address.city}`;

  const [newOrder] = await prisma.$transaction([
    prisma.order.create({
      data: {
        customerId,
        address: addressSnapshot,
        total,
        items: { create: enrichedItems },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
    }),
    ...enrichedItems.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    ),
  ]);

  return {
    order: serializeOrder(newOrder),
    summary: { subtotal, shippingCost, total, freeShippingApplied: shippingCost === 0 },
  };
};

// GET MY ORDERS
export const getMyOrders = async (customerId, { status, page, limit }) => {
  const skip = (page - 1) * limit;
  const where = { customerId, ...(status && { status }) };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        deliverer: { select: { id: true, name: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map(serializeOrder),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// GET ALL ORDERS (ADMIN / CASHIER)
export const getAllOrders = async ({ status, page, limit }) => {
  const skip = (page - 1) * limit;
  const where = { ...(status && { status }) };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer:  { select: { id: true, name: true, email: true, phone: true } },
        deliverer: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map(serializeOrder),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// GET DELIVERER ORDERS (DELIVERER)
export const getDelivererOrders = async (delivererId, { status, page, limit }) => {
  const skip = (page - 1) * limit;
  
  // Filtrar órdenes asignadas al domiciliario O disponibles para tomar (PAID, PREPARING, DISPATCHED sin asignar)
  const where = {
    OR: [
      { delivererId }, // Órdenes asignadas al domiciliario
      { status: 'PREPARING', delivererId: null }, // Órdenes disponibles para tomar
    ],
    ...(status && { status }), // Filtro adicional por estado si se especifica
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        deliverer: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map(serializeOrder),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (orderId, newStatus, operatorId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Orden no encontrada.', 404);

  // VALIDATE TRANSITION
  const allowedNext = VALID_TRANSITIONS[order.status];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `No se puede cambiar el estado de ${order.status} a ${newStatus}. Transiciones válidas: ${allowedNext.join(', ') || 'ninguna (estado terminal)'}`,
      422
    );
  }

  // BUILD UPDATE DATA WITH KPI TIMESTAMPS
  const updateData = { status: newStatus };

  if (newStatus === 'DISPATCHED') {
    updateData.dispatchedAt = new Date();
    updateData.delivererId = operatorId;
  }

  if (newStatus === 'DELIVERED') {
    updateData.deliveredAt = new Date();
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      customer:  { select: { id: true, name: true, email: true } },
      deliverer: { select: { id: true, name: true } },
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  });

  return serializeOrder(updated);
};