import express from 'express';
import dayendController from '../controllers/dayend.controller.js';
import { verifyToken } from '../uitils/verifyUser.js';

const router = express.Router();

router.get('/summary', verifyToken, dayendController.getTodayEndSummary);
router.post('/close', verifyToken, dayendController.closeDayEnd);
router.get('/history', verifyToken, dayendController.getDayEndHistory);

export default router;
