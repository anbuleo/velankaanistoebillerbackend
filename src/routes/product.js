import express from 'express'
import { verifyToken } from '../uitils/verifyUser.js'
import productController from '../controllers/product.controller.js'

const router = express.Router()


router.post('/create',verifyToken,productController.createProduct)
router.get('/getallproducts', verifyToken,productController.getAllProducts)
router.put('/editproduct/:id',verifyToken,productController.editProduct)
router.delete('/deleteproduct/:id',verifyToken,productController.dedleteProduct)


export default router