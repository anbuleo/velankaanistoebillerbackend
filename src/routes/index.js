import express from 'express';
import authUserRouter from './auth.user.js'
import productRouter from './product.js'
import customerRouter from './customer.js'
import billRouter from './bill.print.js'
import categoryRouter from './category.js'
import expenseRouter from './expense.js'

let router = express.Router();

router.use('/auth', authUserRouter)
router.use('/product', productRouter)
router.use('/customer', customerRouter)
router.use('/saleprint', billRouter)
router.use('/category', categoryRouter)
router.use('/expense', expenseRouter)


export default router