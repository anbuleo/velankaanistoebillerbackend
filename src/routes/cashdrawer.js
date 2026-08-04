import express from 'express';
import cashdrawerController from '../controllers/cashdrawer.controller.js';
import { verifyToken } from '../uitils/verifyUser.js';

const router = express.Router();

router.post('/open', verifyToken, cashdrawerController.openShift);
router.get('/active', verifyToken, cashdrawerController.getActiveShift);
router.post('/close', verifyToken, cashdrawerController.closeShift);
router.get('/history', verifyToken, cashdrawerController.getShiftHistory);

export default router;
