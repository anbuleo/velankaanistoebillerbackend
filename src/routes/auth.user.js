import express from 'express'
import userController from "../controllers/user.controller.js";
import {verifyToken} from '../uitils/verifyUser.js'

let router = express.Router()

router.post('/signup',userController.createUser)
router.post('/signin',userController.signin)
router.post('/google',userController.google)
router.get('/signout',userController.signOut)
router.get('/getalluser/:id',verifyToken,userController.getuserByadmin)
router.get('/getuserbyid/:id',verifyToken,userController.getuserbyId)
router.put('/approval/:id',verifyToken,userController.userApproval)
router.delete('/deleteuser/:id',verifyToken,userController.deleteUser)


export default router