import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, ShieldAlert, Check, X, ArrowRight, ExternalLink } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const forecastData = [
  { value: 100 }, { value: 200 }, { value: 150 }, { value: 300 }, 
  { value: 250 }, { value: 180 }, { value: 450 }, { value: 400 }
];

const Subscriptions = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const url = userId 
        ? `http://localhost:5000/api/subscriptions?userId=${userId}` 
        : 'http://localhost:5000/api/subscriptions';
      const response = await fetch(url);
      const data = await response.json();
      setSubscriptions(data);
      
      // Fetch recommendations
      if (userId) {
        const recResponse = await fetch(`http://localhost:5000/api/recommendations?userId=${userId}`);
        const recData = await recResponse.json();
        setRecommendations(recData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load subscriptions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const handleUsageToggle = async (id, usedRecently) => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, usedRecently })
      });
      const data = await response.json();
      if (data.success) {
        setSubscriptions(prev => prev.map(sub => sub._id === id ? { ...sub, usedRecently } : sub));
        // Refresh recommendations after usage update
        const recResponse = await fetch(`http://localhost:5000/api/recommendations?userId=${userId}`);
        const recData = await recResponse.json();
        setRecommendations(recData);
      }
    } catch (err) {
      console.error("Usage toggle error:", err);
    }
  };

  const handleCancel = async (id, name) => {
    if (window.confirm(`Are you sure you want to cancel ${name}?`)) {
      try {
        const response = await fetch('http://localhost:5000/api/subscriptions/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
          alert(`Successfully cancelled ${name}`);
          setSubscriptions(prev => prev.filter(sub => sub._id !== id));
        }
      } catch (err) {
        console.error("Cancel error:", err);
      }
    }
  };

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const potentialSavings = subscriptions
    .filter(sub => !sub.usedRecently)
    .reduce((sum, sub) => sum + sub.price, 0);

  if (loading) return <div className="loading">Analyzing your portfolio...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="subscriptions fade-in">
      <div className="page-header">
        <p className="subtitle">PORTFOLIO OVERVIEW</p>
        <h1>Your Subscriptions</h1>
        <div className="summary-row">
          <div className="analysis-text">
            AI Analysis: You have <span>{subscriptions.length} active services</span> totaling <span>₹{totalMonthlySpend.toFixed(2)}/mo</span>.
            {potentialSavings > 0 && (
              <> We've identified unused platforms that could save you <span>₹{potentialSavings.toFixed(2)} monthly</span>.</>
            )}
          </div>
          <div className="summary-stats">
            <div className="mini-stat">
              <p>Monthly Spend</p>
              <h3>₹{totalMonthlySpend.toFixed(2)}</h3>
            </div>
            <div className="mini-stat">
              <p>Potential Savings</p>
              <h3 className="highlight">₹{potentialSavings.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="subscription-grid">
        {subscriptions.map((sub) => {
          const rec = recommendations.find(r => r.subscriptionId === sub._id);
          return (
            <div className="sub-card card" key={sub._id}>
              {rec && <div className="unused-warning">AI: {rec.type.toUpperCase()} RECOMMENDATION</div>}
              <div className="sub-top">
                <div className="sub-branding">
                  <div className="sub-logo" style={{ background: '#f8fafc' }}>
                    <img src={sub.logo} alt={sub.name} onError={(e) => {e.target.style.display='none';}} />
                  </div>
                  <div className="sub-names">
                    <h3>{sub.name}</h3>
                    <div className="plan-badge">
                      <span className="badge-text">{sub.plan}</span>
                      <span className="dot">•</span>
                      <span className="bill-date">Next: {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="sub-pricing">
                  <span className="price">₹{sub.price}</span>
                  <span className="period">Monthly bill</span>
                </div>
              </div>

              {rec && (rec.type === 'downgrade' || rec.type === 'alternative') && (
                <div className="optimization-banner">
                  <div className="opt-text">
                    <strong>Optimization Detected</strong>
                    <span>Save ₹{rec.savings}/mo by switching to {rec.targetPlan}</span>
                  </div>
                  <button className="opt-action">Switch & Save</button>
                </div>
              )}

              <div className="usage-section">
                <p className="section-label">USED RECENTLY?</p>
                <div className="usage-status">
                  <div className="usage-info">
                    <p className={!sub.usedRecently ? 'text-danger' : 'text-muted'}>
                      Last used: {new Date(sub.lastUsed).toLocaleDateString()}
                    </p>
                    {rec && (
                      <p className="ai-insight">
                        <Zap size={12} fill="#ef4444" color="#ef4444" />
                        <span>{rec.message}</span>
                      </p>
                    )}
                  </div>
                  <div className="binary-buttons">
                    <button 
                      className={`btn-small ${sub.usedRecently ? 'active' : ''}`}
                      onClick={() => handleUsageToggle(sub._id, true)}
                    >
                      YES
                    </button>
                    <button 
                      className={`btn-small ${!sub.usedRecently ? 'active-no' : ''}`}
                      onClick={() => handleUsageToggle(sub._id, false)}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>

              <div className="sub-footer">
                <div className="status-row">
                  <div className={`status-dot ${!sub.usedRecently ? 'warning' : 'active'}`} />
                  <span>{sub.status}</span>
                </div>
                <button 
                  className={`cancel-btn ${rec?.type === 'cancel' ? 'danger' : ''}`}
                  onClick={() => handleCancel(sub._id, sub.name)}
                >
                  CANCEL SUBSCRIPTION
                </button>
              </div>
            </div>
          );
        })}
        {subscriptions.length === 0 && (
          <div className="empty-state card">
            <Check size={48} color="#10b981" />
            <h3>No more subscriptions!</h3>
            <p>You've optimized your portfolio successfully.</p>
          </div>
        )}
      </div>

      <div className="forecast-section">
        <div className="forecast-card card">
          <h3>Saving Forecast</h3>
          <p>Based on your usage patterns over the last 90 days.</p>
          <div className="chart-wrapper">
             <ResponsiveContainer width="100%" height={120}>
              <BarChart data={forecastData}>
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={40}>
                  {forecastData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === forecastData.length - 1 ? '#6366f1' : '#e2e8f0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="forecast-footer">
            <p>Estimated Yearly Savings: <span>$504.00</span></p>
            <button className="view-report">View Detailed Report</button>
          </div>
        </div>

        <div className="concierge-card glass-dark">
          <Zap className="concierge-icon" fill="white" size={24} />
          <h2>AI Concierge is ready.</h2>
          <p>
            Let our agent negotiate better rates for your current active services automatically.
          </p>
          <button className="action-btn">Activate Auto-Negotiate</button>
        </div>
      </div>

      <style>{`
        .subscriptions {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin: 0.5rem 0 1rem;
        }

        .subtitle {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .analysis-text {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 600px;
          line-height: 1.5;
        }

        .analysis-text span {
          color: var(--primary);
          font-weight: 700;
        }

        .summary-stats {
          display: flex;
          gap: 1.5rem;
        }

        .mini-stat {
          background: white;
          padding: 1.25rem 2rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .mini-stat p {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .mini-stat h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .mini-stat h3.highlight {
          color: var(--primary);
        }

        .subscription-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .sub-card {
          position: relative;
          padding: 2rem;
          transition: transform 0.2s;
        }

        .sub-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
        }

        .unused-warning {
          position: absolute;
          top: 0;
          right: 0;
          background: #1e1b4b;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.4rem 0.8rem;
          border-radius: 0 1.25rem 0 0.75rem;
        }

        .sub-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .sub-branding {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .sub-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }

        .sub-logo img {
          max-width: 100%;
          max-height: 100%;
        }

        .sub-names h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .plan-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .badge-text {
          background: #f1f5f9;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-size: 0.6rem;
          color: #475569;
        }

        .price {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          text-align: right;
        }

        .period {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: right;
          display: block;
        }

        .optimization-banner {
          background: linear-gradient(135deg, #f0f7ff, #e0e7ff);
          border: 1px solid #c7d2fe;
          border-radius: 1rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          animation: slideDown 0.3s ease-out;
        }

        .opt-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .opt-text strong {
          font-size: 0.85rem;
          color: #4338ca;
          font-weight: 700;
        }

        .opt-text span {
          font-size: 0.75rem;
          color: #6366f1;
          font-weight: 600;
        }

        .opt-action {
          background: #4338ca;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .opt-action:hover {
          background: #3730a3;
        }

        .usage-section {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
        }

        .section-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          letter-spacing: 0.05em;
        }

        .usage-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .usage-status p {
          font-size: 0.8rem;
          font-weight: 500;
          max-width: 60%;
        }

        .text-danger { color: #ef4444; }
        .savings-hint { font-weight: 700; }

        .binary-buttons {
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .btn-small {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .btn-small.active {
          background: #eff6ff;
          color: #3b82f6;
        }

        .btn-small.active-no {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fee2e2;
        }

        .ai-insight {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #ef4444;
          margin-top: 0.4rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
          gap: 1rem;
          background: white;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .empty-state p {
          color: var(--text-muted);
          margin: 0;
        }

        .sub-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.active { background: #3b82f6; }
        .status-dot.warning { background: #ef4444; }

        .cancel-btn {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.05em;
        }

        .cancel-btn.danger { color: #be123c; }

        .forecast-section {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
        }

        .forecast-card {
          padding: 2rem;
        }

        .forecast-card h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .forecast-card p { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; }

        .forecast-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .forecast-footer p {
          margin-bottom: 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .forecast-footer span {
          color: var(--primary);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .view-report {
          background: #f1f5f9;
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .concierge-card {
          padding: 2rem;
          border-radius: 1.5rem;
          background: linear-gradient(135deg, #4f46e5, #9333ea);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
        }

        .concierge-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem;
          border-radius: 10px;
          margin-bottom: 0.5rem;
        }

        .concierge-card h2 { font-size: 1.5rem; margin-top: 0; }
        .concierge-card p { font-size: 0.95rem; opacity: 0.9; line-height: 1.5; }

        .concierge-card .action-btn {
          margin-top: auto;
          background: white;
          color: var(--primary-dark);
          padding: 0.85rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Subscriptions;
