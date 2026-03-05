import express from 'express'
import { verifyToken } from '../uitils/verifyUser.js'
import categoryController from '../controllers/category.controller.js'

const router = express.Router()

router.post('/create', verifyToken, categoryController.createCategory)
router.get('/getall', verifyToken, categoryController.getAllCategories)
router.put('/update/:id', verifyToken, categoryController.updateCategory)
router.delete('/delete/:id', verifyToken, categoryController.deleteCategory)

export default router
