import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Cell, Tooltip } from 'recharts';
import { Settings, Zap, History, ShieldCheck, TrendingDown, ArrowRight } from 'lucide-react';

const healthData = [
  { name: 'MAY 01', value: 120 },
  { name: '', value: 150 },
  { name: '', value: 180 },
  { name: 'MAY 10', value: 200 },
  { name: '', value: 130 },
  { name: '', value: 160 },
  { name: 'MAY 20', value: 250, highlight: true },
  { name: '', value: 140 },
  { name: '', value: 110 },
  { name: 'TODAY', value: 190 },
];

const optimizationActions = [
  {
    date: 'Oct 24, 2023',
    time: '09:12 AM',
    action: 'Automatic Downgrade',
    reason: 'Usage analytics triggered tier shift',
    entity: 'Netflix Premium',
    impact: '+₹450 /mo',
    status: 'SUCCESS',
    icon: 'N'
  },
  {
    date: 'Oct 23, 2023',
    time: '04:45 PM',
    action: 'Bundle Negotiation',
    reason: 'AI Negotiator applied coupon code',
    entity: 'Adobe CC',
    impact: '+₹900 /mo',
    status: 'SUCCESS',
    icon: 'A'
  },
  {
    date: 'Oct 22, 2023',
    time: '11:02 AM',
    action: 'Cancellation Prompt',
    reason: 'No activity detected for 60 days',
    entity: 'MasterClass',
    impact: 'Pending...',
    status: 'USER_ACTION',
    icon: 'M'
  }
];

