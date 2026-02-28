import React, { useMemo } from 'react';
import { PieChart } from 'lucide-react';

export default function CategoryModules({ transactions }) {
  
  // LOGIC: Group by Category -> Then Group by Item Name
  const groupedData = useMemo(() => {
    const groups = {};
    
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'General';
        
        // Normalize item name (so "tea", "Tea", " TEA" all group together)
        const rawName = t.title.trim();
        const itemName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

        if (!groups[cat]) groups[cat] = { total: 0, itemsMap: {} };

        // Add to Category Total
        groups[cat].total += t.amount;

        // Add to Specific Item Total
        if (!groups[cat].itemsMap[itemName]) {
          groups[cat].itemsMap[itemName] = 0;
        }
        groups[cat].itemsMap[itemName] += t.amount;
      }
    });

    // Convert grouped map into sorted arrays for UI rendering
    Object.keys(groups).forEach(cat => {
      const itemsArray = Object.keys(groups[cat].itemsMap).map(name => {
        const amount = groups[cat].itemsMap[name];
        const percentage = ((amount / groups[cat].total) * 100).toFixed(1);
        return { name, amount, percentage };
      });
      
      // Sort highest waste to lowest waste
      groups[cat].itemsList = itemsArray.sort((a, b) => b.amount - a.amount);
    });

    return groups;
  }, [transactions]);

  const categories = Object.keys(groupedData);

  if (categories.length === 0) return null;

  return (
    <div style={{marginTop: '30px'}}>
      <h3 style={{marginBottom:'20px', color:'var(--neon-cyan)', display:'flex', alignItems:'center', gap:'10px'}}>
        <PieChart size={20}/> ITEM UTILIZATION ANALYTICS
      </h3>
      
      <div className="grid-3">
        {categories.map(cat => (
          <div key={cat} className="glass-card category-module">
            
            {/* Header: Category Name & Total */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px', marginBottom:'15px'}}>
              <h4 style={{color:'var(--neon-purple)', margin:0, textTransform:'uppercase'}}>{cat}</h4>
              <span style={{fontWeight:'bold', color:'var(--neon-cyan)', fontSize:'1.2rem'}}>₹{groupedData[cat].total}</span>
            </div>
            
            {/* Body: Specific Items Breakdown */}
            <div style={{maxHeight:'250px', overflowY:'auto', paddingRight:'10px'}}>
              {groupedData[cat].itemsList.map(item => (
                <div key={item.name}>
                  <div className="item-stat">
                    <span style={{color:'#ddd'}}>{item.name}</span>
                    <div>
                      <span style={{color:'var(--neon-red)', marginRight:'8px'}}>₹{item.amount}</span>
                      <small style={{color:'#888'}}>({item.percentage}%)</small>
                    </div>
                  </div>
                  {/* Neon Progress Bar */}
                  <div className="progress-track">
                    <div className="progress-fill" style={{width: `${item.percentage}%`}}></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}