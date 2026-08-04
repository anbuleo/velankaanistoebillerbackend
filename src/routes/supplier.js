import express from 'express';
import supplierController from '../controllers/supplier.controller.js';
import { verifyToken } from '../uitils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, supplierController.createSupplier);
router.get('/all', verifyToken, supplierController.getAllSuppliers);
router.put('/update/:id', verifyToken, supplierController.updateSupplier);
router.delete('/delete/:id', verifyToken, supplierController.deleteSupplier);
router.post('/pay', verifyToken, supplierController.recordVendorPayment);
router.get('/payments', verifyToken, supplierController.getSupplierPaymentLogs);

export default router;