const Activity = ({ userId }) => {
  const [subscriptions, setSubscriptions] = React.useState([]);

  React.useEffect(() => {
    const url = userId 
      ? `http://localhost:5000/api/subscriptions?userId=${userId}` 
      : 'http://localhost:5000/api/subscriptions';
    fetch(url)
      .then(res => res.json())
      .then(data => setSubscriptions(data))
      .catch(err => console.error(err));
  }, [userId]);

  const potentialSavings = subscriptions
    .filter(sub => !sub.usedRecently)
    .reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="activity-page fade-in">
      <div className="page-header">
        <h1>Activity & Insights</h1>
        <p className="subtitle">AI-driven financial logs and real-time optimization health metrics.</p>

        <div className="header-chips">
          <div className="summary-pill blue">
            <span>POTENTIAL SAVINGS</span>
            <strong>₹{potentialSavings.toFixed(2)}</strong>
          </div>
          <div className="summary-pill purple">
            <span>ACTIVE SERVICES</span>
            <strong>{subscriptions.length}</strong>
          </div>
        </div>
      </div>

      <div className="top-grid">
        <div className="health-card card">
          <div className="card-header">
            <div>
              <h3>AI Optimization Health</h3>
              <p>Efficiency performance over the last 30 days</p>
            </div>
            <div className="health-badge">
              <div className="pulse-dot" />
              Peak Performance
            </div>
          </div>

          <div className="health-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={healthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={34}>
                  {healthData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.highlight ? '#4f46e5' : index % 3 === 0 ? '#e2e8f0' : '#c7d2fe'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sync-card card">
          <h3>
            <History size={18} />
            Syncing Data...
          </h3>
          <div className="skeleton-list">
             <div className="skeleton-item">
                <div className="skeleton-bar primary" style={{ width: '60%' }} />
                <div className="skeleton-line" style={{ width: '80%' }} />
             </div>
             <div className="skeleton-item">
                <div className="skeleton-bar secondary" style={{ width: '30%' }} />
                <div className="skeleton-line" style={{ width: '60%' }} />
             </div>
             <div className="skeleton-item">
                <div className="skeleton-line" style={{ width: '40%' }} />
             </div>
          </div>
          <p className="sync-footer">Estimated completion: 45s</p>
        </div>
      </div>

      <div className="actions-card card">
        <div className="section-header">
          <h3>Recent Optimization Actions</h3>
          <div className="filter-group">
            <button className="filter-btn active">All Logs</button>
            <button className="filter-btn">Critical Only</button>
          </div>
        </div>

        <table className="actions-table">
          <thead>
            <tr>
              <th>DATE/TIME</th>
              <th>ACTION TAKEN</th>
              <th>ENTITY</th>
              <th>SAVINGS IMPACT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {optimizationActions.map((action, idx) => (
              <tr key={idx}>
                <td>
                  <span className="bold">{action.date}</span>
                  <span className="muted">{action.time}</span>
                </td>
                <td>
                  <span className="bold">{action.action}</span>
                  <span className="muted">{action.reason}</span>
                </td>
                <td>
                  <div className="entity-cell">
                    <div className="entity-icon" style={{
                      background: action.icon === 'N' ? '#000' : action.icon === 'A' ? '#00c3ff' : '#ff4500'
                    }}>{action.icon}</div>
                    <span>{action.entity}</span>
                  </div>
                </td>
                <td>
                  <span className={`impact-text ${action.impact.startsWith('+') ? 'success' : 'pending'}`}>
                    {action.impact}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${action.status.toLowerCase()}`}>
                    {action.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-grid">
        <div className="insight-card card">
          <div className="insight-badge">PREDICTION</div>
          <div className="insight-icon trending"><TrendingDown size={20} /></div>
          <h3>Upcoming Trend</h3>
          <p>
            Based on your current stack, your expenses are projected to drop by <span>14%</span> next month as 3 seasonal subscriptions expire.
          </p>
          <button className="link-btn">
            Review Details <ArrowRight size={14} />
          </button>
        </div>

        <div className="insight-card card">
           <div className="insight-badge">SECURITY</div>
           <div className="insight-icon security"><ShieldCheck size={20} /></div>
           <h3>Privacy Audit</h3>
           <p>
             Your account linked with <strong>SubZero AI</strong> is encrypted with 256-bit AES. 0 data leaks detected in connected providers.
           </p>
           <button className="link-btn">
             Check Permissions <ArrowRight size={14} />
           </button>
        </div>
      </div>

      <style>{`
        .activity-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          position: relative;
        }

        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .header-chips {
          display: flex;
          gap: 1rem;
          position: absolute;
          top: 0;
          right: 0;
        }

        .summary-pill {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .summary-pill span {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 0.4rem;
        }

        .summary-pill strong {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .summary-pill.blue strong { color: #4f46e5; }
        .summary-pill.purple strong { color: #9333ea; }

        .top-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
        }

        .health-card { padding: 2.5rem; }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .card-header h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
        .card-header p { font-size: 0.9rem; color: var(--text-muted); }

        .health-badge {
          background: #f0fdf4;
          color: #166534;
          padding: 0.4rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .sync-card {
          padding: 2rem;
          background: linear-gradient(to bottom, #ffffff, #f1f5f9);
        }

        .sync-card h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.5rem;
        }

        .skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skeleton-bar {
          height: 8px;
          border-radius: 4px;
        }

        .skeleton-bar.primary { background: #6366f1; opacity: 0.8; }
        .skeleton-bar.secondary { background: #8b5cf6; opacity: 0.8; }

        .skeleton-line {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
        }

        .sync-footer {
          margin-top: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-align: right;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .filter-group {
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 0.75rem;
          display: flex;
        }

        .filter-btn {
          padding: 0.4rem 1rem;
          border-radius: 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .filter-btn.active {
          background: white;
          color: var(--text-main);
          box-shadow: var(--shadow-sm);
        }

        .actions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .actions-table th {
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .actions-table td {
          padding: 1.5rem 0;
          border-bottom: 1px solid #f8fafc;
        }

        .actions-table span { display: block; }
        .bold { font-weight: 700; font-size: 0.95rem; color: var(--text-main); }
        .muted { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

        .entity-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .entity-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 900;
        }

        .impact-text { font-weight: 800; font-size: 1rem; }
        .impact-text.success { color: #4f46e5; }
        .impact-text.pending { color: #94a3b8; }

        .status-pill {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .status-pill.success { background: #f1f5f9; color: #334155; }
        .status-pill.user_action { background: #fce7f3; color: #be185d; }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .insight-card {
          padding: 2.5rem;
          position: relative;
        }

        .insight-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          background: #f1f5f9;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .insight-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .insight-icon.trending { background: #eef2ff; color: #6366f1; }
        .insight-icon.security { background: #fdf2f8; color: #db2777; }

        .insight-card h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
        .insight-card p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem; }
        .insight-card p span, .insight-card p strong { color: var(--primary); font-weight: 700; }

        .link-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: var(--primary);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Activity;
