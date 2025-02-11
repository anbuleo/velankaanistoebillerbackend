import Bill from "../models/billModel.js"
import Credit from "../models/creadit.js"
import Product from "../models/productmodel.js"

import env from 'dotenv'
import { errorHandler } from "../uitils/errorHandler.js"
import DeleteBill from "../models/deletebilllogModel.js"
import BlSheet from "../models/balanceSheet.js"


env.config()










const saleBill = async(req,res,next)=>{
    try {  
        let {customerName,customerId,customerMobile,totalAmount,paidAmount,dueAmount,products,paymentType} = req.body
        let createBy = req.user.id
        
        let bill = new Bill({customerName,customerId,customerMobile,totalAmount,paidAmount,dueAmount,createBy,products,paymentType})
        
        // console.log(bill)
           

            if(paymentType ==='credit' ){
                if(!customerId|| customerId.length ==0 || !bill._id ) return next({status:400,message:'customer Id Must for credit'})

                    let oldbalan = await BlSheet.findOne({ customerId }).sort({ _id: -1 });
                    if(oldbalan){
                       oldbalan.totalPurchases += Number(totalAmount);
                       oldbalan.remainingBalance += Number(totalAmount);
                       oldbalan.transactions.push({ type: 'purchase', amount:totalAmount });
                        await oldbalan.save();
                    }else {
                        let balancesh = new BlSheet({customerId,totalPurchases:totalAmount,totalPayments:totalAmount,remainingBalance:totalAmount,transactions: [{ type: 'purchase', amount: totalAmount }]})
                       await balancesh.save()
                    }
                   
                let credit = new Credit({BillId:bill._id,customerId})
                await credit.save()
            } else if(paymentType==='online'||paymentType==='cash' && customerId|| customerId?.length ==0 ){
                

                    let oldbalan = await BlSheet.findOne({ customerId }).sort({ _id: -1 });
                    if(oldbalan){
                       oldbalan.totalPurchases += Number(totalAmount);
                       oldbalan.remainingBalance += 0;
                       oldbalan.totalPayments +=Number(totalAmount)
                       oldbalan.transactions.push({ type: 'purchase', amount:totalAmount });
                        await oldbalan.save();
                    }else {
                        if(paymentType==='online'||paymentType==='cash'){

                            let balancesh = new BlSheet({customerId,totalPurchases:totalAmount,totalPayments:totalAmount,remainingBalance:0,transactions: [{ type: 'purchase', amount: totalAmount }]})
                           await balancesh.save()
                        }else{


                            let balancesh = new BlSheet({customerId,totalPurchases:totalAmount,totalPayments:totalAmount,remainingBalance:totalAmount,transactions: [{ type: 'purchase', amount: totalAmount }]})
                           await balancesh.save()
                        }
                    }
            }

        //     if(customerId?.length >0){


        //     }

        // await sendSms()
        await bill.save()

        res.status(201).send({
            message:'Sale bill genrated'
        })

   
       
    } catch (error) {
        // console.log(error)
        next(error)
    }
}

let GetAllBill = async(req,res,next)=>{
    try {
        let bills = await Bill.find().sort({ createdAt: -1 });

        if(bills.length <= 0 || !bills) return next(errorHandler(204,'No bills Found'))
            

        res.status(200).json({
            bill:bills,
            message:'Bill are listed Here'
        })
        
    } catch (error) {
        next(error)
    }
}

let openingBalanceSheet = async(req,res,next)=>{
    try {
        let {customerId,amount,type} = req.body;

        if(type == 'opening_balance' ){
            let balanceSheet = await BlSheet.findOne({ customerId });
        if (balanceSheet) return res.status(400).json({ message: 'Balance Sheet already exists  change payment type' });

        balanceSheet = new BlSheet({
            customerId,
            openingBalance:amount,
            remainingBalance: amount,
            transactions: [{ type: 'opening_balance', amount: amount }]
        });

        await balanceSheet.save();
        res.status(201).json({
            message:'Balance Sheet created success'
        });
        return

        }else if(type==='purchase'){
            let balanceSheet = await BlSheet.findOne({ customerId });
            if (!balanceSheet) return res.status(404).json({ message: 'No balance Sheet found' });
            balanceSheet.transactions.push({ type, amount });
            balanceSheet.totalPurchases += Number(amount);
            balanceSheet.remainingBalance += Number(amount);

            await balanceSheet.save()
            res.status(200).json({message:'Purchase entry entered in BalanceSheet'})
            return


        }else if(type === 'payment'){
            let balanceSheet = await BlSheet.findOne({ customerId });
            if (!balanceSheet) return res.status(404).json({ message: 'No balance Sheet found' });
            balanceSheet.transactions.push({ type, amount });
            balanceSheet.totalPayments  += Number(amount);
            balanceSheet.remainingBalance -= Number(amount);
            await balanceSheet.save()
            res.status(200).json({message:'Payment entry entered in BalanceSheet'})
            return
        }

        
        
        
    } catch (error) {
        next(error)
    }
}

