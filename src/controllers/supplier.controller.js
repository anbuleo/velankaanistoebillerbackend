import Supplier from '../models/supplierModel.js';
import Purchase from '../models/purchaseModel.js';
import { errorHandler } from '../uitils/errorHandler.js';

const createSupplier = async (req, res, next) => {
    try {
        const { supplierName, companyName, mobile, email, gstin, address } = req.body;
        if (!supplierName || !mobile) {
            return next(errorHandler(400, 'Supplier Name and Mobile are required'));
        }

        const newSupplier = new Supplier({ supplierName, companyName, mobile, email, gstin, address });
        await newSupplier.save();

        res.status(201).json({ message: 'Supplier created successfully', supplier: newSupplier });
    } catch (error) {
        next(error);
    }
};

const getAllSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.status(200).json({ suppliers });
    } catch (error) {
        next(error);
    }
};

const updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return next(errorHandler(404, 'Supplier not found'));
        res.status(200).json({ message: 'Supplier updated successfully', supplier: updated });
    } catch (error) {
        next(error);
    }
};

const deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Supplier.findByIdAndDelete(id);
        if (!deleted) return next(errorHandler(404, 'Supplier not found'));
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const recordVendorPayment = async (req, res, next) => {
    try {
        const { supplierId, amount, paymentMode, notes } = req.body;
        if (!supplierId || !amount || Number(amount) <= 0) {
            return next(errorHandler(400, 'Valid Supplier and Payment Amount are required'));
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) return next(errorHandler(404, 'Supplier not found'));

        const payAmount = Number(amount);
        const currentBalance = Number(supplier.outstandingBalance) || 0;
        const newBalance = Math.max(0, currentBalance - payAmount);

        supplier.outstandingBalance = newBalance;
        supplier.transactions.push({
            type: 'PAYMENT',
            amount: payAmount,
            paymentMode: paymentMode || 'Cash',
            notes: notes || 'Cash Payment to Vendor',
            date: new Date()
        });

        await supplier.save();

        res.status(200).json({
            message: `Recorded ₹${payAmount} payment to ${supplier.supplierName}`,
            supplier
        });
    } catch (error) {
        next(error);
    }
};

const getSupplierPaymentLogs = async (req, res, next) => {
    try {
        const [suppliers, purchases] = await Promise.all([
            Supplier.find(),
            Purchase.find().populate('supplierId', 'supplierName companyName mobile')
        ]);

        const paymentLogs = [];

        // 1. Include payments made during purchase bill entry
        for (const p of purchases) {
            if (p.paidAmount && Number(p.paidAmount) > 0) {
                paymentLogs.push({
                    _id: `pur-${p._id}`,
                    supplierId: p.supplierId?._id || p.supplierId,
                    supplierName: p.supplierId?.supplierName || 'Vendor',
                    companyName: p.supplierId?.companyName || '',
                    mobile: p.supplierId?.mobile || '',
                    amount: p.paidAmount,
                    paymentMode: 'Cash',
                    notes: `Paid on Purchase Bill #${p.billNumber || p.purchaseNumber}`,
                    date: p.createdAt || p.purchaseDate
                });
            }
        }

        // 2. Include standalone cash payments from supplier transactions
        for (const s of suppliers) {
            if (Array.isArray(s.transactions)) {
                for (const tx of s.transactions) {
                    if (tx.type === 'PAYMENT') {
                        paymentLogs.push({
                            _id: tx._id,
                            supplierId: s._id,
                            supplierName: s.supplierName,
                            companyName: s.companyName,
                            mobile: s.mobile,
                            amount: tx.amount,
                            paymentMode: tx.paymentMode || 'Cash',
                            notes: tx.notes || 'Cash Debt Settlement',
                            date: tx.date || s.updatedAt
                        });
                    }
                }
            }
        }

        paymentLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.status(200).json({ paymentLogs });
    } catch (error) {
        next(error);
    }
};

export default {
    createSupplier,
    getAllSuppliers,
    updateSupplier,
    deleteSupplier,
    recordVendorPayment,
    getSupplierPaymentLogs
};
