import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, ArrowUpRight, Download, Calendar, Tag, ChevronDown, CheckCircle2 } from 'lucide-react';

const Transactions = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || t.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', 'Entertainment', 'Food', 'Music', 'Shopping', 'Travel', 'Streaming', 'Bank Transaction'];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = userId 
          ? `http://localhost:5000/api/transactions?userId=${userId}` 
          : 'http://localhost:5000/api/transactions';
        const response = await fetch(url);
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error("Fetch transactions error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [userId]);

  const totalThisMonth = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const avgTransaction = transactions.length > 0 ? totalThisMonth / transactions.length : 0;
  
  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="transactions-page fade-in">
      <div className="page-header">
        <div className="header-main">
          <div>
            <p className="subtitle">SPENDING HISTORY</p>
            <h1>Transactions</h1>
          </div>
          <button className="export-btn">
            <Download size={18} />
            Export Statement
          </button>
        </div>

        <div className="metrics-row">
          <div className="metric-card card">
            <p>Total This Month</p>
            <div className="metric-value">
              <h2>₹{totalThisMonth.toFixed(2)}</h2>
              <span className="trend positive">+12% vs last month</span>
            </div>
          </div>
          <div className="metric-card card">
            <p>Avg. Per Transaction</p>
            <div className="metric-value">
              <h2>₹{avgTransaction.toFixed(2)}</h2>
              <span className="trend">Stable</span>
            </div>
          </div>
          <div className="metric-card card">
            <p>Total Transactions</p>
            <div className="metric-value">
              <h2>{transactions.length}</h2>
              <span className="trend negative">Volume</span>
            </div>
          </div>
        </div>
      </div>

      <div className="table-controls card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search merchants, services..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-select">
            <Filter size={16} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <button className="date-picker">
            <Calendar size={16} />
            Last 30 Days
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="transactions-table-container card">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>RECIPIENT</th>
              <th>CATEGORY</th>
              <th>DATE</th>
              <th>METHOD</th>
              <th>STATUS</th>
              <th className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t._id}>
                <td>
                  <div className="recipient-info">
                    <div className="recipient-avatar" style={t.logo ? { background: 'transparent' } : {}}>
                      {t.logo ? (
                        <img src={t.logo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                      ) : (
                        t.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="recipient-name">{t.name}</span>
                  </div>
                </td>
                <td>
                  <span className="category-pill">{t.category}</span>
                </td>
                <td className="date-cell">{new Date(t.date).toLocaleDateString()}</td>
                <td>
                  <span className="method-cell">{t.method || 'Detected Alert'}</span>
                </td>
                <td>
                  <span className={`status-pill ${(t.status || 'Completed').toLowerCase()}`}>
                    {(t.status || 'Completed') === 'Completed' && <CheckCircle2 size={12} />}
                    {t.status || 'Completed'}
                  </span>
                </td>
                <td className="amount-cell text-right">
                  -₹{t.amount.toLocaleString()}
                  <ArrowUpRight size={14} className="outflow-icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="empty-table">
            <p>No transactions found matching your criteria.</p>
          </div>
        )}
      </div>

      <style>{`
        .transactions-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin: 0.5rem 0 0;
        }

        .subtitle {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .metric-card {
          padding: 1.5rem;
        }

        .metric-card p {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .metric-value {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .metric-value h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
        }

        .trend {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .trend.positive { color: #10b981; }
        .trend.negative { color: #f43f5e; }

        .table-controls {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8fafc;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }

        .search-box input {
          background: transparent;
          border: none;
          width: 100%;
          font-size: 0.9rem;
          color: #1e293b;
        }

        .search-box input:focus { outline: none; }

        .filter-group {
          display: flex;
          gap: 1rem;
        }

        .filter-select, .date-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
        }

        .filter-select select {
          border: none;
          background: transparent;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }

        .filter-select select:focus { outline: none; }

        .transactions-table-container {
          padding: 0;
          overflow: hidden;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .transactions-table th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        .transactions-table td {
          padding: 1.25rem 1.5rem;
          font-size: 0.9rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .recipient-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .recipient-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #eff6ff;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .recipient-name {
          font-weight: 700;
          color: #1e293b;
        }

        .category-pill {
          background: #f1f5f9;
          color: #475569;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .date-cell, .method-cell {
          color: #64748b;
          font-weight: 500;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-pill.completed { background: #dcfce7; color: #15803d; }
        .status-pill.failed { background: #fee2e2; color: #b91c1c; }

        .amount-cell {
          font-weight: 800;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .outflow-icon {
          color: #94a3b8;
        }

        .text-right { text-align: right; }

        .empty-table {
          padding: 4rem;
          text-align: center;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default Transactions;
