const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Add Transaction
router.post('/add', async (req, res) => {
    try {
        const { userId, title, amount, type } = req.body;
        const newTx = new Transaction({ userId, title, amount, type });
        await newTx.save();
        res.json(newTx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Transactions by User
router.get('/:userId', async (req, res) => {
    const txs = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(txs);
});

module.exports = router;