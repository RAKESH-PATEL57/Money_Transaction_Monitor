import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const[form, setForm] = useState({ username: '', password: '' });

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, form);
      if (isLogin) {
        const userData = { id: res.data.user.id, username: res.data.user.username, budget: res.data.user.budget };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', res.data.token);
        setUser(userData);
      } else {
        alert("Account Created! System ready for login.");
        setIsLogin(true);
      }
    } catch (e) { alert(e.response?.data?.msg || "Authentication Failed"); }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2 style={{color: 'var(--neon-cyan)', textAlign: 'center', marginBottom: '20px', letterSpacing:'3px'}}>Money Transaction Monitor</h2>
        <input placeholder="Operator Identity (Username)" onChange={e => setForm({...form, username: e.target.value})} />
        <input type="password" placeholder="Passcode" onChange={e => setForm({...form, password: e.target.value})} />
        <button className="btn-neon" onClick={handleAuth}>{isLogin ? "INITIALIZE LOGIN" : "REGISTER OPERATOR"}</button>
        <p onClick={() => setIsLogin(!isLogin)} style={{textAlign:'center', fontSize:'12px', marginTop:'20px', cursor:'pointer', color:'var(--neon-cyan)'}}>
          {isLogin ? "NEW OPERATOR? CREATE UPLINK" : "HAVE UPLINK? INITIATE LOGIN"}
        </p>
      </div>
    </div>
  );
}