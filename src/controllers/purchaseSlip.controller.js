import PurchaseSlip from '../models/purchaseSlipModel.js';
import { errorHandler } from '../uitils/errorHandler.js';

// Create a new purchase slip
export const createPurchaseSlip = async (req, res, next) => {
    try {
        const { slipDate, title, items } = req.body;
        const createBy = req.user?.id || 'system';

        const todayStr = slipDate || new Date().toISOString().split('T')[0];

        const newSlip = new PurchaseSlip({
            slipDate: todayStr,
            title: title || `Stock Buying Slip - ${todayStr}`,
            items: items || [],
            createBy
        });

        await newSlip.save();
        res.status(201).json({
            message: 'Purchase Slip Created Successfully',
            slip: newSlip
        });
    } catch (error) {
        next(error);
    }
};

// Get all purchase slips
export const getAllPurchaseSlips = async (req, res, next) => {
    try {
        const { date } = req.query;
        let query = {};
        if (date) {
            query.slipDate = date;
        }

        const slips = await PurchaseSlip.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Purchase Slips Fetched',
            slips
        });
    } catch (error) {
        next(error);
    }
};

// Update purchase slip items or status
export const updatePurchaseSlip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, status, items, slipDate } = req.body;

        const slip = await PurchaseSlip.findById(id);
        if (!slip) return next(errorHandler(404, 'Purchase Slip Not Found'));

        if (title) slip.title = title;
        if (status) slip.status = status;
        if (slipDate) slip.slipDate = slipDate;
        if (items && Array.isArray(items)) slip.items = items;

        // Auto calculate status if all items purchased
        if (slip.items && slip.items.length > 0) {
            const allPurchased = slip.items.every(i => i.isPurchased);
            const somePurchased = slip.items.some(i => i.isPurchased);
            if (allPurchased) slip.status = 'COMPLETED';
            else if (somePurchased) slip.status = 'PARTIAL';
        }

        await slip.save();
        res.status(200).json({
            message: 'Purchase Slip Updated',
            slip
        });
    } catch (error) {
        next(error);
    }
};

// Delete purchase slip
export const deletePurchaseSlip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const slip = await PurchaseSlip.findByIdAndDelete(id);
        if (!slip) return next(errorHandler(404, 'Purchase Slip Not Found'));

        res.status(200).json({
            message: 'Purchase Slip Deleted'
        });
    } catch (error) {
        next(error);
    }
};

// Manual Carryover Engine: Copy pending unfulfilled items to target date slip
export const carryoverPendingItems = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { targetDate } = req.body;

        const sourceSlip = await PurchaseSlip.findById(id);
        if (!sourceSlip) return next(errorHandler(404, 'Source Purchase Slip Not Found'));

        // Filter unfulfilled pending items
        const pendingItems = (sourceSlip.items || []).filter(i => !i.isPurchased).map(i => ({
            itemId: i.itemId || null,
            itemName: i.itemName,
            quantityNeeded: i.quantityNeeded,
            unit: i.unit || 'Pcs',
            vendorName: i.vendorName || 'General Market',
            isPurchased: false,
            notes: i.notes ? `Carried over: ${i.notes}` : 'Carried over from previous slip'
        }));

        if (pendingItems.length === 0) {
            return res.status(400).json({
                message: 'No pending items found to carry over!'
            });
        }

        const dateStr = targetDate || new Date().toISOString().split('T')[0];

        const targetSlip = new PurchaseSlip({
            slipDate: dateStr,
            title: `Carryover Buying Slip - ${dateStr}`,
            items: pendingItems,
            status: 'DRAFT',
            createBy: req.user?.id || 'system'
        });

        await targetSlip.save();

        res.status(201).json({
            message: `Successfully carried over ${pendingItems.length} pending items to ${dateStr}!`,
            slip: targetSlip
        });
    } catch (error) {
        next(error);
    }
};
