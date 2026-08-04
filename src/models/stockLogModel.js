import mongoose from '../common/db.connect.js';

const StockLogSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['STOCK_IN', 'SALE', 'RETURN', 'DAMAGED', 'EXPIRED', 'ADJUSTMENT'],
        required: true
    },
    quantityChange: {
        type: Number,
        required: true
    },
    previousStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        default: ''
    },
    performedBy: {
        type: String,
        default: 'system'
    }
}, { timestamps: true });

const StockLog = mongoose.model('stock_logs', StockLogSchema);

export default StockLog;
