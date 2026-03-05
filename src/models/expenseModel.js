import mongoose from "../common/db.connect.js";

const ExpenseSchema = new mongoose.Schema({
    expenseTitle: {
        type: String,
        required: true
    },
    expenseAmount: {
        type: Number,
        required: true
    },
    expenseCategory: {
        type: String,
        enum: ['Electricity', 'Rent', 'Wages', 'Transport', 'Maintenance', 'Others'],
        default: 'Others'
    },
    expenseDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: ""
    }
}, {
    timestamps: true,
    versionKey: false
});

const Expense = mongoose.model('expenses', ExpenseSchema);

export default Expense;
