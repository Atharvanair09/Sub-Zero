import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointer2, TrendingUp, DollarSign, Wallet, ShieldCheck, ArrowRight, ShieldAlert, Zap, CreditCard } from 'lucide-react';

const data = [
  { name: 'MON', value: 400 },
  { name: 'TUE', value: 300 },
  { name: 'WED', value: 200 },
  { name: 'TODAY', value: 500, active: true },
  { name: 'FRI', value: 250 },
  { name: 'SAT', value: 350 },
  { name: 'SUN', value: 150 },
];

const Dashboard = () => {
  return (
    <div className="dashboard fade-in">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Monthly Spend</p>
            <h3>$1,248.50</h3>
            <span className="trend positive">
              <TrendingUp size={14} />
              +12.4% from last month
            </span>
          </div>
          <div className="stat-visual">
            <Wallet size={48} className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>AI Identified Savings</p>
            <h3 className="highlight">$342.15</h3>
            <span className="trend positive">
              <Zap size={14} fill="currentColor" />
              4 optimization paths ready
            </span>
          </div>
          <div className="stat-visual">
            <DollarSign size={48} className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Active Subscriptions</p>
            <h3>24</h3>
            <span className="trend">
              2 renewing this week
            </span>
          </div>
          <div className="stat-visual">
            <div className="grid-placeholder">
              {[...Array(9)].map((_, i) => <div key={i} className="dot" />)}
            </div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="insight-section card">
          <div className="badge badge-primary">AI ACTIVE INSIGHT</div>
          <h2>You can save <span>$84.00</span> on Cloud Storage.</h2>
          <p className="description">
            Our analysis shows overlapping usage between Dropbox and Google One. 
            Consolidation could reduce your fixed costs by 15% immediately.
          </p>
          <div className="insight-actions">
            <button className="primary-btn">Execute Optimization</button>
            <button className="secondary-btn">Dismiss</button>
          </div>

          <div className="confidence-score">
            <p>CONFIDENCE SCORE</p>
            <div className="score-header">
              <span className="score-value">98%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '98%' }} />
            </div>
            <p className="score-text">Based on 12 months of transactional data and usage patterns.</p>
          </div>
        </div>

        <div className="activity-section card">
          <div className="section-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon blue"><CreditCard size={18} /></div>
              <div className="activity-content">
                <div className="activity-top">
                  <span className="item-name">Netflix Premium</span>
                  <span className="item-price">$19.99</span>
                </div>
                <p>Automatic payment confirmed</p>
                <span className="item-time">2 HOURS AGO</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon purple"><Zap size={18} /></div>
              <div className="activity-content">
                <div className="activity-top">
                  <span className="item-name">AI Savings Found</span>
                  <span className="item-price positive">+$8.00/mo</span>
                </div>
                <p>Lower tier available for Figma</p>
                <span className="item-time">5 HOURS AGO</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon red"><ShieldAlert size={18} /></div>
              <div className="activity-content">
                <div className="activity-top">
                  <span className="item-name">Price Increase</span>
                  <span className="item-price negative">+$4.50</span>
                </div>
                <p>Adobe Creative Cloud</p>
                <span className="item-time">YESTERDAY</span>
              </div>
            </div>
          </div>

          <div className="account-health">
            <p>ACCOUNT HEALTH</p>
            <div className="health-status">
              <div className="status-indicator" />
              <span>Optimum</span>
            </div>
            <p className="health-desc">
              You've optimized 82% of your subscription portfolio this year.
            </p>
          </div>
        </div>
      </div>

      <div className="billing-cycle card">
        <div className="section-header">
          <h3>Upcoming Billing Cycle</h3>
          <div className="chart-controls">
            <button className="chart-btn">&lt;</button>
            <button className="chart-btn">&gt;</button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
              />
              <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="custom-tooltip">
                      <p>${payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? '#6366f1' : '#e2e8f0'} 
                    stroke={entry.active ? '#6366f1' : 'transparent'}
                    strokeWidth={entry.active ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.25rem;
          display: flex;
          justify-content: space-between;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .stat-info p {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .stat-info h3 {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .stat-info h3.highlight {
          color: var(--primary);
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .trend.positive { color: var(--success); }

        .stat-icon {
          color: #f1f5f9;
        }

        .grid-placeholder {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #e2e8f0;
          border-radius: 50%;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
          align-items: start;
        }

        .insight-section {
          padding: 2.5rem;
          background: linear-gradient(to bottom right, #ffffff, #f9fafb);
          position: relative;
          overflow: hidden;
        }

        .insight-section h2 {
          font-size: 2.75rem;
          font-weight: 700;
          max-width: 500px;
          line-height: 1.1;
          margin: 1.5rem 0;
          letter-spacing: -0.04em;
        }

        .insight-section h2 span {
          color: var(--primary);
        }

        .insight-section .description {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 450px;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .insight-actions {
          display: flex;
          gap: 1rem;
        }

        .primary-btn {
          background: var(--primary);
          color: white;
          padding: 0.85rem 1.75rem;
          border-radius: 0.75rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .secondary-btn {
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 0.85rem 1.75rem;
          border-radius: 0.75rem;
          font-weight: 600;
        }

        .confidence-score {
          position: absolute;
          top: 2.5rem;
          right: 2.5rem;
          width: 180px;
          background: white;
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        .confidence-score p:first-child {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .score-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .progress-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          margin: 0.75rem 0;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 3px;
        }

        .score-text {
          font-size: 0.65rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin: 1.5rem 0;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-icon.blue { background: #eff6ff; color: #3b82f6; }
        .activity-icon.purple { background: #f5f3ff; color: #8b5cf6; }
        .activity-icon.red { background: #fef2f2; color: #ef4444; }

        .activity-content { flex: 1; }

        .activity-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .item-name { font-weight: 600; font-size: 0.9rem; }
        .item-price { font-weight: 700; font-size: 0.9rem; }
        .item-price.positive { color: var(--success); }
        .item-price.negative { color: var(--danger); }

        .activity-content p { font-size: 0.8rem; color: var(--text-muted); }
        .item-time { font-size: 0.65rem; font-weight: 700; color: #94a3b8; margin-top: 0.25rem; display: block; }

        .account-health {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 1rem;
          margin-top: 1rem;
        }

        .health-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
          font-weight: 700;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .health-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-btn {
          width: 32px;
          height: 32px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 0.5rem;
          color: var(--text-muted);
        }

        .custom-tooltip {
          background: #1e293b;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.8rem;
          box-shadow: var(--shadow-lg);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
