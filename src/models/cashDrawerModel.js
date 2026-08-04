import mongoose from '../common/db.connect.js';

const CashDrawerSchema = new mongoose.Schema({
    cashierId: {
        type: String,
        required: true
    },
    cashierName: {
        type: String,
        default: 'Cashier'
    },
    shiftDate: {
        type: Date,
        default: Date.now
    },
    openingCash: {
        type: Number,
        default: 0
    },
    cashSales: {
        type: Number,
        default: 0
    },
    customerPaymentsCollected: {
        type: Number,
        default: 0
    },
    vendorPaymentsPaid: {
        type: Number,
        default: 0
    },
    expensesPaid: {
        type: Number,
        default: 0
    },
    expectedClosingCash: {
        type: Number,
        default: 0
    },
    actualClosingCash: {
        type: Number,
        default: 0
    },
    discrepancy: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const CashDrawer = mongoose.model('cash_drawers', CashDrawerSchema);

export default CashDrawer;
