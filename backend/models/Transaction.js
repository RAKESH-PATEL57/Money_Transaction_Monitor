const mongoose = require('mongoose');

// Added 'category' field to support dynamic sections (Meals, Groceries, etc.)
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, // e.g., Tea, Fruits, Apples
    category: { type: String, default: 'General' }, // e.g., Meals, Groceries
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);