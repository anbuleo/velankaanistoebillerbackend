import express from 'express';
import reportController from '../controllers/report.controller.js';
import { verifyToken } from '../uitils/verifyUser.js';

const router = express.Router();

router.get('/dashboard', verifyToken, reportController.getExecutiveDashboard);
router.get('/gst', verifyToken, reportController.getGSTReport);
router.get('/pnl', verifyToken, reportController.getPnLReport);

export default router;
