import prisma from '../config/database.js';

/**
 * Obtiene todas las estadísticas para el dashboard del administrador.
 */
export const getDashboardStats = async () => {
  // 1. Obtener todas las órdenes que no estén canceladas
  const orders = await prisma.order.findMany({
    where: {
      status: { not: 'CANCELLED' }
    },
    select: {
      total: true,
      status: true,
      createdAt: true
    }
  });

  // Calcular ventas totales y órdenes totales
  const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;

  // Calcular órdenes activas (PENDING, PAID, PREPARING, DISPATCHED)
  const activeOrders = orders.filter(o => 
    ['PENDING', 'PAID', 'PREPARING', 'DISPATCHED'].includes(o.status)
  ).length;

  // 2. Obtener el total de usuarios (rol CUSTOMER)
  const totalUsers = await prisma.user.count({
    where: { role: 'CUSTOMER' }
  });

  // 3. Ventas Semanales (últimos 7 días)
  const today = new Date();
  const weeklySalesMap = new Map();
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Inicializar los últimos 7 días en el mapa (en orden, de más antiguo a más reciente)
  const orderedDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dayName = days[d.getDay()];
    weeklySalesMap.set(dayName, 0);
    orderedDays.push(dayName);
  }

  // Filtrar órdenes de los últimos 7 días
  const last7DaysStart = new Date(today);
  last7DaysStart.setDate(today.getDate() - 6);
  last7DaysStart.setHours(0, 0, 0, 0);

  const recentOrdersForChart = orders.filter(o => new Date(o.createdAt) >= last7DaysStart);
  
  // Sumar las ventas por día
  recentOrdersForChart.forEach(o => {
    const d = new Date(o.createdAt);
    const dayName = days[d.getDay()];
    if (weeklySalesMap.has(dayName)) {
      weeklySalesMap.set(dayName, weeklySalesMap.get(dayName) + Number(o.total));
    }
  });
  const weeklySalesRaw = orderedDays.map(day => ({ day, value: weeklySalesMap.get(day) }));
  const maxWeeklySale = Math.max(...weeklySalesRaw.map(ws => ws.value), 1); // Evitar dividir por cero
  
  const weeklySalesFormatted = weeklySalesRaw.map(ws => ({
    day: ws.day,
    value: Math.round((ws.value / maxWeeklySale) * 100),
    rawValue: ws.value
  }));

  // 4. Productos más vendidos (Top 4)
  // Agrupar OrderItem por productId y sumar quantity
  const topItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 4,
  });

  // Obtener los nombres y stock de esos productos
  const topProductIds = topItems.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, stock: true }
  });

  const topProducts = topItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      name: product ? product.name : 'Producto Desconocido',
      sold: item._sum.quantity,
      stock: product ? product.stock : 0
    };
  });

  // 5. Últimas órdenes recientes (Para la tabla)
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true } }
    }
  });

  return {
    totalSales,
    totalOrders,
    totalUsers,
    activeOrders,
    weeklySales: weeklySalesFormatted,
    topProducts,
    recentOrders,
  };
};
