import React from 'react';
import { Search, Bell, Plus, LayoutGrid, LogOut, X, CreditCard, DollarSign, Globe } from 'lucide-react';
import { useUser, SignOutButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const AddSubscriptionModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    plan: 'Premium',
    logo: 'https://www.cdnlogo.com/logos/n/11/netflix.svg',
    color: '#6366f1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        onClose();
        window.location.reload(); // Quick reset for hackathon
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card fade-in">
        <div className="modal-header">
          <div className="modal-title-desc">
            <h3>Add Subscription</h3>
            <p>Enter the details of your new service.</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><CreditCard size={14} /> Service Name</label>
            <input 
              type="text" 
              placeholder="e.g. Netflix, Spotify" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><DollarSign size={14} /> Monthly Price</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                required 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label><LayoutGrid size={14} /> Plan Type</label>
              <input 
                type="text" 
                placeholder="e.g. Premium, Basic" 
                value={formData.plan}
                onChange={(e) => setFormData({...formData, plan: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label><Globe size={14} /> Logo URL (Optional)</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={formData.logo}
              onChange={(e) => setFormData({...formData, logo: e.target.value})}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Header = ({ activeTab, onLoginClick }) => {
  const { user, isSignedIn } = useUser();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [showAddModal, setShowAddModal] = useState(false);


  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        console.log("[Frontend Checkpoint] Starting user sync to backend...");
        setSyncStatus('syncing');
        
        try {
          const response = await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              fullName: user.fullName,
              imageUrl: user.imageUrl,
            }),
          });

          const data = await response.json();
          if (data.success) {
            console.log("✅ [Frontend Checkpoint] User synced to database successfully");
            setSyncStatus('success');
          } else {
            console.error("❌ [Frontend Checkpoint] Sync failed:", data.error);
            setSyncStatus('error');
          }
        } catch (error) {
          console.error("❌ [Frontend Checkpoint] Sync error:", error.message);
          setSyncStatus('error');
        }
      }
    };

    syncUser();
  }, [isSignedIn, user]);

  const handleAvatarClick = () => {
    if (!isSignedIn) {
      onLoginClick();
    }
  };


  return (
    <header className="header">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search subscriptions..." />
      </div>

      <nav className="header-nav">
        <a href="#" className="nav-link">Premium</a>
        <a href="#" className={`nav-link ${activeTab === 'insights' ? 'active' : ''}`}>Activity</a>
        <a href="#" className="nav-link">Support</a>
      </nav>

      <div className="header-actions">
        <SignedIn>
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add New</span>
          </button>
        </SignedIn>

        
        <div className="divider-vertical" />
        
        <div className="auth-section">
          <SignedOut>
            <div 
              className="avatar-small not-signed-in" 
              onClick={handleAvatarClick}
              title="Click to sign in"
            >
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" 
                alt="Avatar" 
              />
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="user-info">
              <div className="avatar-small">
                <img src={user?.imageUrl} alt={user?.fullName} />
              </div>
              <SignOutButton>
                <button className="logout-button" title="Sign Out">
                  <LogOut size={16} />
                </button>
              </SignOutButton>
            </div>
          </SignedIn>

        </div>
      </div>

      {showAddModal && (
        <AddSubscriptionModal onClose={() => setShowAddModal(false)} />
      )}

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 0;
          margin-bottom: 2rem;
          background: transparent;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid var(--border);
          padding: 0 1rem;
          height: 44px;
          border-radius: 12px;
          flex: 0 1 320px;
          gap: 0.75rem;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s;
        }

        .search-bar:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 0.9rem;
          color: var(--text-main);
          height: 100%;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          margin: 0 2rem;
        }

        .nav-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: all 0.2s;
          padding: 0.5rem 0;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .nav-link.active {
          color: var(--text-main);
          font-weight: 600;
          position: relative;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          border-radius: 1px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .add-button {
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1.25rem;
          height: 44px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          white-space: nowrap;
        }

        .add-button:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .icon-button {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          position: relative;
          background: white;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .icon-button:hover {
          background: #f8fafc;
          border-color: var(--primary-light);
          color: var(--primary);
        }

        .notification-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .divider-vertical {
          width: 2px;
          height: 24px;
          background: var(--border);
          margin: 0 0.5rem;
          border-radius: 2px;
        }

        .auth-section {
          display: flex;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-small {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-small:hover {
          transform: scale(1.05);
          border-color: var(--primary);
        }

        .avatar-small.not-signed-in {
          border-color: #e2e8f0;
          background: #f8fafc;
        }

        .avatar-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .user-details-text {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.2;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.2;
        }

        .sync-indicator {
          font-size: 0.65rem;
          color: var(--primary);
          font-weight: 500;
          margin-top: 2px;
          opacity: 0.8;
        }

        .sync-indicator.success {
          color: #10b981;
        }

        .logout-button {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background: #f1f5f9;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .logout-button:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: translateY(-1px);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          background: white;
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .modal-title-desc h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .modal-title-desc p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .close-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background: #f1f5f9;
          border-radius: 50%;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .form-group input {
          width: 100%;
          height: 48px;
          padding: 0 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          font-size: 0.9rem;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        .primary-btn {
          background: var(--primary);
          color: white;
          padding: 0 1.5rem;
          height: 48px;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .secondary-btn {
          border: 1px solid var(--border);
          padding: 0 1.5rem;
          height: 48px;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }
      `}</style>

    </header>
  );
};

export default Header;


