import express from 'express';
import authUserRouter from './auth.user.js'
import productRouter from './product.js'
import customerRouter from './customer.js'
import billRouter from './bill.print.js'
import categoryRouter from './category.js'
import expenseRouter from './expense.js'
import supplierRouter from './supplier.js'
import purchaseRouter from './purchase.js'
import reportRouter from './report.js'
import cashdrawerRouter from './cashdrawer.js'
import dayendRouter from './dayend.js'

let router = express.Router();

router.use('/auth', authUserRouter)
router.use('/product', productRouter)
router.use('/customer', customerRouter)
router.use('/saleprint', billRouter)
router.use('/category', categoryRouter)
router.use('/expense', expenseRouter)
router.use('/supplier', supplierRouter)
router.use('/purchase', purchaseRouter)
router.use('/report', reportRouter)
router.use('/cashdrawer', cashdrawerRouter)
router.use('/dayend', dayendRouter)

export default router