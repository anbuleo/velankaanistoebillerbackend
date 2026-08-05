import Bill from '../models/billModel.js';
import Product from '../models/productmodel.js';
import Customer from '../models/customerModel.js';
import Expense from '../models/expenseModel.js';
import BlSheet from '../models/balanceSheet.js';
import mongoose from '../common/db.connect.js';

const getExecutiveDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Fetch Today's & Monthly Sales
        const todayBills = await Bill.find({ createdAt: { $gte: today } });
        const monthBills = await Bill.find({ createdAt: { $gte: startOfMonth } });

        const todaySales = todayBills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
        const monthlySales = monthBills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);

        // Fetch Today's & Monthly Expenses
        const todayExpensesDoc = await Expense.find({ createdAt: { $gte: today } });
        const monthExpensesDoc = await Expense.find({ createdAt: { $gte: startOfMonth } });

        const todayExpenses = todayExpensesDoc.reduce((acc, e) => acc + (Number(e.expenseAmount) || 0), 0);
        const monthExpenses = monthExpensesDoc.reduce((acc, e) => acc + (Number(e.expenseAmount) || 0), 0);

        // Profit Calculation
        let todayGrossProfit = 0;
        for (const bill of todayBills) {
            if (Array.isArray(bill.products)) {
                for (const item of bill.products) {
                    if (item) {
                        const price = Number(item.productPrice) || 0;
                        const qty = Number(item.productQuantity) || 1;
                        let cost = Number(item.productCost) || 0;

                        if (cost <= 0 && item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                            const prod = await Product.findById(item.productId);
                            if (prod) cost = Number(prod.productCost) || 0;
                        }

                        todayGrossProfit += (price - cost) * qty;
                    }
                }
            }
        }

        const todayNetProfit = todayGrossProfit - todayExpenses;

        // Pending Udhar / Credit Balance
        const balanceSheets = await BlSheet.find();
        const pendingPayments = balanceSheets.reduce((acc, b) => acc + Math.max(0, Number(b.remainingBalance) || 0), 0);

        // Products & Stock Valuation
        const products = await Product.find();
        const lowStockCount = products.filter(p => (Number(p.stockQuantity) || 0) <= (p.reorderLevel || 10)).length;
        const totalStockValuation = products.reduce((acc, p) => acc + (Number(p.productCost || 0) * Number(p.stockQuantity || 0)), 0);

        // Customers count
        const totalCustomers = await Customer.countDocuments();

        res.status(200).json({
            todaySales,
            monthlySales,
            todayExpenses,
            monthExpenses,
            todayGrossProfit,
            todayNetProfit,
            pendingPayments,
            lowStockCount,
            totalProducts: products.length,
            totalCustomers,
            totalStockValuation
        });
    } catch (error) {
        next(error);
    }
};

const getGSTReport = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        const bills = await Bill.find({ createdAt: { $gte: startDate, $lte: endDate } });

        let taxableAmount = 0;
        let totalGST = 0;
        let cgst = 0;
        let sgst = 0;

        for (const bill of bills) {
            taxableAmount += Number(bill.totalAmount || 0) * 0.85; // Approximate taxable base
            totalGST += Number(bill.totalAmount || 0) * 0.15;
        }

        cgst = totalGST / 2;
        sgst = totalGST / 2;

        res.status(200).json({
            period: `${targetMonth + 1}/${targetYear}`,
            totalInvoices: bills.length,
            grossSales: bills.reduce((acc, b) => acc + Number(b.totalAmount || 0), 0),
            taxableAmount,
            totalGST,
            cgst,
            sgst
        });
    } catch (error) {
        next(error);
    }
};

const getPnLReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        } else {
            // Default to current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            query.createdAt = { $gte: startOfMonth };
        }

        const bills = await Bill.find(query);
        const expenses = await Expense.find(query);

        const grossSales = bills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.expenseAmount) || 0), 0);

        let totalCOGS = 0;
        for (const bill of bills) {
            if (Array.isArray(bill.products)) {
                for (const item of bill.products) {
                    if (item) {
                        const qty = Number(item.productQuantity) || 1;
                        let cost = Number(item.productCost) || 0;

                        if (cost <= 0 && item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                            const prod = await Product.findById(item.productId);
                            if (prod) cost = Number(prod.productCost) || 0;
                        }

                        totalCOGS += cost * qty;
                    }
                }
            }
        }

        const grossProfit = grossSales - totalCOGS;
        const netProfit = grossProfit - totalExpenses;
        const netMarginPercentage = grossSales > 0 ? Number(((netProfit / grossSales) * 100).toFixed(2)) : 0;

        res.status(200).json({
            grossSales,
            totalCOGS,
            grossProfit,
            totalExpenses,
            netProfit,
            netMarginPercentage
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getExecutiveDashboard,
    getGSTReport,
    getPnLReport
};
