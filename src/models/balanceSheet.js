import mongoose from '../common/db.connect.js';



const BalanceSheet = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customers', required: true },
    openingBalance: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    transactions: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['purchase', 'payment','opening_balance'], required: true },
        amount: { type: Number, required: true }
      }
    ]
})

const BlSheet = mongoose.model('balancesheet',BalanceSheet)

export default BlSheet 