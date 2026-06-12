/**
 * Address Service — New Era Supermercado
 *
 * CRUD de direcciones de entrega por usuario.
 *
 * @module services/address
 */

import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

// FIND ADDRESS OR FAIL
const findAddressOrFail = async (addressId, userId) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new AppError('Dirección no encontrada.', 404);
  }

  return address;
};

// CREATE ADDRESS
export const createAddress = async (userId, data) => {
  if (data.isDefault) {
    const [, newAddress] = await prisma.$transaction([
      prisma.address.updateMany({
        where:  { userId, isDefault: true },
        data:   { isDefault: false },
      }),
      prisma.address.create({
        data: { ...data, userId },
      }),
    ]);
    return newAddress;
  }

  return prisma.address.create({ data: { ...data, userId } });
};

// GET MY ADDRESSES
export const getMyAddresses = async (userId) => {
  return prisma.address.findMany({
    where:   { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
};

// UPDATE ADDRESS
export const updateAddress = async (addressId, userId, data) => {
  await findAddressOrFail(addressId, userId);

  if (data.isDefault) {
    const [, updated] = await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data:  { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data,
      }),
    ]);
    return updated;
  }

  return prisma.address.update({ where: { id: addressId }, data });
};

// DELETE ADDRESS
export const deleteAddress = async (addressId, userId) => {
  const address = await findAddressOrFail(addressId, userId);

  if (address.isDefault) {
    const totalAddresses = await prisma.address.count({ where: { userId } });
    if (totalAddresses > 1) {
      throw new AppError(
        'No puedes eliminar tu dirección predeterminada si tienes otras guardadas. Establece otra como predeterminada primero.',
        409
      );
    }
  }

  await prisma.address.delete({ where: { id: addressId } });
  return { message: 'Dirección eliminada correctamente.' };
};

// SET DEFAULT ADDRESS
export const setDefaultAddress = async (addressId, userId) => {
  await findAddressOrFail(addressId, userId);

  const [, updated] = await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, isDefault: true },
      data:  { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data:  { isDefault: true },
    }),
  ]);

  return updated;
};