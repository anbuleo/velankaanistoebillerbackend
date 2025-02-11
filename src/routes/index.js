import express from 'express';
import authUserRouter from './auth.user.js'
import productRouter from './product.js'
import customerRouter from './customer.js'
import billRouter from './bill.print.js'

let router = express.Router();

router.use('/auth',authUserRouter)
router.use('/product',productRouter)
router.use('/customer',customerRouter)
router.use('/saleprint',billRouter)


export default router