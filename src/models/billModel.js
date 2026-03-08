import mongoose from '../common/db.connect.js';

const BillSchema = new mongoose.Schema({
    customerName: {
        type: String,
        default: 'customer'
    },
    billNumber: {
        type: String,
        required: false
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customers",
        default: null
    },
    customerMobile: {
        type: String,
        default: null
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: null
    },
    dueAmount: {
        type: Number,
        default: null
    },
    createBy: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    },


    paymentType: {
        type: String,
        required: true
    }



}, { timestamps: true })
const Bill = mongoose.model('bill', BillSchema)

export default Bill

