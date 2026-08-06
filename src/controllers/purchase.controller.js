import Purchase from '../models/purchaseModel.js';
import Product from '../models/productmodel.js';
import Supplier from '../models/supplierModel.js';
import StockLog from '../models/stockLogModel.js';
import { errorHandler } from '../uitils/errorHandler.js';

const createPurchase = async (req, res, next) => {
    try {
        const { supplierId, totalAmount, paidAmount, billNumber, notes, items = [] } = req.body;
        if (!supplierId) {
            return next(errorHandler(400, 'Supplier selection is required'));
        }
        if (!totalAmount || Number(totalAmount) <= 0) {
            return next(errorHandler(400, 'Valid total purchase amount is required'));
        }

        const purchaseNumber = `PO-${Date.now()}`;
        const total = Number(totalAmount);
        const paid = Math.max(0, Number(paidAmount || 0));
        const dueAmount = Math.max(0, total - paid);

        const paymentStatus = dueAmount === 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending');

        const newPurchase = new Purchase({
            purchaseNumber,
            supplierId,
            billNumber: billNumber || '',
            notes: notes || '',
            items,
            totalAmount: total,
            paidAmount: paid,
            dueAmount,
            paymentStatus,
            createdBy: req.user?.id || 'admin'
        });

        await newPurchase.save();

        // Increment inventory stock if items array is provided
        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (item.productId) {
                    const prod = await Product.findById(item.productId);
                    if (prod) {
                        const prevStock = Number(prod.stockQuantity) || 0;
                        const addQty = Number(item.quantity) || 0;
                        const newStock = prevStock + addQty;

                        prod.stockQuantity = newStock;
                        if (item.costPrice) prod.productCost = String(item.costPrice);
                        await prod.save();

                        await StockLog.create({
                            productId: prod._id,
                            productName: prod.productName,
                            type: 'STOCK_IN',
                            quantityChange: addQty,
                            previousStock: prevStock,
                            newStock: newStock,
                            reason: `Purchase Bill ${purchaseNumber}`,
                            performedBy: req.user?.id || 'admin'
                        });
                    }
                }
            }
        }

        // Senior Business Analyst Ledger Engine:
        // Update supplier outstanding balance & transaction history.
        // If paid > total (overpaid), the excess amount is automatically deducted from supplier's existing outstanding debt.
        const supplier = await Supplier.findById(supplierId);
        if (supplier) {
            const currentDebt = Number(supplier.outstandingBalance) || 0;
            const netChange = total - paid; // positive = increased debt, negative = excess paid deducting debt
            const newDebt = Math.max(0, currentDebt + netChange);

            supplier.outstandingBalance = newDebt;

            if (!Array.isArray(supplier.transactions)) {
                supplier.transactions = [];
            }

            // Log purchase transaction
            supplier.transactions.push({
                type: 'PURCHASE',
                amount: total,
                paymentMode: 'Bill Credit',
                notes: `Purchase Bill #${billNumber || purchaseNumber}`,
                date: new Date()
            });

            // Log payment transaction if cash/online paid during purchase entry
            if (paid > 0) {
                supplier.transactions.push({
                    type: 'PAYMENT',
                    amount: paid,
                    paymentMode: 'Cash/Online',
                    notes: paid > total 
                        ? `Purchase Entry Payment (Overpaid ₹${paid - total} deducted from outstanding debt)`
                        : `Purchase Entry Payment for Bill #${billNumber || purchaseNumber}`,
                    date: new Date()
                });
            }

            await supplier.save();
        }

        res.status(201).json({ message: 'Vendor purchase bill logged successfully', purchase: newPurchase });
    } catch (error) {
        next(error);
    }
};

const getAllPurchases = async (req, res, next) => {
    try {
        const purchases = await Purchase.find().populate('supplierId', 'supplierName companyName mobile').sort({ createdAt: -1 });
        res.status(200).json({ purchases });
    } catch (error) {
        next(error);
    }
};

export default {
    createPurchase,
    getAllPurchases
};
