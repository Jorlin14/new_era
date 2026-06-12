/**
 * Address Controller — New Era Supermercado
 *
 * CRUD de direcciones de entrega del usuario autenticado.
 *
 * @module controllers/address
 */

import * as addressService from '../services/address.service.js';

/** POST /api/addresses — Crear dirección */
export const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Dirección creada correctamente.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/addresses — Listar direcciones del usuario */
export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getMyAddresses(req.user.id);

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/addresses/:id — Actualizar dirección */
export const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Dirección actualizada correctamente.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/addresses/:id — Eliminar dirección */
export const deleteAddress = async (req, res, next) => {
  try {
    const result = await addressService.deleteAddress(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/addresses/:id/default — Marcar como dirección predeterminada */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Dirección predeterminada actualizada.',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};
