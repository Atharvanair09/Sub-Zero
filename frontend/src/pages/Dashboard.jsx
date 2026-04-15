import React from 'react';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from 'recharts';
import { MousePointer2, TrendingUp, DollarSign, Wallet, ShieldCheck, ArrowRight, ShieldAlert, Zap, CreditCard, Utensils, Target, Clock, ShoppingCart } from 'lucide-react';
import SavingsSimulator from '../components/SavingsSimulator';
import BudgetTracker from '../components/BudgetTracker';

const data = [
  { name: 'MON', value: 400 },
  { name: 'TUE', value: 300 },
  { name: 'WED', value: 200 },
  { name: 'TODAY', value: 500, active: true },
  { name: 'FRI', value: 250 },
  { name: 'SAT', value: 350 },
  { name: 'SUN', value: 150 },
];

const Dashboard = ({ userId }) => {
  const [stats, setStats] = React.useState({
    monthlySpend: 0,
    yearlyProjection: 0,
    pieChart: [],
    totalSubs: 0,
    totalTxns: 0,
    foodSpend: 0,
    shoppingSpend: 0,
    transportSpend: 0,
    subPercent: 0,
    healthScore: 100,
    monthlyBudget: 0,
    categoryBudgets: { food: 2000, shopping: 3000, transport: 1000 },
    recentActivity: []
  });
  const [insights, setInsights] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const [statsRes, insightsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/dashboard/stats?userId=${userId}`),
          fetch(`http://localhost:5000/api/insights/patterns?userId=${userId}`)
        ]);
        const statsData = await statsRes.json();
        const insightsData = await insightsRes.json();
        
        setStats(statsData);
        if (insightsData.success) {
          setInsights(insightsData.insights);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

  if (loading) return <div className="loading">Loading insights...</div>;

  return (
    <div className="dashboard fade-in">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Monthly Spend</p>
            <h3>₹{stats.monthlySpend.toFixed(2)}</h3>
            <span className="trend positive">
              <TrendingUp size={14} />
              Synced across {stats.totalSubs + stats.totalTxns} sources
            </span>
          </div>
          <div className="stat-visual">
            <Wallet size={48} className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>AI Identified Savings</p>
            <h3 className="highlight">₹{(stats.monthlySpend * 0.15).toFixed(2)}</h3>
            <span className="trend positive">
              <Zap size={14} fill="currentColor" />
              Optimization paths ready
            </span>
          </div>
          <div className="stat-visual">
            <DollarSign size={48} className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Financial Intelligence</p>
            <h3>{stats.subPercent.toFixed(1)}%</h3>
            <span className="trend">
              Subscriptions % of Total Spend
            </span>
          </div>
          <div className="stat-visual">
            <div className="grid-placeholder">
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#cbd5e1' }}>%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="insight-section card">
          <div className="badge badge-primary">SPENDING INSIGHTS</div>
          <h2>You spent <span>₹{stats.foodSpend.toFixed(2)}</span> on food delivery this month.</h2>
          <p className="description">
            Your recurring subscriptions make up <strong>{stats.subPercent.toFixed(1)}%</strong> of your tracked expenses. 
            {stats.monthlyBudget > 0 && stats.monthlySpend > stats.monthlyBudget ? (
              <span className="text-danger"><br/>Warning: You are over your monthly budget of ₹{stats.monthlyBudget}.</span>
            ) : null}
          </p>
          <div className="insight-actions">
            <button className="primary-btn">View All Expenses</button>
            <button className="secondary-btn">Set Budget</button>
          </div>

          <div className="behavior-cards">
            {insights.map((insight, idx) => (
              <div key={idx} className={`behavior-pill ${insight.type}`}>
                <div className="pill-head">
                  <div className="pill-icon">
                    {insight.type === 'food' && <Utensils size={14} />}
                    {insight.type === 'behavioral' && <Clock size={14} />}
                    {insight.type === 'shopping' && <ShoppingCart size={14} />}
                  </div>
                  <span>{insight.title}</span>
                </div>
                <p>{insight.message}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="behavior-pill empty">
                <ShieldCheck size={14} />
                <span>Scanning behavior for savings...</span>
              </div>
            )}
          </div>

          <div className="confidence-score">
            <p>SUBSCRIPTION HEALTH</p>
            <div className="score-header">
              <span className="score-value">{stats.healthScore}/100</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.healthScore}%`, background: stats.healthScore < 50 ? '#ef4444' : stats.healthScore < 80 ? '#f59e0b' : '#10b981' }} />
            </div>
            <p className="score-text">Based on your usage vs cost ratio.</p>
          </div>
        </div>

        <div className="activity-section card">
          <div className="section-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {(stats.recentActivity || []).map((item, idx) => {
              const isTxn = item.type === 'transaction';
              const timeString = new Date(item.date).toLocaleDateString() === new Date().toLocaleDateString()
                ? "TODAY" : new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={item.id || idx} className="activity-item">
                  <div className={`activity-icon ${isTxn ? 'blue' : item.subType === 'price_increase' ? 'red' : 'purple'}`}>
                    {item.logo ? <img src={item.logo} alt="" className="item-logo-img" /> : (isTxn ? <CreditCard size={18} /> : item.subType === 'price_increase' ? <ShieldAlert size={18} /> : <Zap size={18} />)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-top">
                      <span className="item-name">{item.name}</span>
                      <span className={`item-price ${!isTxn ? 'positive' : ''}`}>
                         {isTxn ? `₹${item.price}` : item.price}
                      </span>
                    </div>
                    <p>{item.message}</p>
                    <span className="item-time">{timeString} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
            {(stats.recentActivity || []).length === 0 && (
              <p className="text-center text-muted py-4">No recent activity detected.</p>
            )}
          </div>

          <div className="account-health">
            <p>ACCOUNT HEALTH</p>
            <div className="health-status">
              <div className="status-indicator" style={{ background: stats.healthScore < 50 ? '#ef4444' : stats.healthScore < 80 ? '#f59e0b' : '#10b981' }} />
              <span>{stats.healthScore < 50 ? 'Critical' : stats.healthScore < 80 ? 'Warning' : 'Optimum'} {stats.healthScore}/100</span>
            </div>
            <p className="health-desc">
              {stats.healthScore < 50 ? 'Multiple wasteful subscriptions detected.' : stats.healthScore < 80 ? 'Some optimization recommended.' : 'You have an optimized portfolio!'}
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <BudgetTracker stats={stats} />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <SavingsSimulator />
          </div>
        </div>
      </div>

      <div className="billing-cycle card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="section-header">
            <h3>Upcoming Billing Cycle</h3>
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
        <div>
          <div className="section-header">
            <h3>Category Breakdown</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie 
                  data={stats.pieChart} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5}
                >
                  {stats.pieChart.map((entry, index) => {
                    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
          overflow: hidden;
        }

        .item-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          background: white;
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

        .behavior-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .behavior-pill {
          background: white;
          border: 1px solid var(--border);
          padding: 1rem;
          border-radius: 1rem;
          transition: transform 0.2s;
        }
        .behavior-pill:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        
        .pill-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .pill-head span { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
        
        .pill-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .food .pill-icon { background: #fee2e2; color: #ef4444; }
        .behavioral .pill-icon { background: #fef3c7; color: #f59e0b; }
        .shopping .pill-icon { background: #dcfce7; color: #10b981; }
        .empty .pill-icon { background: #f1f5f9; color: #94a3b8; }
        
        .behavior-pill p { font-size: 0.75rem; font-weight: 600; line-height: 1.4; color: #334155; margin: 0; }
        
        @media (max-width: 768px) {
          .behavior-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
