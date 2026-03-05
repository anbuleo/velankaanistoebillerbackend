import mongoose from '../common/db.connect.js'

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Category = mongoose.model('Category', categorySchema)

export default Category
