import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Power, Wallet, Activity, Box } from 'lucide-react';
import TransactionForm from './TransactionForm';
import CategoryModules from './CategoryModules';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard({ user, setUser }) {
  const[transactions, setTransactions] = useState([]);
  const [budgetInput, setBudgetInput] = useState(user.budget || 0);
  const [filter, setFilter] = useState('monthly');
  const[snackbar, setSnackbar] = useState(null);

  useEffect(() => { fetchTransactions(); }, [user]);

  const fetchTransactions = async () => {
    const res = await axios.get(`${API_URL}/transactions/${user.id}`);
    setTransactions(res.data);
  };

  const handleUpdateBudget = async () => {
    await axios.post(`${API_URL}/user/budget`, { userId: user.id, budget: budgetInput });
    const updatedUser = { ...user, budget: budgetInput };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    showSnackbar("System Budget Calibrated!");
  };

  const showSnackbar = (msg) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 4000);
  };

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

    const currentMonthExpense = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth())
      .reduce((a, b) => a + b.amount, 0);

    return { expense, income, filtered, remaining: (user.budget || 0) - currentMonthExpense };
  },[transactions, filter, user]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div>
          <h1 style={{color:'var(--neon-cyan)', margin:0}}>Money Transaction Monitor</h1>
          <small style={{color:'var(--neon-purple)', letterSpacing:'2px'}}>WELCOME, OPERATOR {user.username.toUpperCase()}</small>
        </div>
        <Power style={{cursor:'pointer', color:'var(--neon-red)'}} size={32} onClick={() => {localStorage.clear(); window.location.reload();}} />
      </div>

      {/* Top Stats */}
      <div className="grid-3">
        <div className="glass-card" style={{textAlign:'center', borderBottom:'3px solid var(--neon-purple)'}}>
          <small>USED ({filter.toUpperCase()})</small>
          <h2 style={{color:'var(--neon-purple)'}}>₹{data.expense}</h2>
        </div>
        <div className="glass-card" style={{textAlign:'center', borderBottom:'3px solid var(--neon-cyan)'}}>
          <small>MONTHLY BUDGET</small>
          <h2 style={{color:'var(--neon-cyan)'}}>₹{user.budget}</h2>
        </div>
        <div className="glass-card" style={{textAlign:'center', borderBottom: data.remaining < 0 ? '3px solid var(--neon-red)' : '3px solid var(--neon-green)'}}>
          <small>REMAINING (MONTHLY)</small>
          <h2 style={{color: data.remaining < 0 ? 'var(--neon-red)' : 'var(--neon-green)'}}>₹{data.remaining}</h2>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}><Wallet size={20}/> BUDGET CONFIG</h3>
          <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} />
          <button className="btn-neon" onClick={handleUpdateBudget}>OVERRIDE BUDGET</button>
        </div>

        <TransactionForm user={user} setTransactions={setTransactions} showSnackbar={showSnackbar} transactions={transactions} remaining={data.remaining} />
      </div>

      {/* The Dynamic Grouped Category Sections */}
      <CategoryModules transactions={data.filtered} />

     {/* Raw Logs & Filters */}
      <div className="glass-card" style={{marginTop:'25px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap: 'wrap', gap:'15px'}}>
          <h3 style={{display:'flex', alignItems:'center', gap:'10px', margin:0}}>
            <Activity size={20}/> GLOBAL LOGS
          </h3>
          
          {/* TIME FILTERS - This controls both the Logs AND the Analytics modules! */}
          <div style={{display:'flex', gap:'10px'}}>
            <button className="btn-neon" style={{padding:'8px 15px', fontSize:'12px', background: filter === 'monthly' ? 'var(--neon-cyan)' : 'transparent', color: filter === 'monthly' ? '#000' : '#fff'}} onClick={() => setFilter('monthly')}>MONTH</button>
            <button className="btn-neon" style={{padding:'8px 15px', fontSize:'12px', background: filter === 'yearly' ? 'var(--neon-cyan)' : 'transparent', color: filter === 'yearly' ? '#000' : '#fff'}} onClick={() => setFilter('yearly')}>YEAR</button>
            <button className="btn-neon" style={{padding:'8px 15px', fontSize:'12px', background: filter === 'all' ? 'var(--neon-cyan)' : 'transparent', color: filter === 'all' ? '#000' : '#fff'}} onClick={() => setFilter('all')}>TOTAL</button>
          </div>
        </div>

        {data.filtered.slice(0, 10).map(t => (
          <div key={t._id} className="category-item" style={{borderLeft: `4px solid ${t.type === 'income' ? 'var(--neon-green)' : 'var(--neon-red)'}`}}>
            <div><strong>{t.title}</strong> <span style={{fontSize:'12px', color:'var(--neon-cyan)', marginLeft:'10px'}}>({t.category})</span><br/><small style={{color:'#888'}}>{new Date(t.date).toDateString()}</small></div>
            <div style={{fontWeight:'bold', color: t.type === 'income' ? 'var(--neon-green)' : 'var(--neon-red)'}}>
              {t.type === 'income' ? '+' : '-'} ₹{t.amount}
            </div>
          </div>
        ))}
      </div>

      {snackbar && <div className="snackbar">{snackbar}</div>}
    <Footer />
    </div>
  );
}