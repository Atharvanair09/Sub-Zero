import React from 'react';
import { Search, Bell, Plus, LayoutGrid, LogOut, X, CreditCard, DollarSign, Globe } from 'lucide-react';
import { useUser, SignOutButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const SERVICE_PRESETS = [
  { name: 'Netflix', prices: ['199', '499', '649'], logo: 'https://www.google.com/s2/favicons?sz=128&domain=netflix.com', color: '#E50914' },
  { name: 'Spotify', prices: ['119', '149', '179'], logo: 'https://www.google.com/s2/favicons?sz=128&domain=spotify.com', color: '#1DB954' },
  { name: 'Adobe CC', prices: ['638', '2394', '4230'], logo: 'https://www.google.com/s2/favicons?sz=128&domain=adobe.com', color: '#FA0F00' },
  { name: 'Dropbox', prices: ['800', '1500', '2100'], logo: 'https://www.google.com/s2/favicons?sz=128&domain=dropbox.com', color: '#0061FF' },
  { name: 'Disney+', prices: ['149', '299', '899'], logo: 'https://www.google.com/s2/favicons?sz=128&domain=disneyplus.com', color: '#111827' },
  { name: 'YouTube Premium', prices: ['129', '139', '189'], logo: 'https://www.google.com/s2/favicons?sz=128&domain=youtube.com', color: '#FF0000' },
];

const AddSubscriptionModal = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    plan: 'Premium',
    logo: '',
    color: '#6366f1',
    category: 'Entertainment',
    billingCycle: 'monthly'
  });
  const [isCustom, setIsCustom] = useState(false);
  const [availablePrices, setAvailablePrices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceChange = (e) => {
    const selectedName = e.target.value;
    if (selectedName === 'custom') {
      setIsCustom(true);
      setAvailablePrices([]);
      setFormData({ ...formData, name: '', price: '', logo: '', color: '#6366f1' });
    } else {
      setIsCustom(false);
      const preset = SERVICE_PRESETS.find(p => p.name === selectedName);
      if (preset) {
        setAvailablePrices(preset.prices);
        setFormData({
          ...formData,
          name: preset.name,
          price: preset.prices[0],
          logo: preset.logo,
          color: preset.color,
          category: 'Streaming',
          billingCycle: 'monthly'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      const data = await response.json();
      if (data.success) {
        onClose();
        window.location.reload(); 
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
            <p>Select a service or enter details manually.</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><Plus size={14} /> Service Selection</label>
            <select 
              className="service-select" 
              onChange={handleServiceChange}
              defaultValue=""
            >
              <option value="" disabled>Choose a popular service...</option>
              {SERVICE_PRESETS.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
              <option value="custom">-- Custom Service --</option>
            </select>
          </div>

          {isCustom && (
            <div className="form-group slide-down">
              <label><CreditCard size={14} /> Custom Service Name</label>
              <input 
                type="text" 
                placeholder="Name of service" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label><DollarSign size={14} /> Monthly Price (₹)</label>
              {availablePrices.length > 0 ? (
                <select 
                  className="price-select"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                >
                  {availablePrices.map(p => (
                    <option key={p} value={p}>₹{p}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  required 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              )}
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
            <label><Globe size={14} /> Logo URL</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={formData.logo}
              onChange={(e) => setFormData({...formData, logo: e.target.value})}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={isSubmitting || (!formData.name && !isCustom)}>
              {isSubmitting ? 'Adding...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import NotificationList from './NotificationList';

const Header = ({ activeTab, onLoginClick }) => {
  const { user, isSignedIn } = useUser();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        // Toggle unread status check
        fetch(`http://localhost:5000/api/notifications?userId=${user.id}`)
          .then(res => res.json())
          .then(data => setHasUnread(data.some(n => !n.read)))
          .catch(console.error);

        console.log("[Frontend Checkpoint] Starting user sync to backend...");
        setSyncStatus('syncing');
        
        try {
          const response = await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
  }, [isSignedIn, user, showNotifications]);

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
          <div style={{ position: 'relative' }}>
            <button 
              className={`notification-btn ${hasUnread ? 'has-unread' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {hasUnread && <span className="unread-dot" />}
            </button>
            {showNotifications && (
              <NotificationList userId={user?.id} onClose={() => setShowNotifications(false)} />
            )}
          </div>

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
        <AddSubscriptionModal userId={user?.id} onClose={() => setShowAddModal(false)} />
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

        .notification-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          position: relative;
          background: white;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .notification-btn:hover {
          background: #f8fafc;
          border-color: var(--primary-light);
          color: var(--primary);
        }

        .notification-btn.has-unread {
          color: var(--primary);
          border-color: var(--primary-light);
          background: #f5f7ff;
        }

        .unread-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
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

        .form-group input, .form-group select {
          width: 100%;
          height: 48px;
          padding: 0 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          font-size: 0.9rem;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
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

        .service-select, .price-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.25rem;
        }

        .slide-down {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </header>
  );
};

export default Header;
