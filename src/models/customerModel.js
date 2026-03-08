import mongoose from "../common/db.connect.js";


const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    mobile: {
        type: String,
        required: true

    },
    address: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    aadhaar: {
        type: String,
        required: false
    },
    credit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bill",
        default: null
    },
    purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bill",
        default: null
    },
    role: {
        type: String,
        default: 'customer'
    },
    creditLimit: {
        type: Number,
        default: 5000
    }
}, { timestamps: true })

let Customer = mongoose.model('customers', customerSchema)

export default Customer

