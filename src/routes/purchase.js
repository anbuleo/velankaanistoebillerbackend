import express from 'express';
import purchaseController from '../controllers/purchase.controller.js';
import { verifyToken } from '../uitils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, purchaseController.createPurchase);
router.get('/all', verifyToken, purchaseController.getAllPurchases);

export default router;