let getAllBlanceSheet = async(req,res,next)=>{
    try {
        let balanceSheet = await BlSheet.find().populate('customerId', 'name');

        res.status(200).json({
            message:'Balance Sheet of all customer',
            balanceSheet
        })
    } catch (error) {
        // console.log(error)
        next(error)
    }
}
let DeleteBalanceSheet = async(req,res,next)=>{
    try {
        let {id} = req.params;
        let deleted = await BlSheet.findOneAndDelete({customerId:id})
        if(!deleted) return next(errorHandler(400,'Balance Sheet not found'))

            res.status(200).json({message:'Balance Sheet Deleted Successfully'})
    } catch (error) {
        next(error)
    }
}

let EditBillById = async(req,res,next)=>{
    try {
        let {id} = req.params
        let bill = await Bill.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json({
            message:'Your Bill updated'
        })
    } catch (error) {
        next(error)
    }
}

let deleteBillById = async(req,res,next)=>{
    try {
        let {id} = req.params
        // console.log(req.params)

        let bill = await Bill.findById({_id:id})
        // console.log(bill)

        await DeleteBill.create({
            billId: bill._id,
            customerName: bill.customerName,
            customerId: bill.customerId || null ,
            totalAmount: bill.totalAmount,
            paidAmount: bill.paidAmount,
            dueAmount: bill.dueAmount,
            products: bill.products,
            paymentType: bill.paymentType,
            deletedBy:req.user.id,
            isUnknownCustomer: !bill.customerId
        })



        await Credit.deleteOne({BillId:id})
        await Bill.findByIdAndDelete({_id:id})
        res.status(200).json({
            message:'Bill Removed Success'
        })
    } catch (error) {
        // console.log(error)
        next(error)
    }
}
let getBillById = async(req,res,next)=>{
    try {
        let {id} = req.params
        let bill= await Bill.find({customerId:id})
        if(bill.length <=0) return next(errorHandler(204,'No bill to this customer'))
            let profit = 0;

            for(let sl of bill){
                for(let item of sl.products){
                    const product = await Product.findById(item.productId)
                               
                    if(!product) continue

                    const profitPerUnit = parseFloat(item.productPrice) - parseFloat(product.productCost)
                    const totalProfit = profitPerUnit * item.productQuantity;

                    profit += totalProfit;
                }
            
            }



        res.status(200).json({
             bill,
             profit,
             message:'Bills fetched success'
        })
    } catch (error) {
        next(Error)
    }
}
let overAllprofit = async(req,res,next)=>{
    try {
        let sale = await Bill.find({})
        if(!sale.length) return next({status:400,message:'No bill found'})
            
            let profit = 0;

            for(let sl of sale){
                for(let item of sl.products){
                    const product = await Product.findById(item.productId)
                               
                    if(!product) continue

                    const profitPerUnit = parseFloat(item.productPrice) - parseFloat(product.productCost)
                    const totalProfit = profitPerUnit * item.productQuantity;

                    profit += totalProfit;
                }
            }

            res.status(200).json({profit,message:"overAll profit"})

    } catch (error) {
        next(error)
    }
}
let getSaleByDate = async(req,res,next)=>{
    try{
        let {startDate,endDate} = req.body

        const start = new Date(startDate)
        const end = new Date(endDate)
        start.setUTCHours(0,0,0,0)
        end.setUTCHours(23,59,59,999)

        let sale = await Bill.find({createdAt:{$gte:start, $lte:end}})
        // console.log(req.body,start,end)

        if(!sale.length) return next(errorHandler(404,'no sale on this date'))


            res.status(200).json({
                sale
            })


    }catch(error){
        next(error)
    }
}

const resetBalanceSheet = async () => {
    try {
        // Get all balance sheets
        const balanceSheets = await BlSheet.find();

        for (let sheet of balanceSheets) {
           

            // Create a new opening balance from the remaining balance
            const newOpeningBalance = sheet.remainingBalance;

            // Reset balance sheet but keep customerId and opening balance
            sheet.openingBalance = newOpeningBalance;
            sheet.totalPurchases = 0;
            sheet.totalPayments = 0;
            sheet.remainingBalance = newOpeningBalance;
            sheet.transactions = [{ type: 'opening_balance', amount: newOpeningBalance, date: new Date() }];

            // Save the updated sheet
            await sheet.save();
        }

        console.log('Balance sheets reset successfully for all customers.');
    } catch (error) {
        console.error('Error resetting balance sheets:', error);
    }
};

export default {
    saleBill,
    GetAllBill,
    EditBillById,
    deleteBillById,
    getBillById,
    overAllprofit,
    getSaleByDate,
    resetBalanceSheet,
    getAllBlanceSheet,
    openingBalanceSheet
}