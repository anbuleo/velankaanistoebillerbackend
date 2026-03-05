import Expense from "../models/expenseModel.js";

const addExpense = async (req, res, next) => {
    try {
        const { expenseTitle, expenseAmount, expenseCategory, description, expenseDate } = req.body;
        const newExpense = new Expense({
            expenseTitle,
            expenseAmount,
            expenseCategory,
            description,
            expenseDate
        });
        await newExpense.save();
        res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    } catch (error) {
        next(error);
    }
};

const getAllExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find().sort({ expenseDate: -1 });
        res.status(200).json({ expenses });
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Expense.findByIdAndDelete(id);
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const getExpenseSummary = async (req, res, next) => {
    try {
        const summary = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: "$expenseAmount" }
                }
            }
        ]);
        res.status(200).json({ totalExpenses: summary[0]?.totalExpenses || 0 });
    } catch (error) {
        next(error);
    }
};

export default {
    addExpense,
    getAllExpenses,
    deleteExpense,
    getExpenseSummary
};
