const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ msg: "Username already exists" });

        const hash = await bcrypt.hash(password, 10);
        await User.create({ username, password: hash });
        res.json({ status: 'ok', msg: 'User created' });
    } catch (e) { res.status(500).json({ msg: 'Server error' }); }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, budget: user.budget } });
});

router.post('/budget', async (req, res) => {
    const { userId, budget } = req.body;
    await User.findByIdAndUpdate(userId, { budget });
    res.json({ status: 'ok' });
});

module.exports = router;