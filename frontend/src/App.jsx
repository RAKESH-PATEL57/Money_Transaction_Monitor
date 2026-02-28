import React, { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData')));

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return <Dashboard user={user} setUser={setUser} />;
}

export default App;