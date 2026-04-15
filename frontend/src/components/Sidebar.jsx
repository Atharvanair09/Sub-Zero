import React from 'react';
import { LayoutDashboard, CreditCard, PieChart, Zap, Settings, HelpCircle, Scan, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const Sidebar = ({ activeTab, setActiveTab, onLoginClick, onScanClick }) => {
  const { user, isSignedIn } = useUser();
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { id: 'insights', icon: PieChart, label: 'Insights' },
    { id: 'automation', icon: Zap, label: 'Automation' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleProfileClick = () => {
    if (!isSignedIn && onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <Zap size={24} color="white" fill="white" />
        </div>
        <div className="logo-text">
          <h1>SubZero</h1>
          <span>AI OPTIMIZER</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {activeTab === item.id && <div className="active-indicator" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="scan-card">
          <p>Efficiency Scan</p>
          <button className="scan-button" onClick={onScanClick}>
            <Scan size={16} />
            <span>Scan for Savings</span>
          </button>
        </div>

        <button className="help-link">
          <HelpCircle size={20} />
          <span>Help Center</span>
        </button>

        <div 
          className={`user-profile ${!isSignedIn ? 'clickable' : ''}`} 
          onClick={handleProfileClick}
        >
          <div className="avatar-container">
            <img
              src={isSignedIn ? user?.imageUrl : "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
              alt="User avatar"
              className="avatar"
            />
            {isSignedIn && <div className="status-indicator online" />}
          </div>
          <div className="user-info">
            <p className="user-name">{isSignedIn ? user?.fullName : "Guest User"}</p>
            <p className="user-plan">{isSignedIn ? "Pro Plan" : "Sign in to sync"}</p>
          </div>
        </div>
      </div>



      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 2rem 1rem;
          z-index: 100;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem 2.5rem;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .logo-text h1 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-main);
          line-height: 1.1;
        }

        .logo-text span {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .sidebar-nav {
          flex: 1;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 0.5rem;
          position: relative;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: var(--text-main);
        }

        .nav-item.active {
          color: var(--primary);
          background: #eef2ff;
        }

        .active-indicator {
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: var(--primary);
          border-radius: 4px 0 0 4px;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .scan-card {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
        }

        .scan-card p {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .scan-button {
          width: 100%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 0.65rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .help-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.5rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          transition: all 0.2s ease;
        }

        .user-profile.clickable:hover {
          cursor: pointer;
          opacity: 0.8;
          transform: translateY(-1px);
        }

        .avatar-container {
          position: relative;
          display: flex;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f1f5f9;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .status-indicator.online {
          background: #10b981;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }

        .user-plan {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
