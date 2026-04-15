import React, { useState } from 'react';
import { TrendingUp, Calculator, ArrowRight, Zap } from 'lucide-react';

const SavingsSimulator = () => {
  const [ordersPerWeek, setOrdersPerWeek] = useState(5);
  const [avgCost, setAvgCost] = useState(250);

  // Baseline for comparison (e.g. current detected behavior)
  const baselineOrders = 7;
  const baselineCost = 350;

  const currentMonthly = ordersPerWeek * avgCost * 4;
  const baselineMonthly = baselineOrders * baselineCost * 4;
  const monthlySavings = baselineMonthly - currentMonthly;
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="simulator-card card fade-in">
      <div className="sim-header">
        <div className="icon-box">
          <Calculator size={20} className="text-primary" />
        </div>
        <div>
          <h3>Savings Simulator</h3>
          <p className="text-muted">Adjust sliders to see potential savings</p>
        </div>
      </div>

      <div className="sim-body">
        <div className="control-group">
          <div className="label-row">
            <label>Orders per week</label>
            <span className="value-badge">{ordersPerWeek}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="14" 
            value={ordersPerWeek} 
            onChange={(e) => setOrdersPerWeek(parseInt(e.target.value))}
            className="sim-slider"
          />
        </div>

        <div className="control-group">
          <div className="label-row">
            <label>Avg. cost per order</label>
            <span className="value-badge">₹{avgCost}</span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="1000" 
            step="10"
            value={avgCost} 
            onChange={(e) => setAvgCost(parseInt(e.target.value))}
            className="sim-slider"
          />
        </div>

        <div className="roi-panel">
          <div className="roi-item">
            <p>Monthly Savings</p>
            <h2 className={monthlySavings > 0 ? "text-success" : ""}>
              ₹{monthlySavings > 0 ? monthlySavings.toLocaleString() : 0}
            </h2>
          </div>
          <div className="roi-item">
            <p>Yearly Projection</p>
            <h2 className={yearlySavings > 0 ? "text-primary" : ""}>
              ₹{yearlySavings > 0 ? yearlySavings.toLocaleString() : 0}
            </h2>
          </div>
        </div>

        {yearlySavings > 5000 && (
          <div className="sim-nudge">
            <Zap size={14} fill="#6366f1" color="#6366f1" />
            <span>That's enough for a 1-year Disney+ subscription!</span>
          </div>
        )}
      </div>

      <style>{`
        .simulator-card {
          padding: 1.5rem;
          background: #ffffff;
        }
        .sim-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
        }
        .icon-box {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sim-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
        .sim-header p { font-size: 0.75rem; margin: 0; }
        
        .control-group { margin-bottom: 1.5rem; }
        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .label-row label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .value-badge {
          background: #f1f5f9;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
        }

        .sim-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          outline: none;
        }
        .sim-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #6366f1;
          transition: all 0.2s;
        }
        .sim-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .roi-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 1rem;
          margin-top: 2rem;
        }
        .roi-item p { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; }
        .roi-item h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
        
        .sim-nudge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }
        .text-success { color: #10b981; }
        .text-primary { color: #6366f1; }
      `}</style>
    </div>
  );
};

export default SavingsSimulator;
