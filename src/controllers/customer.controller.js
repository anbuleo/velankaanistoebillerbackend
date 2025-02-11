import Customer from "../models/customerModel.js"
import { errorHandler } from "../uitils/errorHandler.js"



const createCustomer = async (req,res,next) => {
    
    try {
        let {name,mobile,address} = req.body

        let cutomer =await Customer.find({name})
        // console.log(req.body)
        if(cutomer.length >0) return  next(errorHandler(400,'User Name Already Exist'))
        
        let customer = new Customer({name,mobile,address})

        customer.save()
        // console.log(customer)

        res.status(201).json({
            
            message: `${name} created Success !!`
        })
        
        


    } catch (error) {
        next(error)
    }
}

const getAllCustomer = async(req,res,next) => {
    try {
        let customer = await Customer.find()

        res.status(200).json({
            customer
        })
    } catch (error) {
        next(error)
    }
}

export default {
    createCustomer,
    getAllCustomer
}