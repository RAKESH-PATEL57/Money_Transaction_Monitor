import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TransactionForm({ user, setTransactions, showSnackbar, transactions, remaining }) {
  const [newTx, setNewTx] = useState({ title: '', category: '', amount: '', type: 'expense' });

  // Auto-complete suggestions for future extensibility
  const dynamicCategories = useMemo(() => [...new Set(transactions.map(t => t.category))], [transactions]);

  const handleAddTx = async (e) => {
    e.preventDefault();
    const finalCategory = newTx.category.trim() || 'General';
    const res = await axios.post(`${API_URL}/transactions/add`, { ...newTx, category: finalCategory, userId: user.id });
    
    setTransactions(prev =>[res.data, ...prev]);
    showSnackbar(`₹${newTx.amount} logged under[${finalCategory}].`);
    setNewTx({ title: '', category: '', amount: '', type: 'expense' });
  };

  return (
    <div className="glass-card">
      <h3 style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}><Plus size={20}/> NEW RECORD</h3>
      <form onSubmit={handleAddTx} style={{display:'flex', flexDirection:'column', gap:'5px'}}>
        
        {/* Extensible Category Input */}
        <input list="categories" placeholder="Section/Category (Meals, Groceries...)" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} required />
        <datalist id="categories">
          <option value="Meals" />
          <option value="Groceries" />
          <option value="Utilities" />
          {dynamicCategories.map((c, i) => <option key={i} value={c} />)}
        </datalist>

        {/* Specific Item Input */}
        <input placeholder="Specific Item (Tea, Apple, Burger...)" value={newTx.title} onChange={e => setNewTx({...newTx, title: e.target.value})} required />
        
        <input type="number" placeholder="Amount (₹)" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} required />
        
        <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})}>
          <option value="expense">EXPENSE</option>
          <option value="income">INCOME</option>
        </select>
        
        <button className="btn-neon" type="submit">EXECUTE INJECTION</button>
      </form>
    </div>
  );
}