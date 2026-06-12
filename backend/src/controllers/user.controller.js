import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page, limit } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          // Calculate orders and total spent in JS or via relation count if simple
          _count: {
            select: { ordersAsCustomer: true }
          },
          ordersAsCustomer: {
            select: {
              total: true,
              status: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    const formattedUsers = users.map(user => {
      // Solo contar pedidos que no estén cancelados
      const validOrders = user.ordersAsCustomer.filter(o => o.status !== 'CANCELLED');
      const totalSpent = validOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      
      const { ordersAsCustomer, _count, ...userData } = user;
      return {
        ...userData,
        totalOrders: _count.ordersAsCustomer,
        totalSpent
      };
    });

    res.json({
      status: 'success',
      data: formattedUsers,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener usuarios' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, isActive, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    // No permitir cambiar el rol de ADMIN del superusuario (protección opcional, asumimos que todos los ADMINs pueden editar menos a sí mismos si quisiéramos)
    
    let hashedPassword;
    if (password) {
      const SALT_ROUNDS = 12;
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    res.json({ status: 'success', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor al actualizar usuario' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            ordersAsCustomer: true,
            ordersAsDeliverer: true,
            ordersAsCashier: true 
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    const hasRelations = user._count.ordersAsCustomer > 0 || user._count.ordersAsDeliverer > 0 || user._count.ordersAsCashier > 0;

    if (hasRelations) {
      // Soft delete
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });
      return res.json({ 
        status: 'success', 
        message: 'Usuario desactivado exitosamente (no se eliminó por completo porque tiene historial de compras/operaciones)' 
      });
    } else {
      // Hard delete
      // Primero eliminar direcciones si tiene
      await prisma.address.deleteMany({ where: { userId: id } });
      await prisma.user.delete({ where: { id } });
      return res.json({ status: 'success', message: 'Usuario eliminado por completo exitosamente' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor al eliminar usuario' });
  }
};
