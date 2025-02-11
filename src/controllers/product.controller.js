import ProductPcs from "../models/productmodel.js"
import { errorHandler } from "../uitils/errorHandler.js";
import uniqid from 'uniqid'


const createProduct = async(req,res,next)=>{
    try {
        let {productName,productCode,productType,createBy,productPrice,productCost,stockQuantity,qantityType,unitValue,tanglishName,MRP} = req.body
        let isProductCode = await ProductPcs.find({productCode});
        // console.log(req.body)
        if(isProductCode.length  >0 ) return next(errorHandler(401,'ProductCode already exist'))
        let productBarCodeId = uniqid()
        if(!productCode){
            productCode = productBarCodeId
        }
        let product = new ProductPcs({productName,productCode,productType,createBy,productPrice,productCost,stockQuantity,qantityType,unitValue,tanglishName,MRP})

        
        await product.save()
        // console.log()
        if(product){
            res.status(201).json({
            message: "Product Created Success",
            product
        })}
        
    } catch (error) {
        next(error)
    }
}

const getAllProducts = async(req,res,next)=>{
    try {

        let product = await ProductPcs.find();

        res.status(200).json({
            product
        })
        
    } catch (error) {
        next(error)
    }
}

const editProduct = async(req,res,next)=>{
    try {
        let {id} = req.params
        if(id){
            let updateProduct = await ProductPcs.findByIdAndUpdate(
                id,
                req.body,
                {new:true}
            )
            res.status(200).json(updateProduct)
        } else {
            next(Error(400,'invalid Id'))
        }
       
    } catch (error) {
        next(error)
    }
}

const dedleteProduct = async(req,res,next) => {
    try {
        let {id} = req.params
        let deletes = await ProductPcs.findByIdAndDelete({_id:id})
        
        res.status(200).json({
            deletes,
            message: 'Product Deleted Success'
        })
    } catch (error) {
        next(error)
    }
}

export default {
    createProduct,
    getAllProducts,
    editProduct,
    dedleteProduct
}