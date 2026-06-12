import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator.js';
import * as addressController from '../controllers/address.controller.js';

const router = Router();

router.use(verifyToken);
router.use(checkRole('CUSTOMER'));

// GET MY ADDRESSES
router.get('/', addressController.getMyAddresses);

// CREATE ADDRESS
router.post('/', validate(createAddressSchema), addressController.createAddress);

// UPDATE ADDRESS
router.patch('/:id', validate(updateAddressSchema), addressController.updateAddress);

// SET DEFAULT ADDRESS
router.patch('/:id/default', addressController.setDefaultAddress);

// DELETE ADDRESS
router.delete('/:id', addressController.deleteAddress);

export default router;