import React from 'react';
import { Target, Utensils, ShoppingBag, Car, AlertCircle } from 'lucide-react';

const BudgetTracker = ({ stats }) => {
  const { foodSpend, shoppingSpend, transportSpend, categoryBudgets } = stats;

  const categories = [
    { 
      name: 'Food', 
      spend: foodSpend, 
      budget: categoryBudgets?.food || 2000, 
      icon: <Utensils size={18} />,
      color: '#ef4444' 
    },
    { 
      name: 'Shopping', 
      spend: shoppingSpend, 
      budget: categoryBudgets?.shopping || 3000, 
      icon: <ShoppingBag size={18} />,
      color: '#10b981' 
    },
    { 
      name: 'Transport', 
      spend: transportSpend, 
      budget: categoryBudgets?.transport || 1000, 
      icon: <Car size={18} />,
      color: '#3b82f6' 
    }
  ];

  return (
    <div className="budget-tracker card">
      <div className="section-header">
        <div className="flex items-center gap-2">
           <Target size={20} className="text-primary" />
           <h3 className="m-0">Budget Goals</h3>
        </div>
        <span className="badge badge-outline">Monthly View</span>
      </div>

      <div className="budget-list">
        {categories.map((cat, idx) => {
          const percent = Math.min(Math.round((cat.spend / cat.budget) * 100), 100);
          const isOver = cat.spend > cat.budget;
          const isWarning = percent > 80;

          return (
            <div key={idx} className="budget-item">
              <div className="budget-info">
                <div className="budget-label">
                  <div className="b-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h4>{cat.name}</h4>
                    <span className="b-details">₹{(cat.spend || 0).toLocaleString()} of ₹{(cat.budget || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="percent-mark" style={{ color: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#64748b' }}>
                  {percent}%
                </div>
              </div>
              
              <div className="budget-progress-bg">
                <div 
                  className="budget-progress-fill" 
                  style={{ 
                    width: `${percent}%`, 
                    background: isOver ? '#ef4444' : isWarning ? '#f59e0b' : cat.color 
                  }} 
                />
              </div>

              {isWarning && (
                <div className={`budget-alert ${isOver ? 'danger' : 'warning'}`}>
                  <AlertCircle size={12} />
                  <span>{isOver ? `Critical: Exceeded ${cat.name} budget!` : `80% of ${cat.name} budget used.`}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .budget-tracker { padding: 1.5rem; }
        .budget-list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
        .budget-item { display: flex; flex-direction: column; gap: 0.75rem; }
        .budget-info { display: flex; justify-content: space-between; align-items: flex-end; }
        .budget-label { display: flex; align-items: center; gap: 1rem; }
        .b-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .budget-label h4 { font-size: 0.95rem; font-weight: 700; margin: 0; }
        .b-details { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
        .percent-mark { font-size: 0.9rem; font-weight: 800; }
        
        .budget-progress-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
        .budget-progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        
        .budget-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .budget-alert.warning { background: #fffbeb; color: #b45309; }
        .budget-alert.danger { background: #fef2f2; color: #b91c1c; }
      `}</style>
    </div>
  );
};

export default BudgetTracker;
