import CashDrawer from '../models/cashDrawerModel.js';
import Bill from '../models/billModel.js';
import Expense from '../models/expenseModel.js';
import Supplier from '../models/supplierModel.js';
import { errorHandler } from '../uitils/errorHandler.js';

const openShift = async (req, res, next) => {
    try {
        const { openingCash, notes } = req.body;
        const cashierId = req.user?.id || 'admin';
        const cashierName = req.user?.userName || 'Staff';

        // Check if cashier already has an active OPEN shift
        const existingOpen = await CashDrawer.findOne({ cashierId, status: 'OPEN' });
        if (existingOpen) {
            return res.status(200).json({ message: 'Shift already active', shift: existingOpen });
        }

        const newShift = new CashDrawer({
            cashierId,
            cashierName,
            openingCash: Number(openingCash || 0),
            status: 'OPEN',
            notes: notes || 'Shift started'
        });

        await newShift.save();
        res.status(201).json({ message: 'Cash drawer shift opened', shift: newShift });
    } catch (error) {
        next(error);
    }
};

const getActiveShift = async (req, res, next) => {
    try {
        const cashierId = req.user?.id || 'admin';
        const shift = await CashDrawer.findOne({ cashierId, status: 'OPEN' });

        if (!shift) {
            return res.status(200).json({ active: false, message: 'No active cash shift' });
        }

        const shiftStart = shift.createdAt;

        // Fetch Cash Bills generated during this shift
        const cashBills = await Bill.find({
            createdAt: { $gte: shiftStart },
            paymentType: 'cash'
        });
        const cashSales = cashBills.reduce((acc, b) => acc + (Number(b.paidAmount || b.totalAmount) || 0), 0);

        // Fetch Cash Expenses logged during this shift
        const expenses = await Expense.find({
            createdAt: { $gte: shiftStart }
        });
        const expensesPaid = expenses.reduce((acc, e) => acc + (Number(e.expenseAmount) || 0), 0);

        // Fetch Cash Vendor Payments
        const suppliers = await Supplier.find();
        let vendorPaymentsPaid = 0;
        for (const s of suppliers) {
            if (Array.isArray(s.transactions)) {
                for (const tx of s.transactions) {
                    if (tx.type === 'PAYMENT' && tx.paymentMode === 'Cash' && new Date(tx.date) >= shiftStart) {
                        vendorPaymentsPaid += Number(tx.amount) || 0;
                    }
                }
            }
        }

        const expectedClosingCash = (shift.openingCash + cashSales) - (expensesPaid + vendorPaymentsPaid);

        shift.cashSales = cashSales;
        shift.expensesPaid = expensesPaid;
        shift.vendorPaymentsPaid = vendorPaymentsPaid;
        shift.expectedClosingCash = expectedClosingCash;

        res.status(200).json({ active: true, shift });
    } catch (error) {
        next(error);
    }
};

const closeShift = async (req, res, next) => {
    try {
        const { actualClosingCash, notes } = req.body;
        const cashierId = req.user?.id || 'admin';

        const shift = await CashDrawer.findOne({ cashierId, status: 'OPEN' });
        if (!shift) return next(errorHandler(404, 'No active shift to close'));

        const actual = Number(actualClosingCash || 0);
        const expected = Number(shift.expectedClosingCash || 0);
        const discrepancy = actual - expected;

        shift.actualClosingCash = actual;
        shift.discrepancy = discrepancy;
        shift.status = 'CLOSED';
        if (notes) shift.notes += ` | Closing: ${notes}`;

        await shift.save();

        res.status(200).json({
            message: 'Cash drawer shift closed & audited',
            shift,
            discrepancy
        });
    } catch (error) {
        next(error);
    }
};

const getShiftHistory = async (req, res, next) => {
    try {
        const shifts = await CashDrawer.find().sort({ createdAt: -1 });
        res.status(200).json({ shifts });
    } catch (error) {
        next(error);
    }
};

export default {
    openShift,
    getActiveShift,
    closeShift,
    getShiftHistory
};
