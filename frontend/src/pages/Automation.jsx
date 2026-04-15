import React, { useState } from 'react';
import { Zap, MessageSquare, FileText, CheckCircle, Upload, ArrowRight, Mail, Loader2, Plus, X } from 'lucide-react';

const Automation = ({ userId }) => {
  const [results, setResults] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [addedIndices, setAddedIndices] = useState(new Set());
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '' });

  const handleEmailSync = async () => {
    setIsParsing(true);
    setResults(null);
    setAddedIndices(new Set());
    try {
      // Direct call to Gmail scan
      const response = await fetch(`http://localhost:5000/api/gmail/scan?userId=${userId}`);
      
      if (response.status === 401) {
        // Not authenticated with Google, get auth URL
        const authRes = await fetch(`http://localhost:5000/api/auth/google/url?userId=${userId}`);
        const { url } = await authRes.json();
        window.location.href = url; // Redirect to Google
        return;
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.detected);
      } else {
        alert("Failed to sync transactions.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during sync.");
    } finally {
      setIsParsing(false);
    }
  };

  // Phase 2: NEW Auto-fetch on mount
  React.useEffect(() => {
    if (userId && results === null) {
      handleEmailSync();
    }
  }, [userId]);

  const startEditing = (item, index) => {
    setEditingIndex(index);
    setEditForm({ name: item.name, price: item.price });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const submitAdd = async (item, index) => {
    const finalName = editForm.name.trim() || item.name;
    const finalPrice = editForm.price.trim() || item.price;
    
    try {
      const res = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item, // This now includes externalId
          name: finalName,
          price: finalPrice,
          userId,
          plan: 'Detected Alert',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      });
      if (res.ok) {
         setAddedIndices(prev => new Set(prev).add(index));
         setEditingIndex(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="automation-page fade-in">
      <div className="page-header">
        <h1>Smart Automation</h1>
        <p className="subtitle">Connect your accounts or parse transaction alerts to stay optimized.</p>
      </div>

      <div className="automation-grid">
        <div className="tool-card card">
          <div className="tool-header">
            <div className="icon-box sms"><MessageSquare size={24} /></div>
            <div>
              <h3>Email Parsing (India)</h3>
              <p>We'll scan your connected Gmail account for banking alerts from HDFC, ICICI, SBI</p>
            </div>
          </div>
          
          <div className="tool-body">
            {isParsing ? (
              <div className="modern-loading-container">
                <div className="radar-scanner">
                  <div className="radar-circle"></div>
                  <div className="radar-pulse"></div>
                  <Mail className="radar-icon" size={32} />
                </div>
                <div className="loading-status">
                  <p className="status-highlight">{
                    ['Connecting to Google Secure Server...', 
                     'Scanning for HDFC & ICICI alerts...', 
                     'Identifying debited amounts...', 
                     'Verifying merchant patterns...', 
                     'Finalizing detections...'][Math.floor((Date.now() / 2000) % 5)]
                  }</p>
                  <div className="mini-progress">
                    <div className="progress-fill"></div>
                  </div>
                  <p className="sub-status">This usually takes 5-10 seconds</p>
                </div>
              </div>
            ) : results && results.length > 0 ? (
              <div className="transactions-list slide-down">
                {results.map((r, i) => (
                  <div key={i} className={`bank-transaction-card ${addedIndices.has(i) ? 'added-state-card' : ''}`}>
                    <div className="txn-icon-container">
                      <div className={`up-arrow-circle ${addedIndices.has(i) ? 'success-circle' : ''}`}>
                         {addedIndices.has(i) ? <CheckCircle size={16} className="text-white" /> : <ArrowRight size={16} className="rotate-270" />}
                      </div>
                    </div>
                    <div className="txn-content">
                      {editingIndex === i ? (
                        <>
                          <div className="txn-main edit-mode">
                             <label className="edit-label">Vendor Name:</label>
                             <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="edit-input" placeholder={r.name} autoFocus />
                             <label className="edit-label mt-2">Cost (₹):</label>
                             <input type="text" name="price" value={editForm.price} onChange={handleEditChange} className="edit-input" placeholder={r.price} />
                          </div>
                          <div className="txn-amount-side edit-actions">
                             <button className="add-bank-btn w-full justify-center" onClick={() => submitAdd(r, i)}>Save</button>
                             <button className="secondary-btn-small w-full" onClick={() => setEditingIndex(null)}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="txn-main">
                            <h4>{r.name} Transaction Detected</h4>
                            <p className="txn-description">
                               Dear Customer, ₹{r.price} has been debited from your account toward {r.name}...
                            </p>
                            <span className="txn-date">
                              {r.date ? new Date(r.date).toLocaleDateString() : new Date().toLocaleDateString()}, 
                              {r.date ? new Date(r.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="txn-amount-side">
                            <div className="amount">
                              -₹{parseFloat(r.price).toFixed(2)}
                            </div>
                            <div className="debit-label">DEBIT</div>
                            {addedIndices.has(i) ? (
                              <button className="add-bank-btn added-btn" disabled>
                                 <CheckCircle size={14} /> Added
                              </button>
                            ) : (
                              <button className="add-bank-btn" onClick={() => startEditing(r, i)}>
                                 <Plus size={14} /> Add
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-sync-state">
                <p className="text-muted">No new banking transactions detected. Try again later.</p>
                <button className="secondary-btn w-full" onClick={handleEmailSync}>Refresh Sync</button>
              </div>
            )}
          </div>
        </div>

        {/* <div className="tool-card card">
          <div className="tool-header">
            <div className="icon-box statement"><FileText size={24} /></div>
            <div>
              <h3>Bank Statement Sync</h3>
              <p>Upload your CSV bank statement for bulk analysis.</p>
            </div>
          </div>
          <div className="tool-body centered">
            <div className="upload-placeholder">
              <Upload size={48} className="text-muted mb-4" />
              <p>Drag and drop bank statement (CSV/PDF)</p>
              <span className="text-small">Supported: HDFC, ICICI, SBI, AXIS</span>
            </div>
            <button className="secondary-btn w-full mt-4">Browse Files</button>
          </div>
        </div> */}

        <div className="promo-card glass-dark">
          <div className="promo-content">
             <Zap className="mb-4" fill="white" size={32} />
             <h2>Auto-Negotiator</h2>
             <p>Our AI agents can automatically talk to provider chat support to find hidden coupons or loyalty discounts for you.</p>
             <div className="feature-list">
               <div className="f-item"><CheckCircle size={14} /> Save up to ₹2,400/year</div>
               <div className="f-item"><CheckCircle size={14} /> 100% automated handling</div>
             </div>
             <button className="primary-btn mt-6">Activate Beta</button>
          </div>
        </div>
      </div>

      <style>{`
        .automation-page { display: flex; flex-direction: column; gap: 2rem; }
        .automation-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .tool-card { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .tool-header { display: flex; gap: 1.25rem; align-items: flex-start; }
        .icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .icon-box.sms { background: #3b82f6; }
        .icon-box.statement { background: #10b981; }
        .tool-header h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .transactions-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .transactions-list {
            grid-template-columns: 1fr;
          }
        }

        .bank-transaction-card {
          display: flex;
          gap: 1.25rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: 1rem;
          transition: all 0.2s;
        }

        .bank-transaction-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .bank-transaction-card.added-state-card {
          opacity: 0.8;
          border-color: #e2e8f0;
          background: #f8fafc;
        }

        .success-circle {
          background: #10b981 !important;
          color: white !important;
        }

        .add-bank-btn.added-btn {
          background: #10b981;
          pointer-events: none;
        }

        .edit-mode {
          display: flex;
          flex-direction: column;
        }
        
        .edit-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .edit-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
        }
        .edit-input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .edit-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          justify-content: center;
        }

        .secondary-btn-small {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.2s;
        }
        .secondary-btn-small:hover {
          background: #e2e8f0;
          color: #334155;
        }


        .txn-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .up-arrow-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #fdf2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
        }

        .txn-content {
          display: flex;
          flex: 1;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .txn-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 70%;
        }

        .txn-main h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .txn-description {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .txn-date {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .txn-amount-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          min-width: 100px;
        }

        .amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .debit-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #ef4444;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .add-bank-btn {
          background: #3b82f6;
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }

        .add-bank-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .rotate-270 { transform: rotate(-90deg); }

        .modern-loading-container {
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .radar-scanner {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #e0e7ff;
          border-radius: 50%;
        }

        .radar-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.15;
          animation: radar-pulse 2s cubic-bezier(0.21, 0.53, 0.56, 0.8) infinite;
        }

        .radar-icon {
          color: var(--primary);
          z-index: 10;
        }

        @keyframes radar-pulse {
          0% { transform: scale(0.5); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }

        .loading-status {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 300px;
        }

        .status-highlight {
          font-weight: 700;
          color: #1e293b;
          font-size: 0.95rem;
          margin: 0;
          height: 1.2rem;
        }

        .sub-status {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }

        .mini-progress {
          width: 100%;
          height: 4px;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          width: 30%;
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
          animation: indeterminate-progress 2s infinite ease-in-out;
        }

        @keyframes indeterminate-progress {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(400%); width: 30%; }
        }
        
        .upload-placeholder {
          flex: 1; border: 2px dashed #e2e8f0; border-radius: 1rem;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 3rem 1rem; text-align: center;
        }
        .text-small { font-size: 0.7rem; color: #94a3b8; margin-top: 0.5rem; }
        .centered { display: flex; flex-direction: column; justify-content: center; }
        
        .promo-card { grid-column: span 2; padding: 3rem; border-radius: 2rem; display: flex; }
        .promo-content { max-width: 500px; color: white; }
        .promo-content h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
        .promo-content p { opacity: 0.9; line-height: 1.6; margin-bottom: 2rem; }
        .feature-list { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
        .f-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; }
        .mt-6 { margin-top: 1.5rem; }
        .w-full { width: 100%; }
      `}</style>
    </div>
  );
};

export default Automation;
