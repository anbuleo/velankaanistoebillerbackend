import ProductPcs from "../models/productmodel.js"
import { errorHandler } from "../uitils/errorHandler.js";
import uniqid from 'uniqid'


const createProduct = async (req, res, next) => {
    try {
        let { productName, productCode, productType, createBy, productPrice, productCost, stockQuantity, qantityType, unitValue, tanglishName, MRP } = req.body

        // Ensure createBy is populated (fallback to authenticated user's id)
        const creatorId = createBy || req.user?.id || 'admin';

        let isProductCode = await ProductPcs.find({ productCode });
        // console.log(req.body)
        if (isProductCode.length > 0) return next(errorHandler(401, 'ProductCode already exist'))
        let productBarCode = req.body.productBarCode || productCode || uniqid()

        let product = new ProductPcs({
            productName, productCode, productType, createBy: creatorId,
            productPrice, productCost, stockQuantity, qantityType,
            unitValue, tanglishName, MRP, productBarCode
        })

        await product.save()
        if (product) {
            res.status(201).json({
                message: "Product Created Success",
                product
            })
        }

    } catch (error) {
        next(error)
    }
}

const getAllProducts = async (req, res, next) => {
    try {

        let product = await ProductPcs.find();

        res.status(200).json({
            product
        })

    } catch (error) {
        next(error)
    }
}

const editProduct = async (req, res, next) => {
    try {
        let { id } = req.params
        if (id) {
            let updateProduct = await ProductPcs.findByIdAndUpdate(
                id,
                req.body,
                { new: true }
            )
            res.status(200).json(updateProduct)
        } else {
            next(Error(400, 'invalid Id'))
        }

    } catch (error) {
        next(error)
    }
}

const dedleteProduct = async (req, res, next) => {
    try {
        let { id } = req.params
        let deletes = await ProductPcs.findByIdAndDelete({ _id: id })

        res.status(200).json({
            deletes,
            message: 'Product Deleted Success'
        })
    } catch (error) {
        next(error)
    }
}

const bulkUpdatePrices = async (req, res, next) => {
    try {
        const { updates } = req.body; // Array of { id, productPrice, productCost }
        if (!updates || !Array.isArray(updates)) {
            return next(errorHandler(400, "Updates array required"));
        }

        const promies = updates.map(async (item) => {
            const updateFields = {};
            if (item.productPrice !== undefined) updateFields.productPrice = item.productPrice;
            if (item.productCost !== undefined) updateFields.productCost = item.productCost;
            if (item.MRP !== undefined) updateFields.MRP = item.MRP;

            return ProductPcs.findByIdAndUpdate(item.id, updateFields, { new: true });
        });

        const results = await Promise.all(promies);
        res.status(200).json({
            message: "Bulk update successful",
            results
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createProduct,
    getAllProducts,
    editProduct,
    dedleteProduct,
    bulkUpdatePrices
}