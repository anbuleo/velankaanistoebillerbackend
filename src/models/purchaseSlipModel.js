import mongoose from '../common/db.connect.js';

const PurchaseItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        default: null
    },
    itemName: {
        type: String,
        required: true
    },
    quantityNeeded: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        default: 'Pcs'
    },
    vendorName: {
        type: String,
        default: 'General Market'
    },
    isPurchased: {
        type: Boolean,
        default: false
    },
    actualCost: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    }
});

const PurchaseSlipSchema = new mongoose.Schema({
    slipDate: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Daily Stock Procurement Slip'
    },
    status: {
        type: String,
        enum: ['DRAFT', 'ORDERED', 'COMPLETED', 'PARTIAL'],
        default: 'DRAFT'
    },
    items: [PurchaseItemSchema],
    createBy: {
        type: String,
        default: 'system'
    }
}, { timestamps: true });

const PurchaseSlip = mongoose.model('purchaseslip', PurchaseSlipSchema);

export default PurchaseSlip;
