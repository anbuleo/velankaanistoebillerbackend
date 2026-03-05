import Category from "../models/categoryModel.js"
import ProductPcs from "../models/productmodel.js"
import { errorHandler } from "../uitils/errorHandler.js"

const createCategory = async (req, res, next) => {
    try {
        const { name, description, createdBy } = req.body
        if (!name) return next(errorHandler(400, 'Category name is required'))

        const isExist = await Category.findOne({ name })
        if (isExist) return next(errorHandler(400, 'Category already exists'))

        const category = new Category({ name, description, createdBy })
        await category.save()

        res.status(201).json({
            success: true,
            message: "Category Created Success",
            category
        })
    } catch (error) {
        next(error)
    }
}

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 })
        res.status(200).json({
            success: true,
            categories
        })
    } catch (error) {
        next(error)
    }
}

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params

        // Find the category first to get its name
        const category = await Category.findById(id)
        if (!category) return next(errorHandler(404, 'Category not found'))

        // Check if any product is using this category
        const productWithCategory = await ProductPcs.findOne({ productType: category.name })

        if (productWithCategory) {
            return next(errorHandler(400, `Cannot delete category "${category.name}" as it is assigned to one or more products.`))
        }

        await Category.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: 'Category Deleted Success'
        })
    } catch (error) {
        next(error)
    }
}

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        )
        if (!updatedCategory) return next(errorHandler(404, 'Category not found'))

        res.status(200).json({
            success: true,
            message: 'Category Updated Success',
            category: updatedCategory
        })
    } catch (error) {
        next(error)
    }
}

export default {
    createCategory,
    getAllCategories,
    deleteCategory,
    updateCategory
}
