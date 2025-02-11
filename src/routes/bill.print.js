import express from 'express'
import { verifyToken } from '../uitils/verifyUser.js'
import saleandprintController from '../controllers/saleandprint.controller.js'

const router = express.Router()


router.post('/printbill',verifyToken,saleandprintController.saleBill)
router.post('/createandeditbalancesheet',verifyToken,saleandprintController.openingBalanceSheet)
router.get('/getallbill',verifyToken,saleandprintController.GetAllBill)
router.get('/getallbalancesheet',verifyToken,saleandprintController.getAllBlanceSheet)
router.get('/profit',verifyToken,saleandprintController.overAllprofit)
router.put('/getsalebydate',verifyToken,saleandprintController.getSaleByDate)
router.get('/getallbillbycutomerid/:id',verifyToken,saleandprintController.getBillById)
router.put('/editbillbyid/:id',verifyToken,saleandprintController.EditBillById)
router.delete('/deletebyid/:id',verifyToken,saleandprintController.deleteBillById)



export default router