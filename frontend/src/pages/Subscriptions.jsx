import React from 'react';
import { CreditCard, Zap, ShieldAlert, Check, X, ArrowRight, ExternalLink } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const subscriptions = [
  {
    id: 1,
    name: 'Netflix',
    logo: 'https://www.cdnlogo.com/logos/n/11/netflix.svg',
    price: 19.99,
    plan: 'PREMIUM 4K',
    nextBill: 'Oct 24',
    status: 'Active Status',
    lastActivity: '2 days ago',
    alert: null,
    color: '#E50914'
  },
  {
    id: 2,
    name: 'Adobe CC',
    logo: 'https://www.cdnlogo.com/logos/a/82/adobe-creative-cloud.svg',
    price: 54.99,
    plan: 'UNUSED',
    nextBill: 'Oct 21',
    status: 'Idle - Alert',
    lastActivity: 'No activity in last 28 days',
    alert: 'UNUSED WARNING',
    potentialSavings: '$650/year',
    color: '#FA0F00'
  },
  {
    id: 3,
    name: 'Spotify',
    logo: 'https://www.cdnlogo.com/logos/s/17/spotify.svg',
    price: 16.99,
    plan: 'FAMILY PLAN',
    nextBill: 'Nov 02',
    status: 'Active Status',
    lastActivity: 'Today via "Alex\'s iPhone"',
    alert: null,
    color: '#1DB954'
  },
  {
    id: 4,
    name: 'Dropbox',
    logo: 'https://www.cdnlogo.com/logos/d/15/dropbox.svg',
    price: 11.99,
    plan: 'PLUS 2TB',
    nextBill: 'Oct 30',
    status: 'Active Status',
    lastActivity: '6 days ago',
    alert: null,
    color: '#0061FF'
  }
];

const forecastData = [
  { value: 100 }, { value: 200 }, { value: 150 }, { value: 300 }, 
  { value: 250 }, { value: 180 }, { value: 450 }, { value: 400 }
];

const Subscriptions = () => {
  return (
    <div className="subscriptions fade-in">
      <div className="page-header">
        <p className="subtitle">PORTFOLIO OVERVIEW</p>
        <h1>Your Subscriptions</h1>
        <div className="summary-row">
          <div className="analysis-text">
            AI Analysis: You have <span>12 active services</span> totaling <span>$184.50/mo</span>.
            We've identified 3 unused platforms that could save you $42.00 monthly.
          </div>
          <div className="summary-stats">
            <div className="mini-stat">
              <p>Monthly Spend</p>
              <h3>$184.50</h3>
            </div>
            <div className="mini-stat">
              <p>Potential Savings</p>
              <h3 className="highlight">$42.00</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="subscription-grid">
        {subscriptions.map((sub) => (
          <div className="sub-card card" key={sub.id}>
            {sub.alert && <div className="unused-warning">{sub.alert}</div>}
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
                    <span className="bill-date">Next: {sub.nextBill}</span>
                  </div>
                </div>
              </div>
              <div className="sub-pricing">
                <span className="price">${sub.price}</span>
                <span className="period">Monthly bill</span>
              </div>
            </div>

            <div className="usage-section">
              <p className="section-label">USED RECENTLY?</p>
              <div className="usage-status">
                <p className={sub.alert ? 'text-danger' : 'text-muted'}>
                  {sub.lastActivity}
                  {sub.potentialSavings && <span className="savings-hint">. Save {sub.potentialSavings}.</span>}
                </p>
                <div className="binary-buttons">
                  <button className="btn-small active">YES</button>
                  <button className="btn-small">NO</button>
                </div>
              </div>
            </div>

            <div className="sub-footer">
              <div className="status-row">
                <div className={`status-dot ${sub.alert ? 'warning' : 'active'}`} />
                <span>{sub.status}</span>
              </div>
              <button className={`cancel-btn ${sub.alert ? 'danger' : ''}`}>CANCEL SUBSCRIPTION</button>
            </div>
          </div>
        ))}
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
