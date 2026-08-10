import express from 'express';
import {
    createPurchaseSlip,
    getAllPurchaseSlips,
    updatePurchaseSlip,
    deletePurchaseSlip,
    carryoverPendingItems
} from '../controllers/purchaseSlip.controller.js';

const router = express.Router();

router.post('/create', createPurchaseSlip);
router.get('/all', getAllPurchaseSlips);
router.put('/update/:id', updatePurchaseSlip);
router.delete('/delete/:id', deletePurchaseSlip);
router.post('/carryover/:id', carryoverPendingItems);

export default router;
