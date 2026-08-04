import mongoose from '../common/db.connect.js';

const DayEndSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    closedBy: {
        type: String,
        required: true
    },
    closedByName: {
        type: String,
        default: 'Admin'
    },
    totalBillsCount: {
        type: Number,
        default: 0
    },
    totalSalesAmount: {
        type: Number,
        default: 0
    },
    cashSales: {
        type: Number,
        default: 0
    },
    onlineSales: {
        type: Number,
        default: 0
    },
    creditSales: {
        type: Number,
        default: 0
    },
    totalExpenses: {
        type: Number,
        default: 0
    },
    totalVendorPayments: {
        type: Number,
        default: 0
    },
    grossProfit: {
        type: Number,
        default: 0
    },
    netProfit: {
        type: Number,
        default: 0
    },
    openingDrawerCash: {
        type: Number,
        default: 0
    },
    expectedDrawerCash: {
        type: Number,
        default: 0
    },
    actualDrawerCash: {
        type: Number,
        default: 0
    },
    discrepancy: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const DayEnd = mongoose.model('day_ends', DayEndSchema);

export default DayEnd;
