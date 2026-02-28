const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const tx = await Transaction.create(req.body);
        res.json(tx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const txs = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(txs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;