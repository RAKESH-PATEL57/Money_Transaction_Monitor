import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Power, Wallet, Plus, Activity, TrendingUp } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData')));
  const [isLogin, setIsLogin] = useState(true); // Toggle for Register/Login
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  
  const [transactions, setTransactions] = useState([]);
  const [budgetInput, setBudgetInput] = useState(user?.budget || 0);
  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'expense' });
  const [filter, setFilter] = useState('monthly');
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    const res = await axios.get(`${API_URL}/transactions/${user.id}`);
    setTransactions(res.data);
  };

  // --- LOGIC: Auto-suggestions from previous history ---
  const suggestions = useMemo(() => {
    const titles = transactions.map(t => t.title);
    return [...new Set(titles)];
  }, [transactions]);

  // --- LOGIC: Calculate Dynamic Totals ---
  const data = useMemo(() => {
    const now = new Date();
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      if (filter === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filter === 'yearly') return d.getFullYear() === now.getFullYear();
      return true;
    });

    const expense = filtered.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const income = filtered.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);

    // Specific calculation for Current Month Remaining
    const currentMonthExpense = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((a, b) => a + b.amount, 0);

    return { expense, income, filtered, remaining: (user?.budget || 0) - currentMonthExpense };
  }, [transactions, filter, user]);

  // --- ACTIONS ---
  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await axios.post(API_URL + endpoint, authForm);
      if (isLogin) {
        localStorage.setItem('userData', JSON.stringify(res.data.user ? {id: res.data.user.id, username: res.data.user.username, budget: res.data.user.budget} : null));
        localStorage.setItem('token', res.data.token);
        window.location.reload();
      } else {
        alert("Account Created! Please Login.");
        setIsLogin(true);
      }
    } catch (e) { alert(e.response?.data?.msg || "Error"); }
  };

  const handleUpdateBudget = async () => {
    await axios.post(`${API_URL}/user/budget`, { userId: user.id, budget: budgetInput });
    const updatedUser = { ...user, budget: budgetInput };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setSnackbar("Monthly Budget Updated!");
    setTimeout(() => setSnackbar(null), 3000);
  };

  const handleAddTx = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API_URL}/transactions/add`, { ...newTx, userId: user.id });
    const updated = [res.data, ...transactions];
    setTransactions(updated);

    // Snackbar alerts logic
    setSnackbar(`₹${newTx.amount} added. Remaining Monthly: ₹${data.remaining - (newTx.type === 'expense' ? newTx.amount : 0)}`);
    setTimeout(() => setSnackbar(null), 5000);
    setNewTx({ title: '', amount: '', type: 'expense' });
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="glass-card">
          <h2 style={{color: 'var(--neon-cyan)', textAlign: 'center'}}>CYBER VAULT</h2>
          <input placeholder="Username" onChange={e => setAuthForm({...authForm, username: e.target.value})} />
          <input type="password" placeholder="Password" onChange={e => setAuthForm({...authForm, password: e.target.value})} />
          <button className="btn-neon" onClick={handleAuth}>{isLogin ? "LOGIN" : "REGISTER"}</button>
          <p onClick={() => setIsLogin(!isLogin)} style={{textAlign:'center', fontSize:'12px', marginTop:'15px', cursor:'pointer'}}>
            {isLogin ? "NEW USER? CREATE ACCOUNT" : "HAVE ACCOUNT? LOGIN"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
        <h1 style={{color:'var(--neon-cyan)'}}>SYSTEM_CORE</h1>
        <Power style={{cursor:'pointer', color:'red'}} onClick={() => {localStorage.clear(); window.location.reload();}} />
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <small>USED ({filter.toUpperCase()})</small>
          <h2>₹{data.expense}</h2>
        </div>
        <div className="glass-card stat-card">
          <small>MONTHLY BUDGET</small>
          <h2>₹{user.budget}</h2>
        </div>
        <div className="glass-card stat-card">
          <small>REMAINING (MONTHLY)</small>
          <h2 style={{color: data.remaining < 0 ? 'red' : 'var(--neon-cyan)'}}>₹{data.remaining}</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card">
          <h3><Wallet size={18}/> BUDGET CONFIG</h3>
          <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} />
          <button className="btn-neon" onClick={handleUpdateBudget}>SET BUDGET</button>
        </div>

        <div className="glass-card">
          <h3><Plus size={18}/> NEW TRANSACTION</h3>
          <form onSubmit={handleAddTx}>
            <input 
              list="prev-items" 
              placeholder="Description (Tea, Meal...)" 
              value={newTx.title} 
              onChange={e => setNewTx({...newTx, title: e.target.value})} 
              required 
            />
            <datalist id="prev-items">
              {suggestions.map((s, i) => <option key={i} value={s} />)}
            </datalist>
            <input type="number" placeholder="Amount (₹)" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} required />
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})}>
              <option value="expense">EXPENSE</option>
              <option value="income">INCOME</option>
            </select>
            <button className="btn-neon" type="submit">EXECUTE</button>
          </form>
        </div>
      </div>

      <div className="glass-card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
          <h3><Activity size={18}/> TRANSACTION LOGS</h3>
          <div style={{display:'flex', gap:'5px'}}>
            <button className="btn-neon" style={{width:'auto', fontSize:'10px'}} onClick={() => setFilter('monthly')}>MONTH</button>
            <button className="btn-neon" style={{width:'auto', fontSize:'10px'}} onClick={() => setFilter('yearly')}>YEAR</button>
            <button className="btn-neon" style={{width:'auto', fontSize:'10px'}} onClick={() => setFilter('all')}>ALL</button>
          </div>
        </div>
        {data.filtered.map(t => (
          <div key={t._id} className="tx-item" style={{borderLeft: `3px solid ${t.type === 'income' ? '#00ff88' : '#ff4b2b'}`}}>
            <div><strong>{t.title}</strong><br/><small style={{color:'#666'}}>{new Date(t.date).toDateString()}</small></div>
            <div style={{fontWeight:'bold', color: t.type === 'income' ? '#00ff88' : '#ff4b2b'}}>
              {t.type === 'income' ? '+' : '-'} ₹{t.amount}
            </div>
          </div>
        ))}
      </div>

      {snackbar && <div className="snackbar">{snackbar}</div>}
    </div>
  );
}

export default App;