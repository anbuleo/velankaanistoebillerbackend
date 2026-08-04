import ProductPcs from "../models/productmodel.js"
import PriceLog from "../models/priceLogModel.js"
import { errorHandler } from "../uitils/errorHandler.js";
import uniqid from 'uniqid'


const createProduct = async (req, res, next) => {
    try {
        let { productName, productCode, productType, createBy, productPrice, productCost, stockQuantity, qantityType, unitValue, tanglishName, MRP } = req.body

        // Ensure createBy is populated (fallback to authenticated user's id)
        const creatorId = createBy || req.user?.id || 'admin';

        let isProductCode = await ProductPcs.find({ productCode });
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
        if (!id) return next(errorHandler(400, 'invalid Id'));

        const oldProduct = await ProductPcs.findById(id);
        if (!oldProduct) return next(errorHandler(404, 'Product not found'));

        let updateProduct = await ProductPcs.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        )

        // Log price audit if price, cost, or MRP changed
        const priceChanged = req.body.productPrice !== undefined && Number(req.body.productPrice) !== Number(oldProduct.productPrice);
        const costChanged = req.body.productCost !== undefined && Number(req.body.productCost) !== Number(oldProduct.productCost);
        const mrpChanged = req.body.MRP !== undefined && Number(req.body.MRP) !== Number(oldProduct.MRP);

        if (priceChanged || costChanged || mrpChanged) {
            await PriceLog.create({
                productId: oldProduct._id,
                productName: oldProduct.productName,
                productCode: oldProduct.productCode,
                oldPrice: Number(oldProduct.productPrice) || 0,
                newPrice: Number(updateProduct.productPrice) || 0,
                oldCost: Number(oldProduct.productCost) || 0,
                newCost: Number(updateProduct.productCost) || 0,
                oldMRP: Number(oldProduct.MRP) || 0,
                newMRP: Number(updateProduct.MRP) || 0,
                modifiedBy: req.user?.id || 'admin',
                modifiedByName: req.user?.userName || 'Admin User',
                reason: 'Individual Product Edit'
            });
        }

        res.status(200).json(updateProduct)

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
            const oldProduct = await ProductPcs.findById(item.id);
            const updateFields = {};
            if (item.productPrice !== undefined) updateFields.productPrice = item.productPrice;
            if (item.productCost !== undefined) updateFields.productCost = item.productCost;
            if (item.MRP !== undefined) updateFields.MRP = item.MRP;

            const updated = await ProductPcs.findByIdAndUpdate(item.id, updateFields, { new: true });

            if (oldProduct && updated) {
                const priceChanged = item.productPrice !== undefined && Number(item.productPrice) !== Number(oldProduct.productPrice);
                const costChanged = item.productCost !== undefined && Number(item.productCost) !== Number(oldProduct.productCost);
                const mrpChanged = item.MRP !== undefined && Number(item.MRP) !== Number(oldProduct.MRP);

                if (priceChanged || costChanged || mrpChanged) {
                    await PriceLog.create({
                        productId: oldProduct._id,
                        productName: oldProduct.productName,
                        productCode: oldProduct.productCode,
                        oldPrice: Number(oldProduct.productPrice) || 0,
                        newPrice: Number(updated.productPrice) || 0,
                        oldCost: Number(oldProduct.productCost) || 0,
                        newCost: Number(updated.productCost) || 0,
                        oldMRP: Number(oldProduct.MRP) || 0,
                        newMRP: Number(updated.MRP) || 0,
                        modifiedBy: req.user?.id || 'admin',
                        modifiedByName: req.user?.userName || 'Admin User',
                        reason: 'Quick / Bulk Price Update'
                    });
                }
            }

            return updated;
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

const getPriceLogs = async (req, res, next) => {
    try {
        const logs = await PriceLog.find().sort({ createdAt: -1 }).limit(200);
        res.status(200).json({ logs });
    } catch (error) {
        next(error);
    }
};

export default {
    createProduct,
    getAllProducts,
    editProduct,
    dedleteProduct,
    bulkUpdatePrices,
    getPriceLogs
}