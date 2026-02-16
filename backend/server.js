const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Vault"))
    .catch(err => console.error(err));

// --- MODELS ---
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    budget: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- AUTH ROUTES ---

// Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ msg: "Username already exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hash });
        res.json({ status: 'ok', msg: 'User created' });
    } catch (e) { res.status(500).json({ msg: 'Server error' }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, 'CYBER_SECRET');
    res.json({ token, user: { id: user._id, username: user.username, budget: user.budget } });
});

// Update Budget
app.post('/api/user/budget', async (req, res) => {
    const { userId, budget } = req.body;
    await User.findByIdAndUpdate(userId, { budget });
    res.json({ status: 'ok' });
});

// --- TRANSACTION ROUTES ---

app.post('/api/transactions/add', async (req, res) => {
    const tx = await Transaction.create(req.body);
    res.json(tx);
});

app.get('/api/transactions/:userId', async (req, res) => {
    const txs = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(txs);
});

app.listen(5000, () => console.log('CyberServer running on port 5000'));