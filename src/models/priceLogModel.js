import mongoose from '../common/db.connect.js';

const PriceLogSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        default: ''
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    newPrice: {
        type: Number,
        default: 0
    },
    oldCost: {
        type: Number,
        default: 0
    },
    newCost: {
        type: Number,
        default: 0
    },
    oldMRP: {
        type: Number,
        default: 0
    },
    newMRP: {
        type: Number,
        default: 0
    },
    modifiedBy: {
        type: String,
        default: 'admin'
    },
    modifiedByName: {
        type: String,
        default: 'Admin User'
    },
    reason: {
        type: String,
        default: 'Price Update'
    }
}, { timestamps: true });

const PriceLog = mongoose.model('price_logs', PriceLogSchema);

export default PriceLog;
