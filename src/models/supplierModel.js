import mongoose from '../common/db.connect.js';

const SupplierSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    gstin: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    outstandingBalance: {
        type: Number,
        default: 0
    },
    transactions: [
        {
            type: {
                type: String,
                enum: ['PURCHASE', 'PAYMENT'],
                required: true
            },
            amount: Number,
            paymentMode: {
                type: String,
                default: 'Cash'
            },
            notes: {
                type: String,
                default: ''
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const Supplier = mongoose.model('suppliers', SupplierSchema);

export default Supplier;
