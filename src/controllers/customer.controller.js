import Customer from "../models/customerModel.js"
import BlSheet from "../models/balanceSheet.js"
import { errorHandler } from "../uitils/errorHandler.js"



const createCustomer = async (req, res, next) => {

    try {
        let { name, mobile, address, location, aadhaar, creditLimit } = req.body

        let customerExists = await Customer.findOne({ name })
        if (customerExists) return next(errorHandler(400, 'User Name Already Exist'))

        let customer = new Customer({
            name,
            mobile,
            address: address || location,
            location: location || address,
            aadhaar,
            creditLimit: creditLimit || 5000
        })

        await customer.save()

        res.status(201).json({
            message: `${name} created Success !!`
        })




    } catch (error) {
        next(error)
    }
}

const getAllCustomer = async (req, res, next) => {
    try {
        let customers = await Customer.find().lean()
        let balanceSheets = await BlSheet.find().lean()

        // Server-side enrichment: merge financial data into each customer
        const enrichedCustomers = customers.map(c => {
            const sheet = balanceSheets.find(s =>
                String(s.customerId) === String(c._id)
            )
            return {
                ...c,
                balance: sheet ? (sheet.remainingBalance || 0) : 0,
                totalPurchases: sheet ? (sheet.totalPurchases || 0) : 0,
                totalPayments: sheet ? (sheet.totalPayments || 0) : 0
            }
        })

        res.status(200).json({
            customer: enrichedCustomers
        })
    } catch (error) {
        next(error)
    }
}

export default {
    createCustomer,
    getAllCustomer
}