import express from 'express';
import { verifyToken } from '../uitils/verifyUser.js';
import expenseController from '../controllers/expense.controller.js';

const router = express.Router();

router.post('/add', verifyToken, expenseController.addExpense);
router.get('/all', verifyToken, expenseController.getAllExpenses);
router.get('/summary', verifyToken, expenseController.getExpenseSummary);
router.delete('/delete/:id', verifyToken, expenseController.deleteExpense);

export default router;
