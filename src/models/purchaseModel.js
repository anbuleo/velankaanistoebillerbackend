import mongoose from '../common/db.connect.js';

const PurchaseSchema = new mongoose.Schema({
    purchaseNumber: {
        type: String,
        required: true,
        unique: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'suppliers',
        required: true
    },
    billNumber: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    items: {
        type: Array,
        default: []
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'partial', 'pending'],
        default: 'paid'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: 'admin'
    }
}, { timestamps: true });

const Purchase = mongoose.model('purchases', PurchaseSchema);

export default Purchase;
