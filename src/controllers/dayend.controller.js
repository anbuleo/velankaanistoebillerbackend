import DayEnd from '../models/dayEndModel.js';
import Bill from '../models/billModel.js';
import Expense from '../models/expenseModel.js';
import Supplier from '../models/supplierModel.js';
import Product from '../models/productmodel.js';
import CashDrawer from '../models/cashDrawerModel.js';
import { errorHandler } from '../uitils/errorHandler.js';

const getTodayEndSummary = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bills = await Bill.find({ createdAt: { $gte: today } });
        const expenses = await Expense.find({ createdAt: { $gte: today } });
        const suppliers = await Supplier.find();
        const activeShift = await CashDrawer.findOne({ cashierId: req.user?.id || 'admin', status: 'OPEN' });

        const totalBillsCount = bills.length;
        let totalSalesAmount = 0;
        let cashSales = 0;
        let onlineSales = 0;
        let creditSales = 0;
        let grossProfit = 0;

        for (const b of bills) {
            const amount = Number(b.totalAmount) || 0;
            totalSalesAmount += amount;

            if (b.paymentType === 'cash') cashSales += amount;
            else if (b.paymentType === 'online') onlineSales += amount;
            else if (b.paymentType === 'credit') creditSales += amount;

            // Gross Profit calculation
            if (Array.isArray(b.products)) {
                for (const item of b.products) {
                    if (item) {
                        const price = Number(item.productPrice) || 0;
                        const qty = Number(item.productQuantity) || 1;
                        let cost = Number(item.productCost) || 0;

                        if (cost <= 0 && item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                            const prod = await Product.findById(item.productId);
                            if (prod) cost = Number(prod.productCost) || 0;
                        }

                        grossProfit += (price - cost) * qty;
                    }
                }
            }
        }

        const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.expenseAmount) || 0), 0);

        let totalVendorPayments = 0;
        for (const s of suppliers) {
            if (Array.isArray(s.transactions)) {
                for (const tx of s.transactions) {
                    if (tx.type === 'PAYMENT' && new Date(tx.date) >= today) {
                        totalVendorPayments += Number(tx.amount) || 0;
                    }
                }
            }
        }

        const netProfit = grossProfit - totalExpenses;
        const openingDrawerCash = activeShift?.openingCash || 0;
        const expectedDrawerCash = (openingDrawerCash + cashSales) - (totalExpenses + totalVendorPayments);

        res.status(200).json({
            todaySummary: {
                date: new Date(),
                totalBillsCount,
                totalSalesAmount,
                cashSales,
                onlineSales,
                creditSales,
                totalExpenses,
                totalVendorPayments,
                grossProfit,
                netProfit,
                openingDrawerCash,
                expectedDrawerCash
            }
        });
    } catch (error) {
        next(error);
    }
};

const closeDayEnd = async (req, res, next) => {
    try {
        const { actualDrawerCash, notes } = req.body;
        const closedBy = req.user?.id || 'admin';
        const closedByName = req.user?.userName || 'Admin';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bills = await Bill.find({ createdAt: { $gte: today } });
        const expenses = await Expense.find({ createdAt: { $gte: today } });
        const suppliers = await Supplier.find();
        const activeShift = await CashDrawer.findOne({ cashierId: closedBy, status: 'OPEN' });

        const totalBillsCount = bills.length;
        let totalSalesAmount = 0;
        let cashSales = 0;
        let onlineSales = 0;
        let creditSales = 0;
        let grossProfit = 0;

        for (const b of bills) {
            const amount = Number(b.totalAmount) || 0;
            totalSalesAmount += amount;

            if (b.paymentType === 'cash') cashSales += amount;
            else if (b.paymentType === 'online') onlineSales += amount;
            else if (b.paymentType === 'credit') creditSales += amount;

            if (Array.isArray(b.products)) {
                for (const item of b.products) {
                    if (item) {
                        const price = Number(item.productPrice) || 0;
                        const qty = Number(item.productQuantity) || 1;
                        let cost = Number(item.productCost) || 0;

                        if (cost <= 0 && item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                            const prod = await Product.findById(item.productId);
                            if (prod) cost = Number(prod.productCost) || 0;
                        }

                        grossProfit += (price - cost) * qty;
                    }
                }
            }
        }

        const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.expenseAmount) || 0), 0);

        let totalVendorPayments = 0;
        for (const s of suppliers) {
            if (Array.isArray(s.transactions)) {
                for (const tx of s.transactions) {
                    if (tx.type === 'PAYMENT' && new Date(tx.date) >= today) {
                        totalVendorPayments += Number(tx.amount) || 0;
                    }
                }
            }
        }

        const netProfit = grossProfit - totalExpenses;
        const openingDrawerCash = activeShift?.openingCash || 0;
        const expectedDrawerCash = (openingDrawerCash + cashSales) - (totalExpenses + totalVendorPayments);
        const actual = Number(actualDrawerCash || expectedDrawerCash);
        const discrepancy = actual - expectedDrawerCash;

        const dayEnd = new DayEnd({
            date: new Date(),
            closedBy,
            closedByName,
            totalBillsCount,
            totalSalesAmount,
            cashSales,
            onlineSales,
            creditSales,
            totalExpenses,
            totalVendorPayments,
            grossProfit,
            netProfit,
            openingDrawerCash,
            expectedDrawerCash,
            actualDrawerCash: actual,
            discrepancy,
            notes: notes || 'Day End Night Closure'
        });

        await dayEnd.save();

        // Close any active cash drawer shift automatically
        if (activeShift) {
            activeShift.actualClosingCash = actual;
            activeShift.discrepancy = discrepancy;
            activeShift.status = 'CLOSED';
            activeShift.notes += ' | Closed during Day End EOD';
            await activeShift.save();
        }

        res.status(201).json({
            message: 'Day End (EOD) Closure Completed Successfully!',
            dayEnd
        });
    } catch (error) {
        next(error);
    }
};

const getDayEndHistory = async (req, res, next) => {
    try {
        const history = await DayEnd.find().sort({ createdAt: -1 });
        res.status(200).json({ history });
    } catch (error) {
        next(error);
    }
};

export default {
    getTodayEndSummary,
    closeDayEnd,
    getDayEndHistory
};
